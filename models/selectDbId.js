const mysql = require('mysql2/promise');
const config = require('../config/config.js');

async function selectSQl(name, id) {
    console.log(name, id)
    const conn = await mysql.createConnection(config);
    const [rows, fields] = await conn.execute(`SELECT * FROM ${name} where id = ${id}`);
    conn.end();
    return rows;
}

module.exports = async function selectSQlAsync(name, id) {
    let qw = await selectSQl(name, id);
    return qw;
}
