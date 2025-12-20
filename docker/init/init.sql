CREATE DATABASE userdb OWNER myuser;
CREATE DATABASE docdb OWNER myuser;
CREATE DATABASE versiondb OWNER myuser;

\connect userdb
ALTER SCHEMA public OWNER TO myuser;
GRANT ALL PRIVILEGES ON SCHEMA public TO myuser;
GRANT ALL PRIVILEGES ON DATABASE userdb TO myuser;

\connect docdb
ALTER SCHEMA public OWNER TO myuser;
GRANT ALL PRIVILEGES ON SCHEMA public TO myuser;
GRANT ALL PRIVILEGES ON DATABASE docdb TO myuser;

\connect versiondb
ALTER SCHEMA public OWNER TO myuser;
GRANT ALL PRIVILEGES ON SCHEMA public TO myuser;
GRANT ALL PRIVILEGES ON DATABASE versiondb TO myuser;
