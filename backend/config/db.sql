-- Create database
CREATE DATABASE IF NOT EXISTS user_auth_db;
USE user_auth_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample user
INSERT INTO users (user_email, user_password, created_at, updated_at) 
VALUES ('natcha@gmail.com', '$2a$10$XQCQNOv4NVpPgHEjvFAyYeUUssLTCBLRRsUMZBV8nWjwBGe4jVVwi', '2025-02-18 17:12:18', '2025-02-18 17:12:18');
-- Note: The password hash above is for 'Natcha1234'