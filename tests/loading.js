const rgx = /\/(.+)\.png/;

const mainCanvas = document.querySelector('canvas');
const mainCtx = cvsCtx(mainCanvas);

function transf(url) {
  return rgx.exec(url)[1];
}

loadImages(['sprites/map.png', 'sprites/char.png'], transf, imgToCanvas).then(
  (o) => {
    console.log(o);
    mainCtx.drawImage(o.map, 0, 0);
    mainCtx.drawImage(o.char, 0, 0);
  }
);
