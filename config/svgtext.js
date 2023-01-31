const sharp = require('sharp');

module.exports = addText = (a, b) => {
  const width = 300;
  const height = 100;
  const text = "Wmark";

  const svgText = `
    <svg width="${width}" height="${height}">
      <style>
        .title { fill: red; font-size: 85px}
      </style>
      <text x="45%" y="40%" text-anchor="middle" class="title">${text}</text>
    </svg>`

  const svgBuffer = Buffer.from(svgText);

  sharp(a)
    .composite([{ input: svgBuffer, left: 10, top: 10 }])
    .toFile(b)
}
