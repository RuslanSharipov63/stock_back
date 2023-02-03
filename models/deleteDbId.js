const mysql = require('mysql2/promise');
const config = require('../config/config.js');

async function main(name, id, author_id) {
    const conn = await mysql.createConnection(config);
    await conn.execute(`DELETE FROM ${name} WHERE id = ${id}`);
    const [rows, fields] = await conn.execute(`SELECT * FROM ${name} WHERE author_id = ${author_id} ORDER BY id DESC`);
    conn.end();
    return rows;
}


module.exports = async function func(name, id, author_id) {
    let qw = await main(name, id, author_id);
    return qw;
}