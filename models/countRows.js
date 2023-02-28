const mysql = require('mysql2/promise');
const config = require('../config/config.js');

module.exports = async function countRows() {
    const conn = await mysql.createConnection(config);
    const [rows, fields] = await conn.execute('SELECT COUNT(*) FROM data')
    conn.end();
    return rows;
}