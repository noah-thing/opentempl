-- One row per install: a hash of the random ID the app makes on first run, nothing else about the person.
CREATE TABLE installs (
	hash TEXT PRIMARY KEY,
	first_day TEXT NOT NULL,
	last_day TEXT NOT NULL,
	platform TEXT NOT NULL,
	version TEXT NOT NULL
);
CREATE INDEX installs_first_day ON installs (first_day);

-- Which installs were open on which day, for daily, weekly and monthly active counts.
CREATE TABLE active (
	day TEXT NOT NULL,
	hash TEXT NOT NULL,
	PRIMARY KEY (day, hash)
);

-- How many times each thing happened on each day. No install, no time of day.
CREATE TABLE events (
	day TEXT NOT NULL,
	name TEXT NOT NULL,
	n INTEGER NOT NULL,
	PRIMARY KEY (day, name)
);

-- The optional email list. Only what the person typed, when, and where they typed it.
CREATE TABLE subscribers (
	email TEXT PRIMARY KEY,
	source TEXT NOT NULL,
	token TEXT NOT NULL UNIQUE,
	created_at TEXT NOT NULL
);

-- Per network limits. The key is a hash of the IP address salted with the day and a server secret,
-- so the address itself is never stored and the hash means nothing the next day.
CREATE TABLE ip_limits (
	kind TEXT NOT NULL,
	period TEXT NOT NULL,
	hash TEXT NOT NULL,
	n INTEGER NOT NULL,
	PRIMARY KEY (kind, period, hash)
);
