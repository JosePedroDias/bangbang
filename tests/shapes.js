const mainCanvas = document.querySelector('canvas');
const mainCtx = cvsCtx(mainCanvas);

loadImage('sprites/map.png').then((imgEl) => {
  const canvasEl = imgToCanvas(imgEl);
  const sprite = canvasToSprite(canvasEl);

  carveRectHole(sprite, [200, 500], [40, 20]);
  carveCircHole(sprite, [300, 500], 20);
  carveRectHole(sprite, [400, 500], [40, 20]);
  carveCircHole(sprite, [500, 500], 20);

  fillRect(sprite, [200, 500], [32, 12], 'red');
  fillCirc(sprite, [300, 500], 16, 'blue');
  fillRect(sprite, [400, 500], [32, 12], 'yellow');
  fillCirc(sprite, [500, 500], 16, 'purple');

  mainCtx.drawImage(sprite.el, 0, 0);
});
