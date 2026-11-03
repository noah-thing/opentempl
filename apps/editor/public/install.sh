#!/bin/sh
# Installs the OpenTempl desktop app on macOS or Linux:
#
#   curl -fsSL https://opentempl.org/install.sh | sh
#
# It downloads the latest build from https://github.com/noah-thing/opentempl/releases,
# checks it against the release's SHA256SUMS.txt and installs it. Run it again to update.
#
#   OPENTEMPL_VERSION=0.1.0   install that version instead of the latest
#   OPENTEMPL_APPIMAGE=1      on Linux, skip apt and install the AppImage for this user only
#   OPENTEMPL_NO_OPEN=1       do not start the app afterwards
set -eu

REPO=noah-thing/opentempl
RELEASES="https://github.com/$REPO/releases"

say() { printf '%s\n' "$*"; }
fail() { printf 'OpenTempl: %s\n' "$*" >&2; exit 1; }
has() { command -v "$1" >/dev/null 2>&1; }

has curl || fail "curl is needed to download the app."

tmp=$(mktemp -d)
mnt=""
cleanup() {
  [ -n "$mnt" ] && hdiutil detach -quiet "$mnt" 2>/dev/null
  rm -rf "$tmp"
}
trap cleanup EXIT
trap 'exit 130' INT TERM

if [ -n "${OPENTEMPL_VERSION:-}" ]; then
  version=${OPENTEMPL_VERSION#v}
else
  # /releases/latest redirects to the newest tag. Following it avoids the API and its hourly limit.
  latest=$(curl -fsSLI -o /dev/null -w '%{url_effective}' "$RELEASES/latest") || fail "could not reach GitHub."
  version=${latest##*/tag/v}
  case "$version" in
    [0-9]*) ;;
    *) fail "could not find the latest release." ;;
  esac
fi

fetch() {
  say "Downloading $1"
  curl -fL --progress-bar -o "$tmp/$1" "$RELEASES/download/v$version/$1" || fail "download failed: $1"
}

verify() {
  curl -fsSL -o "$tmp/SHA256SUMS.txt" "$RELEASES/download/v$version/SHA256SUMS.txt" || fail "could not download the checksums."
  want=$(awk -v f="$1" '$2 == f || $2 == "*" f { print $1 }' "$tmp/SHA256SUMS.txt")
  [ -n "$want" ] || fail "$1 is missing from the checksums."
  if has sha256sum; then
    got=$(sha256sum "$tmp/$1" | awk '{ print $1 }')
  else
    got=$(shasum -a 256 "$tmp/$1" | awk '{ print $1 }')
  fi
  [ "$got" = "$want" ] || fail "$1 does not match its checksum. Nothing was installed."
}

install_mac() {
  # A shell started under Rosetta reports x86_64 on Apple silicon, so ask the hardware.
  if [ "$(/usr/sbin/sysctl -in hw.optional.arm64 2>/dev/null)" = 1 ]; then arch=arm64; else arch=x64; fi
  file="OpenTempl-$version-mac-$arch.dmg"
  fetch "$file"
  verify "$file"

  dest=/Applications
  if [ ! -w "$dest" ]; then
    dest="$HOME/Applications"
    mkdir -p "$dest"
  fi

  mnt="$tmp/mnt"
  mkdir -p "$mnt"
  hdiutil attach -nobrowse -readonly -quiet -mountpoint "$mnt" "$tmp/$file" || fail "could not open $file."

  if pgrep -xq OpenTempl; then
    say "Closing OpenTempl to replace it"
    osascript -e 'quit app "OpenTempl"' >/dev/null 2>&1 || true
    sleep 2
  fi
  rm -rf "$dest/OpenTempl.app"
  ditto "$mnt/OpenTempl.app" "$dest/OpenTempl.app"
  hdiutil detach -quiet "$mnt" && mnt=""
  # curl does not mark downloads, but clear the flag anyway so Gatekeeper never stops the unsigned build.
  xattr -dr com.apple.quarantine "$dest/OpenTempl.app" 2>/dev/null || true

  say "Installed OpenTempl $version in $dest"
  [ -n "${OPENTEMPL_NO_OPEN:-}" ] || open "$dest/OpenTempl.app"
}

install_deb() {
  file="OpenTempl-$version-linux-x64.deb"
  fetch "$file"
  verify "$file"
  # apt treats an argument with a slash as a file, and installs what the package depends on.
  $sudo apt-get install -y "$tmp/$file" || fail "apt could not install $file."
  say "Installed OpenTempl $version"
  launch opentempl
}

install_appimage() {
  file="OpenTempl-$version-linux-x64.AppImage"
  data=${XDG_DATA_HOME:-$HOME/.local/share}
  home="$data/opentempl"
  bin="$HOME/.local/bin"
  fetch "$file"
  verify "$file"

  # Unpacked once here, the app runs without FUSE, which many distributions no longer ship.
  chmod +x "$tmp/$file"
  (cd "$tmp" && "./$file" --appimage-extract >/dev/null) || fail "could not unpack $file."
  rm -rf "$home/app"
  mkdir -p "$home" "$bin" "$data/applications"
  mv "$tmp/squashfs-root" "$home/app"
  cp -L "$home/app/.DirIcon" "$home/icon.png" 2>/dev/null ||
    curl -fsSL -o "$home/icon.png" https://opentempl.org/app-icon-512.png || true

  cat >"$bin/opentempl" <<EOF
#!/bin/sh
# Ubuntu 24.04 and later keep Chromium's sandbox from starting outside a system package.
if [ "\$(cat /proc/sys/kernel/apparmor_restrict_unprivileged_userns 2>/dev/null)" = 1 ]; then
  set -- --no-sandbox "\$@"
fi
exec "$home/app/opentempl" "\$@"
EOF
  chmod +x "$bin/opentempl"

  cat >"$data/applications/opentempl.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=OpenTempl
Comment=Free, open source design tool
Exec="$bin/opentempl" %U
Icon=$home/icon.png
Terminal=false
Categories=Graphics;
StartupWMClass=OpenTempl
EOF
  has update-desktop-database && update-desktop-database "$data/applications" >/dev/null 2>&1 || true

  say "Installed OpenTempl $version in $home"
  case ":$PATH:" in
    *":$bin:"*) ;;
    *) say "Add $bin to your PATH to start it with: opentempl" ;;
  esac
  launch "$bin/opentempl"
}

launch() {
  [ -z "${OPENTEMPL_NO_OPEN:-}" ] || return 0
  [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ] || return 0
  nohup "$1" >/dev/null 2>&1 &
}

case "$(uname -s)" in
  Darwin)
    install_mac
    ;;
  Linux)
    [ "$(uname -m)" = x86_64 ] || fail "there is only an x86_64 build for Linux so far. Use https://opentempl.org in the browser."
    if [ "$(id -u)" = 0 ]; then sudo=""; else sudo=sudo; fi
    if [ -z "${OPENTEMPL_APPIMAGE:-}" ] && has apt-get && has dpkg && { [ -z "$sudo" ] || has sudo; }; then
      install_deb
    else
      install_appimage
    fi
    ;;
  *)
    fail "this installer is for macOS and Linux. On Windows run: irm https://opentempl.org/install.ps1 | iex"
    ;;
esac
