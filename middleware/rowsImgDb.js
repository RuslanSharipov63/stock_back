const mysql = require('mysql2/promise');
const config = require('../config/config.js');
const regExtension = require('./RegExtension');

/* количество строк в таблице где изображения */
module.exports = async function rowsImgDb() {
    const conn = await mysql.createConnection(config);
    const [rows] = await conn.execute('SELECT * FROM data');
    const dataImg = await rows.filter(item => regExtension.test(item.img_original_big));
    const dataImgRows = await dataImg.length;
    conn.end();
    return dataImgRows;
}