-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('headman', 'assistant', 'villager', 'pending') DEFAULT 'pending' AFTER address,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved,
ADD COLUMN approval_date TIMESTAMP NULL DEFAULT NULL AFTER approved_by;

-- Update existing records to have default values
UPDATE users SET
  first_name = 'Default',
  last_name = 'User',
  status = 'headman',
  is_approved = TRUE,
  approval_date = NOW()
WHERE first_name IS NULL OR first_name = '';

-- Add foreign key constraint for approved_by
ALTER TABLE users
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES users(user_id)
ON DELETE SET NULL;-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100) DEFAULT '' AFTER user_password,
ADD COLUMN last_name VARCHAR(100) DEFAULT '' AFTER first_name,
ADD COLUMN phone VARCHAR(20) DEFAULT '' AFTER last_name,
ADD COLUMN address TEXT DEFAULT '' AFTER phone,
ADD COLUMN status ENUM('active', 'pending', 'inactive') DEFAULT 'active' AFTER address;

-- Update existing records to have default values
UPDATE users SET 
  first_name = 'Default',
  last_name = 'User',
  status = 'active'
WHERE first_name IS NULL OR first_name = '';