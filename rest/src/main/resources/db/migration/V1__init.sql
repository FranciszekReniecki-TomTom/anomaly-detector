CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE report (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    creation_date TIMESTAMP NOT NULL,
    geometry geometry(Polygon,4326)
);

CREATE TABLE cluster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES report(id) ON DELETE CASCADE
);

CREATE TABLE geom_hour (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP NOT NULL,
    geometry geometry(Polygon,4326) NOT NULL,
    cluster_id UUID REFERENCES cluster(id) ON DELETE CASCADE
);