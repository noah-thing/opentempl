import { useEffect, useMemo, useRef, useState } from 'react';
import { navigate } from '../App';
import { Wordmark } from '../ui/Logo';
import { Icon } from '../ui/icons';
import { createDesign } from '../io/designs';
import { pickFiles } from '../io/upload';
import { useBrand } from '../panels/brand';
import { loadLooks, sampleUrl, styleRefs, LOOK_FORMATS, type Look, type LookFormat } from './looks';
import { composePrompt, emptyBrief, type Brief, type RefRole, type TextMode } from './prompt';
import { generateImages, getSettings, hasKey, onSettingsChange } from './openai';
import { designFromImage, type LayerChoice } from './build';
import { KeyDialog } from './KeyDialog';
import { track } from '../stats/client';
import './studio.css';

// #/generate: the Looks gallery and the brief. A Look is an art direction; the
// user says what it is for, and OpenTempl writes the prompt and either runs it with
// their OpenAI key or hands it to ChatGPT. Results open as layered designs.

const MOODS = ['warm', 'playful', 'calm', 'loud', 'premium', 'nostalgic', 'raw', 'friendly', 'mysterious', 'fresh'];
const ROLES: { id: RefRole; label: string }[] = [
  { id: 'subject', label: 'Show this thing' },
  { id: 'person', label: 'Feature this person' },
  { id: 'logo', label: 'Our logo' },
  { id: 'style', label: 'More style' },
  { id: 'palette', label: 'Colours from this' },
  { id: 'other', label: 'Other' },
];
const TEXT_MODES: { id: TextMode; label: string; hint: string }[] = [
  { id: 'layers', label: 'Editable text', hint: 'The picture is made without words; your words are set on top as real text you can edit.' },
  { id: 'baked', label: 'Words in the picture', hint: 'The image model letters your words into the artwork. Magic layers reads them back as text boxes.' },
  { id: 'none', label: 'No text', hint: 'Just the artwork.' },
];

interface Result {
  id: string;
  url: string;
  blob: Blob;
  lookId: string;
  brief: Brief;
}

