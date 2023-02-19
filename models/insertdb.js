const mysql = require('mysql2/promise');
const config = require('../config/config.js');

async function main(author_id, img_original_big, tags, size) {
   let dataImg = [
        author_id,
        img_original_big,
        tags,
        size
    ]
    const conn = await mysql.createConnection(config);
    await conn.query('INSERT into data(author_id, img_original_big, tags, size) values (?, ?, ?, ?)', dataImg);
    const [rows, fields] = await conn.execute(`SELECT * FROM data`);
    conn.end();
    return rows;
}


module.exports = async function func(author_id, img_original_big, tags, size) {
    let qw = await main(author_id, img_original_big, tags, size);
    return qw;
}
