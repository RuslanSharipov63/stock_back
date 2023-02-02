const mysql = require('mysql2/promise');
const config = require('../config/config.js');

async function main(name) {
    const conn = await mysql.createConnection(config);
    const [rows, fields] = await conn.execute(`SELECT * FROM ${name} ORDER BY id DESC`);
    conn.end();
    return rows;
}

module.exports = async function func(name) {
    let qw = await main(name);
    return qw;
}

