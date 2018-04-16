CREATE TABLE drawings (
	id SERIAL NOT NULL PRIMARY KEY,
	code TEXT,
	username TEXT,
	email TEXT,
	title TEXT,
	width INTEGER,
	height INTEGER,
	lines JSONB NOT NULL DEFAULT '{}'::JSONB,
	created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX drawing_code_idx ON drawings(code);