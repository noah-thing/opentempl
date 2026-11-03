export interface Stats {
	installs: number;
	newToday: number;
	newWeek: number;
	activeToday: number;
	activeWeek: number;
	activeMonth: number;
	byPlatform: { platform: string; n: number }[];
	byVersion: { version: string; n: number }[];
	daily: { day: string; active: number }[];
	newDaily: { day: string; n: number }[];
	events: { name: string; today: number; week: number; month: number; total: number }[];
	subscribers: { total: number; week: number; byFooter: number; byExport: number };
}

const PLATFORM_NAME: Record<string, string> = { web: 'Web', mac: 'macOS', win: 'Windows', linux: 'Linux' };
const EVENT_NAME: Record<string, string> = {
	design_created: 'Designs created',
	template_opened: 'Templates opened',
	export: 'Exports',
	generate_used: 'Generate used',
	chatgpt_used: 'ChatGPT dialog opened',
	mcp_opened: 'Design opened from an assistant',
	photo_placed: 'Photos placed',
};

export function esc(s: unknown): string {
	return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

export function renderDashboard(s: Stats, days: string[]): string {
	const num = (n: number): string => n.toLocaleString('en');
	const activeBy = new Map(s.daily.map(r => [r.day, r.active]));
	const newBy = new Map(s.newDaily.map(r => [r.day, r.n]));
	const max = Math.max(1, ...days.map(d => activeBy.get(d) ?? 0));
	const bars = days.map(d => {
		const a = activeBy.get(d) ?? 0;
		const n = newBy.get(d) ?? 0;
		return `<div class="bar" title="${d}: ${a} active, ${n} new"><i style="height:${(a / max) * 100}%"></i><b style="height:${(n / max) * 100}%"></b></div>`;
	}).join('');
	const rows = (list: { n: number; label: string }[]): string => {
		const total = list.reduce((x, r) => x + r.n, 0) || 1;
		return list.map(r => `<li><span>${esc(r.label)}</span><span class="track"><span style="width:${(r.n / total) * 100}%"></span></span><span class="n">${num(r.n)}</span></li>`).join('') || '<li class="none">No data yet</li>';
	};
	const tile = (label: string, n: number, sub = ''): string => `<div class="tile"><div class="label">${label}</div><div class="num">${num(n)}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
	const eventRows = s.events.map(e => `<tr><td>${esc(EVENT_NAME[e.name] ?? e.name)}</td><td>${num(e.today)}</td><td>${num(e.week)}</td><td>${num(e.month)}</td><td>${num(e.total)}</td></tr>`).join('');
	return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>OpenTempl counts</title>
<style>
:root{--bg:#fafaf9;--fg:#1c1917;--mute:#78716c;--line:#e7e5e4;--card:#fff;--a:#1c1917;--b:#a8a29e}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#f5f5f4;--mute:#a8a29e;--line:#2a2a2a;--card:#1b1b1b;--a:#f5f5f4;--b:#57534e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
main{max-width:860px;margin:0 auto;padding:40px 20px 60px}h1{font-size:20px;margin:0 0 4px}p.lead{color:var(--mute);margin:0 0 28px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:28px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}.label{color:var(--mute);font-size:12px}.num{font-size:28px;font-weight:600;font-variant-numeric:tabular-nums}.sub{color:var(--mute);font-size:12px}
section{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:16px}h2{font-size:13px;margin:0 0 12px;color:var(--mute);font-weight:500}
.chart{display:flex;align-items:flex-end;gap:3px;height:120px}.bar{flex:1;height:100%;position:relative}.bar i,.bar b{position:absolute;bottom:0;left:0;right:0;border-radius:3px 3px 0 0}.bar i{background:var(--b)}.bar b{background:var(--a)}
.legend{display:flex;gap:16px;color:var(--mute);font-size:12px;margin-top:8px}.legend span::before{content:"";display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:6px;background:var(--b)}.legend span.new::before{background:var(--a)}
ul{list-style:none;margin:0;padding:0}li{display:grid;grid-template-columns:110px 1fr 48px;gap:10px;align-items:center;padding:4px 0}.track{height:8px;background:var(--line);border-radius:4px;overflow:hidden}.track span{display:block;height:100%;background:var(--a)}.n{text-align:right;font-variant-numeric:tabular-nums}.none{color:var(--mute);display:block}
table{width:100%;border-collapse:collapse}th,td{text-align:right;padding:6px 0;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}th:first-child,td:first-child{text-align:left}th{color:var(--mute);font-weight:500;border-top:0;font-size:12px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}@media (max-width:640px){.cols{grid-template-columns:1fr}}
footer{color:var(--mute);font-size:12px;margin-top:20px}
</style></head><body><main>
<h1>OpenTempl counts</h1><p class="lead">Anonymous counts from copies that have sharing turned on. Days are UTC.</p>
<div class="tiles">${tile('Total installs', s.installs)}${tile('New today', s.newToday, `${num(s.newWeek)} this week`)}${tile('Active today', s.activeToday)}${tile('Active this week', s.activeWeek)}${tile('Active this month', s.activeMonth)}${tile('Email list', s.subscribers.total, `${num(s.subscribers.week)} this week · ${num(s.subscribers.byFooter)} footer, ${num(s.subscribers.byExport)} export`)}</div>
<section><h2>Last 30 days</h2><div class="chart">${bars}</div><div class="legend"><span>Active</span><span class="new">New installs</span></div></section>
<section><h2>What people do</h2><table><thead><tr><th></th><th>Today</th><th>7 days</th><th>30 days</th><th>All time</th></tr></thead><tbody>${eventRows}</tbody></table></section>
<div class="cols"><section><h2>Platform, active this month</h2><ul>${rows(s.byPlatform.map(r => ({ n: r.n, label: PLATFORM_NAME[r.platform] ?? r.platform })))}</ul></section>
<section><h2>Version, active this month</h2><ul>${rows(s.byVersion.map(r => ({ n: r.n, label: r.version })))}</ul></section></div>
<footer>Updated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</footer>
</main></body></html>`;
}
