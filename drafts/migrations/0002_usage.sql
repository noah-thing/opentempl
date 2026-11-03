-- Previews drawn per month on Vercel, so they stay inside its free plan; past the budget the Worker's own browser draws them.
CREATE TABLE usage (
	month TEXT PRIMARY KEY,
	renders INTEGER NOT NULL
);
