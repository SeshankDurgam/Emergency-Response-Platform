-- MySQL initialization script
-- Runs automatically on first docker compose up
-- Creates all service databases and grants ecuser full access

CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS incident_shard_0 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS incident_shard_1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS incident_shard_2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS resource_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS dispatch_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS audit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON auth_db.* TO 'ecuser'@'%';
GRANT ALL PRIVILEGES ON incident_shard_0.* TO 'ecuser'@'%';
GRANT ALL PRIVILEGES ON incident_shard_1.* TO 'ecuser'@'%';
GRANT ALL PRIVILEGES ON incident_shard_2.* TO 'ecuser'@'%';
GRANT ALL PRIVILEGES ON resource_db.* TO 'ecuser'@'%';
GRANT ALL PRIVILEGES ON dispatch_db.* TO 'ecuser'@'%';
GRANT ALL PRIVILEGES ON audit_db.* TO 'ecuser'@'%';

FLUSH PRIVILEGES;
