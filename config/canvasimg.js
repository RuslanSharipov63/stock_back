const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');

module.exports = function draw(a) {

    global.Image = сanvas.Image;
    /* let ctx = document.getElementById('canvas').getContext('2d'); */
    let img = new Image();
    img.onload = function () {
        //Загружается изображение и вставляется с координат х = 50  у = 50
        ctx.drawImage(img, 50, 50);
        ctx.beginPath();
        //Начинаем рисовать с координат х = 50, у = 50
        ctx.moveTo(50, 50);
        ctx.lineWidth = 15; // толщина линии
        ctx.strokeStyle = "#ff0000"; // цвет линии
        ctx.lineTo(650, 650);
        ctx.lineCap = "round"; // закругляем наконечник
        ctx.moveTo(50, 650);
        ctx.strokeStyle = 'magenta';
        ctx.lineTo(650, 50);
        ctx.stroke();
    };
    img.src = a;
}   