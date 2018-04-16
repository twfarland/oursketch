CREATE TABLE lines (
	id SERIAL NOT NULL PRIMARY KEY,
	drawing_id INTEGER,
	username TEXT,
	colour TEXT,
	size INTEGER,
	points JSONB NOT NULL DEFAULT '{}'::JSONB,
	started BIGINT,
	created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX line_drawing_id_idx ON lines(drawing_id);

ALTER TABLE lines ADD FOREIGN KEY (drawing_id) REFERENCES drawings ON DELETE CASCADE;
