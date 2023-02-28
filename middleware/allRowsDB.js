const mysql = require('mysql2/promise');
const config = require('../config/config.js');


/* количество строк во всей таблице */
module.exports = async function allRowsDB() {
    const conn = await mysql.createConnection(config);
    const [rows] = await conn.execute('SELECT COUNT(*) FROM data');
    conn.end();
    return rows;
}