export function Studio({ query }: { query: string }) {
  const [looks, setLooks] = useState<Look[] | null>(null);
  const [lookId, setLookId] = useState<string | null>(() => new URLSearchParams(query).get('look'));
  // A link to another look while Generate is already open only changes the hash.
  useEffect(() => setLookId(new URLSearchParams(query).get('look')), [query]);
  const [family, setFamily] = useState('All');
  const [brief, setBrief] = useState<Brief>(emptyBrief());
  const [promptEdit, setPromptEdit] = useState<string | null>(null);
  const [keyOpen, setKeyOpen] = useState(false);
  const [keyed, setKeyed] = useState(hasKey());
  const [n, setN] = useState(2);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [chatgpt, setChatgpt] = useState(false);
  const [choice, setChoice] = useState<LayerChoice>({ layers: true, subject: false, repaint: true });
  const abort = useRef<AbortController | null>(null);
  const brand = useBrand();

  useEffect(() => {
    document.title = 'Generate · OpenTempl';
    loadLooks().then(setLooks);
    return onSettingsChange(() => setKeyed(hasKey())) as () => void;
  }, []);

  const look = looks?.find((l) => l.id === lookId) ?? null;
  // Editable text needs the picture made here with a key; through ChatGPT the words go into the picture.
  useEffect(() => {
    if (!keyed && brief.textMode === 'layers') setBrief((b) => ({ ...b, textMode: 'baked' }));
  }, [keyed, brief.textMode]);
  useEffect(() => {
    if (!look) return;
    setBrief((b) => ({ ...emptyBrief(look), subject: b.subject, mood: b.mood, colors: b.colors, refs: b.refs, extra: b.extra, format: look.formats.includes(b.format) ? b.format : emptyBrief(look).format }));
    setPromptEdit(null);
    window.history.replaceState(null, '', `#/generate?look=${look.id}`);
  }, [look?.id]);

  // Filter chips for the tags shared by at least two Looks; one off tags would just add noise.
  const families = useMemo(() => {
    const n = new Map<string, number>();
    for (const l of looks ?? []) for (const t of l.tags) n.set(t, (n.get(t) ?? 0) + 1);
    return ['All', ...[...n].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t)];
  }, [looks]);
  const shown = (looks ?? []).filter((l) => family === 'All' || l.tags.includes(family));
  const composed = look ? composePrompt(look, brief) : '';
  const prompt = promptEdit ?? composed;
  const set = (p: Partial<Brief>) => {
    setBrief((b) => ({ ...b, ...p }));
    setPromptEdit(null);
  };

  async function run() {
    if (!look) return;
    if (!hasKey()) return setKeyOpen(true);
    setError(null);
    setBusy(`Making ${n === 1 ? 'one picture' : `${n} pictures`}. This takes about a minute.`);
    abort.current = new AbortController();
    try {
      const images = [...(brief.useLookSample ? [sampleUrl(look.id), ...styleRefs(look).map((r) => r.img)] : []), ...brief.refs.map((r) => r.url)];
      const blobs = await generateImages({ prompt, format: brief.format, images, n, signal: abort.current.signal });
      track('generate_used');
      setResults((rs) => [...blobs.map((blob) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(blob), blob, lookId: look.id, brief: { ...brief } })), ...rs]);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function open(r: Result, c: LayerChoice) {
    const l = looks?.find((x) => x.id === r.lookId);
    if (!l) return;
    setError(null);
    setBusy('Building your design');
    try {
      const built = await designFromImage(r.blob, l, r.brief, c, setBusy);
      navigate(`/d/${await createDesign(built)}`);
    } catch (e) {
      setError(`Could not build the design: ${(e as Error).message}`);
      setBusy(null);
    }
  }

  async function addRefs() {
    const files = await pickFiles('image/*');
    const add = files.map((f) => ({ id: crypto.randomUUID(), name: f.name.replace(/\.[^.]+$/, ''), role: 'subject' as RefRole, note: '', url: URL.createObjectURL(f) }));
    set({ refs: [...brief.refs, ...add].slice(0, 8) });
  }

  return (
    <div className="studio">
      <header className="studio-top">
        <a className="home-brand" href="#/">
          <Wordmark size={21} />
        </a>
        <span className="studio-crumb">Generate</span>
        <button className="btn btn-outline" onClick={() => setKeyOpen(true)}>
          {keyed ? `OpenAI key · ${getSettings().model.replace('gpt-image-', 'GPT Image ')}` : 'OpenAI key'}
        </button>
      </header>

      <div className={`studio-body ${look ? 'has-look' : ''}`}>
        <main className="looks">
          <div className="looks-head">
            <h1>Looks</h1>
            <p>Art directions too rich for a template. Pick one, say what it's for, and get a picture in that look for your own thing, with your words set as real, editable text.</p>
            <div className="chips">
              {families.map((f) => (
                <button key={f} className={`chip ${family === f ? 'is-on' : ''}`} onClick={() => setFamily(f)}>
                  {f === 'All' ? 'Every look' : f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {looks === null ? (
            <p className="muted">Loading looks</p>
          ) : looks.length === 0 ? (
            <p className="muted">No looks yet.</p>
          ) : (
            <div className="looks-grid">
              {shown.map((l) => (
                <button key={l.id} className={`look-card ${l.id === lookId ? 'is-on' : ''}`} onClick={() => setLookId(l.id)}>
                  <span className="look-img">
                    <img
                      src={l.refs?.[0]?.img ?? sampleUrl(l.id)}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const im = e.target as HTMLImageElement;
                        // A pin that was taken down falls back to the Look's own sample.
                        if (!im.src.endsWith(`${l.id}.jpg`)) im.src = sampleUrl(l.id);
                        else im.style.visibility = 'hidden';
                      }}
                    />
                    <span className="look-swatches">
                      {l.palette.colors.slice(0, 5).map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </span>
                  </span>
                  <span className="look-name">{l.name}</span>
                  <span className="look-blurb">{l.blurb}</span>
                </button>
              ))}
            </div>
          )}
        </main>

        {look ? (
          <aside className="brief">
            <div className="brief-head">
              <div>
                <h2>{look.name}</h2>
                <p>{look.blurb}</p>
              </div>
              <button className="icon-btn" title="Close" onClick={() => setLookId(null)}>
                <Icon name="close" />
              </button>
            </div>

            <div className="look-refs">
              <div className="look-refs-row">
                <figure>
                  <img src={sampleUrl(look.id)} alt={`${look.name}, made in OpenTempl`} />
                  <figcaption>Made in OpenTempl</figcaption>
                </figure>
                {(look.refs ?? []).map((r) => (
                  <figure key={r.pin}>
                    <a href={r.url} target="_blank" rel="noreferrer" title="Open the pin on Pinterest">
                      <img src={r.img} alt="" loading="lazy" referrerPolicy="no-referrer" />
                    </a>
                    <figcaption>
                      {r.author ? (
                        <a href={r.authorUrl ?? r.url} target="_blank" rel="noreferrer">
                          {r.author}
                        </a>
                      ) : (
                        'Pinterest'
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
              {look.refs?.length ? <small>The pins this look was drawn from, shown from Pinterest with credit to who pinned them. They guide the style only.</small> : null}
            </div>

            <label className="fld">
              <span>What is it for?</span>
              <textarea rows={3} value={brief.subject} placeholder={look.example.subject} onChange={(e) => set({ subject: e.target.value })} />
            </label>

            <div className="fld">
              <span>Format</span>
              <div className="chips">
                {(Object.keys(LOOK_FORMATS) as LookFormat[]).map((f) => (
                  <button key={f} className={`chip ${brief.format === f ? 'is-on' : ''} ${look.formats.includes(f) ? '' : 'is-off'}`} onClick={() => set({ format: f })} title={look.formats.includes(f) ? '' : 'Possible, but this look was made for other shapes'}>
                    {LOOK_FORMATS[f].name}
                  </button>
                ))}
              </div>
            </div>

            <div className="fld">
              <span>Words</span>
              <div className="seg">
                {TEXT_MODES.filter((m) => keyed || m.id !== 'layers').map((m) => (
                  <button key={m.id} className={brief.textMode === m.id ? 'is-on' : ''} onClick={() => set({ textMode: m.id })}>
                    {m.label}
                  </button>
                ))}
              </div>
              <small>{TEXT_MODES.find((m) => m.id === brief.textMode)!.hint}</small>
              {brief.textMode !== 'none' ? (
                <>
                  <input value={brief.headline} placeholder="Headline" onChange={(e) => set({ headline: e.target.value })} />
                  <input value={brief.subline} placeholder="Second line" onChange={(e) => set({ subline: e.target.value })} />
                  <input value={brief.details} placeholder="Date, place, price, link" onChange={(e) => set({ details: e.target.value })} />
                </>
              ) : null}
            </div>

            <div className="fld">
              <span>Colours</span>
              <div className="colors">
                <button className={`chip ${brief.colors.length === 0 ? 'is-on' : ''}`} onClick={() => set({ colors: [] })}>
                  <span className="mini">
                    {look.palette.colors.slice(0, 4).map((c) => (
                      <i key={c} style={{ background: c }} />
                    ))}
                  </span>
                  The look's own
                </button>
                {brand.colors.length ? (
                  <button className={`chip ${brief.colors.join() === brand.colors.slice(0, 5).join() ? 'is-on' : ''}`} onClick={() => set({ colors: brand.colors.slice(0, 5) })}>
                    <span className="mini">
                      {brand.colors.slice(0, 4).map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </span>
                    Brand kit
                  </button>
                ) : null}
                <span className="custom">
                  {(brief.colors.length ? brief.colors : look.palette.colors.slice(0, 4)).map((c, i) => (
                    <input
                      key={i}
                      type="color"
                      value={c.length === 7 ? c : '#000000'}
                      title="Pick your own colour"
                      onChange={(e) => {
                        const base = brief.colors.length ? [...brief.colors] : look.palette.colors.slice(0, 4);
                        base[i] = e.target.value;
                        set({ colors: base });
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>

            <label className="fld">
              <span>Feel</span>
              <input value={brief.mood} placeholder="A few words: warm, a bit nostalgic, summer evening" onChange={(e) => set({ mood: e.target.value })} />
              <div className="chips small">
                {MOODS.map((m) => (
                  <button key={m} className="chip" onClick={() => set({ mood: brief.mood ? `${brief.mood}, ${m}` : m })}>
                    {m}
                  </button>
                ))}
              </div>
            </label>

            <div className="fld">
              <span>Your references</span>
              <div className="refs">
                {brief.refs.map((r) => (
                  <div key={r.id} className="ref">
                    <img src={r.url} alt="" />
                    <div>
                      <select value={r.role} onChange={(e) => set({ refs: brief.refs.map((x) => (x.id === r.id ? { ...x, role: e.target.value as RefRole } : x)) })}>
                        {ROLES.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <input value={r.note} placeholder="Anything to know about it" onChange={(e) => set({ refs: brief.refs.map((x) => (x.id === r.id ? { ...x, note: e.target.value } : x)) })} />
                    </div>
                    <button className="icon-btn" title="Remove" onClick={() => set({ refs: brief.refs.filter((x) => x.id !== r.id) })}>
                      <Icon name="close" />
                    </button>
                  </div>
                ))}
                <button className="btn btn-outline" onClick={addRefs}>
                  <Icon name="plus" /> Add a photo, product or logo
                </button>
              </div>
            </div>

            <label className="fld">
              <span>Anything else</span>
              <textarea rows={2} value={brief.extra} placeholder="Must include a bicycle. No people. Make it feel like autumn." onChange={(e) => set({ extra: e.target.value })} />
            </label>

            <details className="prompt">
              <summary>The prompt ({prompt.length.toLocaleString()} characters){promptEdit !== null ? ', edited' : ''}</summary>
              <textarea rows={14} value={prompt} onChange={(e) => setPromptEdit(e.target.value)} />
              {promptEdit !== null ? (
                <button className="btn btn-outline" onClick={() => setPromptEdit(null)}>
                  Back to the written prompt
                </button>
              ) : null}
            </details>

            <div className="actions">
              {/* Without a key, ChatGPT is the way in, so it leads; with a key, making it here leads. */}
              {keyed ? (
                <div className="row">
                  <button className="btn btn-primary big" disabled={!!busy} onClick={run}>
                    Generate
                  </button>
                  <select value={n} onChange={(e) => setN(Number(e.target.value))} title="How many versions">
                    {[1, 2, 3, 4].map((x) => (
                      <option key={x} value={x}>
                        {x} {x === 1 ? 'version' : 'versions'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <button className={`btn big chatgpt-btn ${keyed ? 'btn-outline' : 'btn-primary'}`} onClick={() => {
                  setChatgpt(true);
                  track('chatgpt_used');
                }}>
                Make it in ChatGPT <span className="free-tag">Free</span>
              </button>
              {!keyed ? (
                <button className="btn btn-outline big" disabled={!!busy} onClick={run}>
                  Use your OpenAI key
                </button>
              ) : null}
              <small>ChatGPT is free: send the prompt there and bring the picture back. With your own OpenAI key it is made right here and opens as layers.</small>
            </div>
          </aside>
        ) : null}
      </div>

      {busy || error ? (
        <div className={`studio-toast ${error ? 'is-error' : ''}`}>
          {error ?? busy}
          {busy && abort.current ? (
            <button className="btn btn-outline" onClick={() => abort.current?.abort()}>
              Stop
            </button>
          ) : null}
          {error ? (
            <button className="icon-btn" onClick={() => setError(null)}>
              <Icon name="close" />
            </button>
          ) : null}
        </div>
      ) : null}

      {results.length ? (
        <section className="results">
          <div className="results-head">
            <h2>Made in this session</h2>
            <div className="layer-opts">
              <label>
                <input type="checkbox" checked={choice.layers} onChange={(e) => setChoice({ ...choice, layers: e.target.checked })} /> Magic layers
              </label>
              <label className={choice.layers ? '' : 'is-off'}>
                <input type="checkbox" disabled={!choice.layers} checked={choice.subject} onChange={(e) => setChoice({ ...choice, subject: e.target.checked })} /> Also cut out the subject (experimental)
              </label>
              <label className={choice.layers && keyed ? '' : 'is-off'}>
                <input type="checkbox" disabled={!choice.layers || !keyed} checked={choice.repaint && keyed} onChange={(e) => setChoice({ ...choice, repaint: e.target.checked })} /> Repaint behind with GPT
              </label>
            </div>
          </div>
          <div className="results-grid">
            {results.map((r) => (
              <div key={r.id} className="result">
                <img src={r.url} alt="" />
                <div className="row">
                  <button className="btn btn-primary" disabled={!!busy} onClick={() => open(r, choice)}>
                    Open as a design
                  </button>
                  <a className="btn btn-outline" href={r.url} download={`${r.brief.headline || 'tavla'}.jpg`}>
                    <Icon name="download" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {keyOpen ? <KeyDialog onClose={() => setKeyOpen(false)} /> : null}
      {chatgpt && look ? (
        <ChatGPTDialog
          look={look}
          brief={brief}
          prompt={promptEdit ?? composePrompt(look, brief, { forChatGPT: true })}
          onClose={() => setChatgpt(false)}
          onResult={(blob) => {
            setChatgpt(false);
            setResults((rs) => [{ id: crypto.randomUUID(), url: URL.createObjectURL(blob), blob, lookId: look.id, brief: { ...brief } }, ...rs]);
          }}
        />
      ) : null}
    </div>
  );
}

async function copyImage(url: string) {
  const blob = await (await fetch(url)).blob();
  // The clipboard only takes PNG images.
  const bmp = await createImageBitmap(blob);
  const c = new OffscreenCanvas(bmp.width, bmp.height);
  c.getContext('2d')!.drawImage(bmp, 0, 0);
  const png = await c.convertToBlob({ type: 'image/png' });
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
}

function ChatGPTDialog({ look, brief, prompt, onClose, onResult }: { look: Look; brief: Brief; prompt: string; onClose: () => void; onResult: (b: Blob) => void }) {
  const [step, setStep] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [drop, setDrop] = useState(false);
  const images = [...(brief.useLookSample ? [{ name: `${look.name} (style)`, url: sampleUrl(look.id) }] : []), ...brief.refs.map((r) => ({ name: r.name, url: r.url }))];
  // ChatGPT prefills its box from ?q= (it never sends by itself). The clipboard carries a copy too,
  // and is the only route when the link would get too long for the browser.
  const viaUrl = encodeURIComponent(prompt).length < 12000;
  const flash = (s: string) => {
    setNote(s);
    setTimeout(() => setNote(null), 2200);
  };
  const take = async (files: FileList | File[]) => {
    const f = [...files].find((x) => x.type.startsWith('image/'));
    if (f) onResult(f);
    return !!f;
  };
  // A picture dragged straight out of ChatGPT arrives as a link; it can only be fetched when it is public.
  const fromUrl = async (url: string) => {
    if (!/^https?:/.test(url.trim())) return false;
    try {
      const r = await fetch(url.trim());
      const blob = await r.blob();
      if (!r.ok || !blob.type.startsWith('image/')) return false;
      onResult(blob);
      return true;
    } catch {
      return false;
    }
  };
  const pasteNow = async () => {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => t.startsWith('image/'));
        if (type) return onResult(await item.getType(type));
      }
      flash('No picture on the clipboard yet. In ChatGPT, right click it and choose Copy image');
    } catch {
      flash('Press ⌘V (Ctrl V) to paste the picture');
    }
  };
  // ⌘V anywhere while this dialog is open.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files ?? [])];
      if (files.some((f) => f.type.startsWith('image/'))) {
        e.preventDefault();
        take(files);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  });
  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog chatgpt">
        <div className="brief-head">
          <h2>Make it in ChatGPT</h2>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <ol className="steps">
          <li className={step >= 0 ? 'is-on' : ''}>
            <b>Open ChatGPT with the prompt.</b>
            <p>A new chat opens with the prompt already in the box. Press Enter to make the picture.</p>
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(prompt);
                } catch {
                  // Not fatal: the link carries the prompt.
                }
                window.open(viaUrl ? `https://chatgpt.com/?q=${encodeURIComponent(prompt)}` : 'https://chatgpt.com/', '_blank', 'noopener');
                if (!viaUrl) flash('Prompt copied. Paste it into the new chat');
                setStep(1);
              }}
            >
              Open ChatGPT
            </button>
          </li>
          {images.length ? (
            <li className={step >= 1 ? 'is-on' : ''}>
              <b>
                Add the style pictures <span className="opt">Optional</span>
              </b>
              <p>For a closer match, copy each one and paste it into ChatGPT’s box with ⌘V (Ctrl V), in this order. Skip it and the prompt still works.</p>
              <div className="ref-copy">
                {images.map((im, i) => (
                  <button
                    key={im.url}
                    className="ref-chip"
                    onClick={async () => {
                      try {
                        await copyImage(im.url);
                        flash(`Picture ${i + 1} copied`);
                      } catch {
                        flash('Your browser blocked copying; drag the picture into ChatGPT instead');
                      }
                      setStep(Math.max(step, 2));
                    }}
                  >
                    <img src={im.url} alt="" draggable />
                    <span>
                      {i + 1}. {im.name}
                    </span>
                  </button>
                ))}
              </div>
            </li>
          ) : null}
          <li className={step >= 1 ? 'is-on' : ''}>
            <b>Send it, then bring the picture back.</b>
            <p>In ChatGPT, right click the finished picture and choose Copy image, then press ⌘V (Ctrl V) here. OpenTempl opens it with Magic layers.</p>
            <div
              className={`dropzone ${drop ? 'is-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDrop(true);
              }}
              onDragLeave={() => setDrop(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDrop(false);
                if (!(await take(e.dataTransfer.files)) && !(await fromUrl(e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain'))))
                  flash('That came over as a link. Copy the picture in ChatGPT instead, then press ⌘V here');
              }}
            >
              <button className="btn btn-primary" onClick={pasteNow}>
                Paste picture
              </button>
              <label className="btn btn-outline">
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files && take(e.target.files)} />
                Choose a file
              </label>
              <span>or drop a downloaded picture here</span>
            </div>
          </li>
        </ol>
        <details className="prompt">
          <summary>See or copy the prompt</summary>
          <textarea rows={10} readOnly value={prompt} />
          <button
            className="btn btn-outline"
            onClick={async () => {
              await navigator.clipboard.writeText(prompt);
              flash('Prompt copied');
            }}
          >
            Copy prompt
          </button>
        </details>
        {note ? <div className="studio-toast">{note}</div> : null}
      </div>
    </div>
  );
}
