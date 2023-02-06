const mysql = require('mysql2/promise');
const config = require('../config/config.js');

async function selectSQl(name, id) {
    const conn = await mysql.createConnection(config);
    const [rows, fields] = await conn.execute(`SELECT * FROM ${name} where author_id = ${id} ORDER BY id DESC`);
    conn.end();
    return rows;
}

module.exports = async function selectSQlAsync(name, id) {
    let qw = await selectSQl(name, id);
    return qw;
}
