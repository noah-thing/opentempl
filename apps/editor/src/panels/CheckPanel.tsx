import { useMemo, useState } from 'react';
import type { Element } from '../doc/types';
import { useEditor } from '../editor/Editor';
import { useDoc } from '../editor/hooks';
import { checkDesign, type Issue, type IssueKind } from '../tools/check';
import { Sign } from '../ui/Logo';
import { Icon } from '../ui/icons';
import { Section } from './controls';

const GROUPS: { kind: IssueKind; title: string; icon: string }[] = [
  { kind: 'contrast', title: 'Hard to read', icon: 'eye' },
  { kind: 'tiny', title: 'Small text', icon: 'text' },
  { kind: 'soft', title: 'Soft photos', icon: 'image' },
  { kind: 'alt', title: 'Alt text', icon: 'comment' },
  { kind: 'offpage', title: 'Off the page', icon: 'page' },
  { kind: 'empty', title: 'Empty text boxes', icon: 'text' },
];

// A design check: everything it finds is one click from the element, and
// the obvious fixes are one more click.
export default function CheckPanel() {
  const editor = useEditor();
  const snap = useDoc((s) => s);
  const issues = useMemo(() => checkDesign(snap, (id) => editor.doc.getAsset(id)), [snap, editor]);
  const order = snap.pageOrder;

  const show = (i: Issue) => {
    editor.ui.set({ activePageId: i.pageId });
    editor.select([i.id], { expandGroups: false });
  };
  const fix = (i: Issue) => {
    if (!i.fix) return;
    if ('remove' in i.fix) editor.doc.deleteElements([i.id]);
    else editor.update(i.id, i.fix.patch);
  };
  const fixAll = () => {
    editor.doc.undo.stopCapturing();
    editor.doc.transact(() => {
      for (const i of issues) if (i.fix && i.severity === 'fix') fix(i);
    });
  };
  const fixable = issues.filter((i) => i.fix && i.severity === 'fix').length;

  if (!issues.length)
    return (
      <div className="empty">
        <Sign size={64} mood="wow" />
        <h4>Nothing to fix</h4>
        <span className="hint">Every text reads against its background, nothing is too small, every photo is sharp enough and has alt text.</span>
      </div>
    );

  return (
    <>
      <div className="row-between" style={{ marginBottom: 6 }}>
        <span className="label" style={{ margin: 0 }}>
          {issues.length} {issues.length === 1 ? 'thing' : 'things'} to look at
        </span>
        {fixable ? (
          <button className="btn btn-sm btn-ink" onClick={fixAll}>
            <Icon name="wand" size={14} /> Fix {fixable}
          </button>
        ) : null}
      </div>
      {GROUPS.map((g) => {
        const list = issues.filter((i) => i.kind === g.kind);
        if (!list.length) return null;
        return (
          <Section key={g.kind} title={`${g.title} · ${list.length}`}>
            <div className="issues">
              {list.map((i) => (
                <IssueRow key={i.kind + i.id} issue={i} page={order.indexOf(i.pageId) + 1} onShow={() => show(i)} onFix={() => fix(i)} />
              ))}
            </div>
          </Section>
        );
      })}
    </>
  );
}

function IssueRow({ issue, page, onShow, onFix }: { issue: Issue; page: number; onShow: () => void; onFix: () => void }) {
  const editor = useEditor();
  const [alt, setAlt] = useState('');
  return (
    <div className={`issue is-${issue.severity}`}>
      <button className="issue-text" onClick={onShow} title="Show it">
        <span className="issue-page">p{page}</span>
        {issue.text}
      </button>
      {issue.kind === 'alt' ? (
        <div className="field" style={{ height: 32, marginTop: 6 }}>
          <input
            placeholder="Describe it in a few words"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && alt.trim()) editor.update(issue.id, { alt: alt.trim() } as Partial<Element>);
            }}
          />
        </div>
      ) : issue.fix ? (
        <button className="btn btn-sm btn-outline" style={{ marginTop: 6 }} onClick={onFix}>
          {issue.fix.label}
        </button>
      ) : null}
    </div>
  );
}
