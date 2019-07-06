const rgx = /\/(.+)\.png/;

const mainCanvas = document.querySelector('canvas');
const mainCtx = cvsCtx(mainCanvas);

function transf(url) {
  return rgx.exec(url)[1];
}

loadImages(['sprites/map.png', 'sprites/char.png'], transf, imgToCanvas).then(
  (o) => {
    const map = canvasToSprite(o.map);
    const char = canvasToSprite(o.char);
    const main = canvasToSprite(mainCanvas);

    char.pos = [200, 260];

    const sprites = [map, char];

    sprites.forEach((s) => {
      const [x, y] = s.pos;
      mainCtx.drawImage(s.el, x, y);
    });

    const hits = collide(map, char);
    console.log('hits', hits);
    hits.forEach((pos) => {
      setPixel(main, pos, 'red');
    });
  }
);
