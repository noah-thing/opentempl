declare namespace Cloudflare {
  interface Env {
    ROOMS: DurableObjectNamespace<import('./room').Room>;
    ALLOWED_ORIGINS: string;
  }
  interface GlobalProps {
    mainModule: typeof import('./index');
    durableNamespaces: 'Room';
  }
}
interface Env extends Cloudflare.Env {}
