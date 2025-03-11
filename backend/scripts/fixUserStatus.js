/**
 * Script to fix user status for user ID 15
 * Run this script with: node fixUserStatus.js
 */

require('dotenv').config();
const db = require('../config/database');

async function fixUserStatus() {
  try {
    console.log('Starting user status fix script...');
    
    // Update user 15 to have headman status
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE user_id = ?',
      ['headman', 15]
    );
    
    console.log(`Updated ${result.affectedRows} rows`);
    
    // Verify the update
    const [users] = await db.query(
      'SELECT user_id, user_email, status FROM users WHERE user_id = ?',
      [15]
    );
    
    if (users.length > 0) {
      console.log('User after update:', users[0]);
    } else {
      console.log('User not found');
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user status:', error);
    process.exit(1);
  }
}

// Run the function
fixUserStatus();/**
 * Script to fix user status for user ID 15
 * Run this script with: node fixUserStatus.js
 */

require('dotenv').config();
const db = require('../config/database');

async function fixUserStatus() {
  try {
    console.log('Starting user status fix script...');
    
    // Update user 15 to have headman status
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE user_id = ?',
      ['headman', 15]
    );
    
    console.log(`Updated ${result.affectedRows} rows`);
    
    // Verify the update
    const [users] = await db.query(
      'SELECT user_id, user_email, status FROM users WHERE user_id = ?',
      [15]
    );
    
    if (users.length > 0) {
      console.log('User after update:', users[0]);
    } else {
      console.log('User not found');
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user status:', error);
    process.exit(1);
  }
}

// Run the function
fixUserStatus();/**
 * Script to fix user status for user ID 15
 * Run this script with: node fixUserStatus.js
 */

require('dotenv').config();
const db = require('../config/database');

async function fixUserStatus() {
  try {
    console.log('Starting user status fix script...');
    
    // Update user 15 to have headman status
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE user_id = ?',
      ['headman', 15]
    );
    
    console.log(`Updated ${result.affectedRows} rows`);
    
    // Verify the update
    const [users] = await db.query(
      'SELECT user_id, user_email, status FROM users WHERE user_id = ?',
      [15]
    );
    
    if (users.length > 0) {
      console.log('User after update:', users[0]);
    } else {
      console.log('User not found');
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user status:', error);
    process.exit(1);
  }
}

// Run the function
fixUserStatus();/**
 * Script to fix user status for user ID 15
 * Run this script with: node fixUserStatus.js
 */

require('dotenv').config();
const db = require('../config/database');

async function fixUserStatus() {
  try {
    console.log('Starting user status fix script...');
    
    // Update user 15 to have headman status
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE user_id = ?',
      ['headman', 15]
    );
    
    console.log(`Updated ${result.affectedRows} rows`);
    
    // Verify the update
    const [users] = await db.query(
      'SELECT user_id, user_email, status FROM users WHERE user_id = ?',
      [15]
    );
    
    if (users.length > 0) {
      console.log('User after update:', users[0]);
    } else {
      console.log('User not found');
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user status:', error);
    process.exit(1);
  }
}

// Run the function
fixUserStatus();/**
 * Script to fix user status for user ID 15
 * Run this script with: node fixUserStatus.js
 */

require('dotenv').config();
const db = require('../config/database');

async function fixUserStatus() {
  try {
    console.log('Starting user status fix script...');
    
    // Update user 15 to have headman status
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE user_id = ?',
      ['headman', 15]
    );
    
    console.log(`Updated ${result.affectedRows} rows`);
    
    // Verify the update
    const [users] = await db.query(
      'SELECT user_id, user_email, status FROM users WHERE user_id = ?',
      [15]
    );
    
    if (users.length > 0) {
      console.log('User after update:', users[0]);
    } else {
      console.log('User not found');
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user status:', error);
    process.exit(1);
  }
}

// Run the function
fixUserStatus();/**
 * Script to fix user status for user ID 15
 * Run this script with: node fixUserStatus.js
 */

require('dotenv').config();
const db = require('../config/database');

async function fixUserStatus() {
  try {
    console.log('Starting user status fix script...');
    
    // Update user 15 to have headman status
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE user_id = ?',
      ['headman', 15]
    );
    
    console.log(`Updated ${result.affectedRows} rows`);
    
    // Verify the update
    const [users] = await db.query(
      'SELECT user_id, user_email, status FROM users WHERE user_id = ?',
      [15]
    );
    
    if (users.length > 0) {
      console.log('User after update:', users[0]);
    } else {
      console.log('User not found');
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user status:', error);
    process.exit(1);
  }
}

// Run the function
fixUserStatus();/**
 * Script to fix user status for user ID 15
 * Run this script with: node fixUserStatus.js
 */

require('dotenv').config();
const db = require('../config/database');

async function fixUserStatus() {
  try {
    console.log('Starting user status fix script...');
    
    // Update user 15 to have headman status
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE user_id = ?',
      ['headman', 15]
    );
    
    console.log(`Updated ${result.affectedRows} rows`);
    
    // Verify the update
    const [users] = await db.query(
      'SELECT user_id, user_email, status FROM users WHERE user_id = ?',
      [15]
    );
    
    if (users.length > 0) {
      console.log('User after update:', users[0]);
    } else {
      console.log('User not found');
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user status:', error);
    process.exit(1);
  }
}

// Run the function
fixUserStatus();/**
 * Script to fix user status for user ID 15
 * Run this script with: node fixUserStatus.js
 */

require('dotenv').config();
const db = require('../config/database');

async function fixUserStatus() {
  try {
    console.log('Starting user status fix script...');
    
    // Update user 15 to have headman status
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE user_id = ?',
      ['headman', 15]
    );
    
    console.log(`Updated ${result.affectedRows} rows`);
    
    // Verify the update
    const [users] = await db.query(
      'SELECT user_id, user_email, status FROM users WHERE user_id = ?',
      [15]
    );
    
    if (users.length > 0) {
      console.log('User after update:', users[0]);
    } else {
      console.log('User not found');
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user status:', error);
    process.exit(1);
  }
}

// Run the function
fixUserStatus();