-- Create a new database for Keycloak
CREATE DATABASE keycloak_db;

-- Create a dedicated user for Keycloak
CREATE USER keycloak_user WITH PASSWORD 'keycloak_password';

-- Grant privileges to the Keycloak user
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO keycloak_user;

-- Switch to the Keycloak database
\c keycloak_db;

-- Grant permissions on the public schema
GRANT ALL ON SCHEMA public TO keycloak_user;

-- Set default privileges for the Keycloak user on all objects in the schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO keycloak_user;
