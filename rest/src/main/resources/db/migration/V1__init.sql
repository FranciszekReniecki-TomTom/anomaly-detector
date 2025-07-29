CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE report (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    creation_date TIMESTAMP NOT NULL,
    geometry geometry
);

CREATE TABLE cluster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES report(id) ON DELETE CASCADE
);

CREATE TABLE tile_hour (
    tile_id BIGINT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    cluster_id UUID REFERENCES cluster(id) ON DELETE CASCADE,
    PRIMARY KEY (tile_id, timestamp)
);
