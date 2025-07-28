-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Table: report
CREATE TABLE report (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    creation_date TIMESTAMP NOT NULL,
    geometry geometry
);

-- Table: cluster
CREATE TABLE cluster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES report(id) ON DELETE CASCADE
);

-- Table: tile_hour
CREATE TABLE tile_hour (
    tile_id BIGINT NOT NULL,
    date DATE NOT NULL,
    cluster_id UUID REFERENCES cluster(id) ON DELETE CASCADE,
    PRIMARY KEY (tile_id, date)
);
