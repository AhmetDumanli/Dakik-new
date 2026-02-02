\c dakik_user;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP
);

INSERT INTO users (name, email, password, created_at) VALUES
    ('Test User', 'test@example.com', 'password123', NOW()),
    ('Demo User', 'demo@example.com', 'password123', NOW()),
    ('Admin User', 'admin@example.com', 'password123', NOW());
