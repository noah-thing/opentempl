import { useEffect, useRef, useState } from 'react';
import type { Comment, Id } from '../doc/types';
import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import { Icon } from '../ui/icons';

function ago(t: number) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short' });
}

// Pins on a page plus the open thread. A pin is a speech bubble with the
// author's initial, in the author's colour.
export function CommentPins({ pageId, zoom }: { pageId: Id; zoom: number }) {
  const editor = useEditor();
  const comments = useDoc((s) => s.comments);
  const open = useUI((s) => s.openCommentId);
  const list = Object.values(comments).filter((c) => c.pageId === pageId && (!c.resolved || c.id === open));
  return (
    <>
      {list.map((c) => (
        <div key={c.id}>
          <button
            data-overlay-control
            className={`comment-pin ${open === c.id ? 'is-open' : ''}`}
            style={{ left: c.x * zoom, top: c.y * zoom, background: c.color }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => editor.ui.set({ openCommentId: open === c.id ? null : c.id })}
            title={`${c.author}: ${c.text}`}
          >
            {c.author.slice(0, 1).toUpperCase()}
            {c.replies.length ? <i>{c.replies.length + 1}</i> : null}
          </button>
          {open === c.id ? <Thread c={c} zoom={zoom} /> : null}
        </div>
      ))}
    </>
  );
}

function Thread({ c, zoom }: { c: Comment; zoom: number }) {
  const editor = useEditor();
  const [reply, setReply] = useState('');
  return (
    <div className="comment-thread" data-overlay-control style={{ left: c.x * zoom + 26, top: c.y * zoom - 8 }} onPointerDown={(e) => e.stopPropagation()}>
      {[{ author: c.author, color: c.color, text: c.text, at: c.at }, ...c.replies].map((m, i) => (
        <div key={i} className="comment-msg">
          <span className="comment-av" style={{ background: m.color }}>
            {m.author.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <div className="comment-meta">
              <b>{m.author}</b> <span>{ago(m.at)}</span>
            </div>
            <div className="comment-text">{m.text}</div>
          </div>
        </div>
      ))}
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          editor.replyComment(c.id, reply.trim());
          setReply('');
        }}
      >
        <div className="field" style={{ flex: 1, height: 32 }}>
          <input value={reply} placeholder="Reply" onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
        </div>
      </form>
      <div className="row-between">
        <button className="btn btn-sm" onClick={() => editor.resolveComment(c.id, !c.resolved)}>
          <Icon name="check" /> {c.resolved ? 'Reopen' : 'Resolve'}
        </button>
        <button className="btn btn-sm" onClick={() => (editor.doc.deleteComment(c.id), editor.ui.set({ openCommentId: null }))}>
          <Icon name="trash" /> Delete
        </button>
      </div>
    </div>
  );
}

// The draft bubble shown where a new comment is being written.
export function CommentDraft({ at, zoom, onDone }: { at: { pageId: Id; x: number; y: number }; zoom: number; onDone: () => void }) {
  const editor = useEditor();
  const [text, setText] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    requestAnimationFrame(() => input.current?.focus());
  }, []);
  return (
    <div className="comment-thread" data-overlay-control style={{ left: at.x * zoom + 26, top: at.y * zoom - 8 }} onPointerDown={(e) => e.stopPropagation()}>
      <span className="comment-pin" style={{ left: -26, top: 'calc(100% + 8px)', background: 'var(--ink)' }} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) editor.addComment(at.pageId, at.x, at.y, text.trim());
          onDone();
        }}
      >
        <div className="field">
          <input
            ref={input}
            autoFocus
            value={text}
            placeholder="Leave a comment"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') onDone();
            }}
          />
          <button className="btn btn-sm btn-ink" disabled={!text.trim()}>
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
