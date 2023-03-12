const mysql = require('mysql2/promise');
const config = require('../config/config.js');
const regExtension = require('./RegExtension');

/* количество строк в таблице где видео */
module.exports = async function rowsImgDb() {
    const conn = await mysql.createConnection(config);
    const [rows] = await conn.execute('SELECT * FROM data');
    const dataVideo = await rows.filter(item => !regExtension.test(item.img_original_big));
    const dataVideoRows = await dataVideo.length;
    const arrRows = Array.isArray(dataVideoRows) ? dataVideoRows : [{ 'COUNT(*)': dataVideoRows }]
    conn.end();
    return arrRows;
}