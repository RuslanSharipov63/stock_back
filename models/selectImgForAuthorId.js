const mysql = require('mysql2/promise');
const config = require('./../config/config.js');

/* выбираем все картинки где автор id совпадает с автор id для страницы с одной картинкой */

async function main(name, authorid) {
    const conn = await mysql.createConnection(config);
    const [rows, fields] = await conn.execute(`SELECT * from ${name} WHERE author_id = ${authorid} ORDER BY id DESC`)
    conn.end();
    return rows;

}

module.exports = async function maintwo(name, authorid) {
    let rowstwo = await main(name, authorid);
    return rowstwo;
}