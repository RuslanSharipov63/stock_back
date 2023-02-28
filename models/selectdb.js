const mysql = require('mysql2/promise');
const config = require('../config/config.js');

async function main(name, countOffset) {
    const conn = await mysql.createConnection(config);
    const [rows, fields] = await conn.execute(`SELECT * FROM ${name} ORDER BY id DESC LIMIT ${countOffset}, 5`);
    conn.end();
    return rows;
}

module.exports = async function func(name, countOffset) {
    let qw = await main(name, countOffset);
    return qw;
}

