-- VentePlus Database Initialization Script
-- This script creates all required databases for the microservices

-- Create databases for each microservice
CREATE DATABASE IF NOT EXISTS client;
CREATE DATABASE IF NOT EXISTS categorie;
CREATE DATABASE IF NOT EXISTS produit;
CREATE DATABASE IF NOT EXISTS devis;
CREATE DATABASE IF NOT EXISTS facture;
CREATE DATABASE IF NOT EXISTS reglement;

-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON DATABASE client TO postgres;
GRANT ALL PRIVILEGES ON DATABASE categorie TO postgres;
GRANT ALL PRIVILEGES ON DATABASE produit TO postgres;
GRANT ALL PRIVILEGES ON DATABASE devis TO postgres;
GRANT ALL PRIVILEGES ON DATABASE facture TO postgres;
GRANT ALL PRIVILEGES ON DATABASE reglement TO postgres;

-- Create extensions if needed
\c client;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c categorie;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c produit;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c devis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c facture;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c reglement;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log completion
\echo 'All databases created successfully for VentePlus application';
