import { exports } from 'cloudflare:workers';
import { decodeDown, type DownFrame } from '../src/protocol';

export const roomId = (n = 1) => n.toString(16).padStart(64, '0');

export class Client {
  frames: DownFrame[] = [];
  private waiters: (() => void)[] = [];
  closed: { code: number } | null = null;

  constructor(private ws: WebSocket) {
    ws.addEventListener('message', (e) => {
      const f = decodeDown(new Uint8Array(e.data as ArrayBuffer));
      if (f) this.frames.push(f);
      this.waiters.splice(0).forEach((w) => w());
    });
    ws.addEventListener('close', (e) => {
      this.closed = { code: e.code };
      this.waiters.splice(0).forEach((w) => w());
    });
  }

  send(data: Uint8Array) {
    this.ws.send(data);
  }

  async until(test: () => boolean, ms = 3000) {
    const end = Date.now() + ms;
    while (!test()) {
      if (Date.now() > end) throw new Error('timed out waiting; frames: ' + JSON.stringify(this.frames.map((f) => f.kind)));
      await new Promise<void>((r) => {
        this.waiters.push(r);
        setTimeout(r, 50);
      });
    }
  }

  kinds() {
    return this.frames.map((f) => f.kind);
  }

  of<K extends DownFrame['kind']>(kind: K) {
    return this.frames.filter((f): f is Extract<DownFrame, { kind: K }> => f.kind === kind);
  }

  close() {
    this.ws.close();
  }
}

export async function connect(room: string, origin = 'http://localhost:5181'): Promise<Client> {
  const res = await exports.default.fetch(`https://sync.test/v1/room/${room}`, { headers: { Upgrade: 'websocket', Origin: origin } });
  if (!res.webSocket) throw new Error(`no socket, status ${res.status}`);
  res.webSocket.accept();
  res.webSocket.binaryType = 'arraybuffer';
  return new Client(res.webSocket);
}

export const bytes = (n: number, fill = 7) => new Uint8Array(n).fill(fill);
