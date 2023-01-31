const mysql = require('mysql2/promise');
const config = require('../config/config.js');

module.exports = async function main(author_id, img_water_big, img_original_big, tags) {
   let dataImg = [
        author_id,
        img_water_big,
        img_original_big,
        tags
    ]
    const conn = await mysql.createConnection(config);
    await conn.query('INSERT into data(author_id, img_water_big,  img_original_big, tags) values (?, ?, ?, ?)', dataImg);
    conn.end();
}



