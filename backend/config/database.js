const mysql = require('mysql2/promise');

// Create a mock database object for when real database is not available
const mockDb = {
  query: async (sql, params) => {
    console.log('Mock DB query:', sql);
    console.log('Parameters:', params);

    // Return mock data based on the query type
    if (sql.toLowerCase().includes('select')) {
      return [[], null]; // Empty result set
    } else if (sql.toLowerCase().includes('insert')) {
      return [{ insertId: 999, affectedRows: 1 }, null];
    } else {
      return [{ affectedRows: 1 }, null];
    }
  },
  getConnection: async () => {
    return {
      release: () => console.log('Mock connection released')
    };
  }
};

// Create a connection pool
let pool;
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'user_auth_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // 10 seconds timeout
  });

  console.log('MySQL pool created');
} catch (error) {
  console.error('Error creating MySQL pool:', error);
  console.log('Using mock database instead');
  pool = mockDb;
}

// Export the pool for use in other files
module.exports = pool;
