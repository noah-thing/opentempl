import { useEditor } from '../editor/Editor';
import { useDoc, useUI } from '../editor/hooks';
import { Icon } from '../ui/icons';

export default function CommentsPanel() {
  const editor = useEditor();
  const comments = useDoc((s) => s.comments);
  const order = useDoc((s) => s.pageOrder);
  const mode = useUI((s) => s.commentMode);
  const showResolved = useUI((s) => s.showResolved);
  const resolved = Object.values(comments).filter((c) => c.resolved).length;
  const list = Object.values(comments)
    .filter((c) => showResolved || !c.resolved)
    .sort((a, b) => order.indexOf(a.pageId) - order.indexOf(b.pageId) || a.at - b.at);
  return (
    <>
      <button className={`btn btn-block ${mode ? 'btn-primary' : 'btn-ink'}`} style={{ height: 40 }} onClick={() => editor.ui.set({ commentMode: !mode, tool: 'select' })}>
        <Icon name="comment" /> {mode ? 'Click on a page to pin it' : 'Add a comment'}
      </button>
      <div className="row-between" style={{ margin: '12px 0' }}>
        <span className="label">{list.length} {list.length === 1 ? 'thread' : 'threads'}</span>
        <label className="row" style={{ gap: 8, fontSize: 12 }}>
          <button className={`switch ${showResolved ? 'is-on' : ''}`} onClick={() => editor.ui.set({ showResolved: !showResolved })} aria-label="Show resolved" />
          Show resolved
        </label>
      </div>
      {list.length ? (
        list.map((c) => (
          <button
            key={c.id}
            className="layer-row"
            style={{ height: 'auto', padding: 10, alignItems: 'flex-start', width: '100%', textAlign: 'left', opacity: c.resolved ? 0.5 : 1 }}
            onClick={() => editor.ui.set({ activePageId: c.pageId, openCommentId: c.id })}
          >
            <span className="comment-av" style={{ background: c.color }}>
              {c.author.slice(0, 1).toUpperCase()}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 600 }}>
                {c.author} <span className="muted" style={{ fontWeight: 400 }}>· page {order.indexOf(c.pageId) + 1}</span>
              </span>
              <span style={{ display: 'block', color: 'var(--ink-2)' }}>{c.text}</span>
              {c.replies.length ? <span className="hint">{c.replies.length} {c.replies.length === 1 ? 'reply' : 'replies'}</span> : null}
            </span>
          </button>
        ))
      ) : (
        <div className="empty">
          <h4>{resolved ? 'Everything is resolved' : 'No comments yet'}</h4>
          <span className="hint">
            {resolved
              ? `${resolved} resolved ${resolved === 1 ? 'thread is' : 'threads are'} tucked away. Turn on Show resolved to see ${resolved === 1 ? 'it' : 'them'}.`
              : 'Pin a note anywhere on a page.'}
          </span>
        </div>
      )}
    </>
  );
}
