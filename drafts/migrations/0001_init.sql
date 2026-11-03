-- A design an assistant made, as the list of steps that rebuild it. Nothing about who asked for it.
CREATE TABLE drafts (
	id TEXT PRIMARY KEY,
	body TEXT NOT NULL,
	version INTEGER NOT NULL,
	created INTEGER NOT NULL,
	updated INTEGER NOT NULL
);
CREATE INDEX drafts_updated ON drafts (updated);
