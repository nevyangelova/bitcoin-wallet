const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../wallet.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            plaid_access_token TEXT,
            bitcoin_address TEXT,
            bitcoin_balance REAL DEFAULT 0
        );
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_email ON users (email);`);
});

module.exports = db;