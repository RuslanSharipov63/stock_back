const mysql = require('mysql2/promise');
const config = require('../config/config.js');

module.exports = async function main(name, email, password) {
    let users = [
        name, email, password
    ]
    const conn = await mysql.createConnection(config);
    await conn.query('INSERT INTO users(name, email,  password) VALUES (?, ?, ? )', users);
    conn.end();

}
