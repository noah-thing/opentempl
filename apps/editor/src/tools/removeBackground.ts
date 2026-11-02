import type { Editor } from '../editor/Editor';
import type { ImageElement } from '../doc/types';
import { prepareImage } from '../io/upload';
import { addUpload } from '../io/uploads';

// Background removal that runs entirely in the browser with BiRefNet lite
// (MIT licence) through transformers.js. WebGPU when available, WASM otherwise.

const MODEL = 'onnx-community/BiRefNet_lite-ONNX';
export type Segmenter = (input: string) => Promise<unknown>;
let segmenterP: Promise<Segmenter> | null = null;

export async function loadSegmenter(onStatus: (s: string) => void): Promise<Segmenter> {
  if (!segmenterP) {
    segmenterP = (async () => {
      const { pipeline, env } = await import('@huggingface/transformers');
      env.allowLocalModels = false;
      // navigator.gpu can exist without a usable adapter (headless, some VMs), and small GPUs can't run
      // BiRefNet's shaders (it needs 11 storage buffers per stage): check before choosing WebGPU.
      type Adapter = { limits: { maxStorageBuffersPerShaderStage: number } } | null;
      const adapter = 'gpu' in navigator ? await (navigator as unknown as { gpu: { requestAdapter: () => Promise<Adapter> } }).gpu.requestAdapter().catch(() => null) : null;
      const gpu = !!adapter && adapter.limits.maxStorageBuffersPerShaderStage >= 11;
      const seg = await pipeline('background-removal', MODEL, {
        device: gpu ? 'webgpu' : 'wasm',
        dtype: gpu ? 'fp16' : 'fp32',
        progress_callback: (p: { status?: string; progress?: number; file?: string }) => {
          if (p.status === 'progress' && typeof p.progress === 'number') onStatus(`Downloading model ${Math.round(p.progress)}%`);
        },
      } as Record<string, unknown>);
      if (!gpu) return seg as unknown as Segmenter;
      // If the GPU run still fails, fall back to the CPU once and stay there.
      let run = seg as unknown as Segmenter;
      return (async (input: string) => {
        try {
          return await run(input);
        } catch {
          onStatus('Your graphics chip could not run the model, using the processor instead');
          run = (await pipeline('background-removal', MODEL, { device: 'wasm', dtype: 'fp32' } as Record<string, unknown>)) as unknown as Segmenter;
          return run(input);
        }
      }) as Segmenter;
    })();
    segmenterP.catch(() => (segmenterP = null));
  }
  return segmenterP;
}

export async function removeBackground(editor: Editor, el: ImageElement, onStatus: (s: string) => void) {
  const url = editor.doc.assetUrl(el.assetId);
  const src = editor.doc.getAsset(el.assetId);
  if (!url || !src) throw new Error('This frame has no photo yet');
  onStatus('Loading the cutout model');
  const seg = await loadSegmenter(onStatus);
  onStatus('Cutting out the subject');
  type Out = { toCanvas?: () => HTMLCanvasElement | OffscreenCanvas; toBlob?: () => Promise<Blob> };
  const out = (await seg(url)) as Out[] | Out;
  const img = Array.isArray(out) ? out[0] : out;
  let blob: Blob;
  if (img?.toBlob) blob = await img.toBlob();
  else if (img?.toCanvas) {
    const c = img.toCanvas();
    blob = 'convertToBlob' in c ? await (c as OffscreenCanvas).convertToBlob({ type: 'image/png' }) : await new Promise<Blob>((r) => (c as HTMLCanvasElement).toBlob((b) => r(b!), 'image/png'));
  } else throw new Error('The model returned nothing useful');
  const asset = await prepareImage(new Blob([blob], { type: 'image/png' }), `${src.name} cutout`);
  editor.doc.addAsset(asset);
  addUpload(asset).catch(() => {});
  editor.update(el.id, { assetId: asset.id } as Partial<ImageElement>);
  editor.toast('Background removed. Undo brings it back.');
}
