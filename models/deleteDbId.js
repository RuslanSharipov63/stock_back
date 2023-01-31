const mysql = require('mysql2/promise');
const config = require('../config/config.js');

async function main(name, id) {
    const conn = await mysql.createConnection(config);
    const [rows, fields] = await conn.execute(`DELETE FROM ${name} WHERE id = ${id}`);
    conn.end();
    return rows;
}


module.exports = async function func(name, id) {
    let qw = await main(name, id);
    return qw;
}