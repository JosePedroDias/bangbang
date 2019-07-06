const W = 800;
const H = 600;

const GRASS_CLR = '#291';
const IMAGE_KEY_RGX = /\/(.+)\.png/;
const IMAGE_NAMES = [/*'map',*/ 'char'];

let main;
(function() {
  const mainCanvas = document.querySelector('canvas');
  main = canvasToSprite(mainCanvas);
})();

function generateMap() {
  const el = createCanvas(W, H);
  const ctx = cvsCtx(el);
  ctx.fillStyle = GRASS_CLR;
  let y = H * 0.6;
  let x = 0;
  const y0 = y;
  ctx.beginPath();
  ctx.moveTo(x, y);
  while (x < W) {
    x += 10;
    y += Math.random() * 40 - 20;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(x, H);
  ctx.lineTo(0, H);
  ctx.fill();

  return {
    el,
    ctx,
    pos: [0, 0],
    dims: [W, H]
  };
}

loadImages(
  IMAGE_NAMES.map((fn) => `sprites/${fn}.png`),
  (url) => IMAGE_KEY_RGX.exec(url)[1],
  imgToCanvas
).then((o) => {
  //const map = canvasToSprite(o.map);
  const map = generateMap();
  const char = canvasToSprite(o.char);

  const sprites = [map, char];

  function draw() {
    main.ctx.clearRect(0, 0, W, H);
    sprites.forEach((s) => {
      main.ctx.drawImage(s.el, s.pos[0], s.pos[1]);
    });
  }

  function onUpdate(t, dt, keysDown) {
    //console.log(keysDown); // 37 39, 38 40

    const dx = (keysDown[37] && -1) || (keysDown[39] && 1) || 0;

    char.pos[0] += dx;
    char.pos[1] += t * 0.4;
    const hits = collide(map, char, true);

    if (hits.length) {
      char.pos[1] -= t * 0.4;
    }
  }

  function onFrame({ t, dt, keysDown }) {
    draw();
    onUpdate(t, dt, keysDown);
  }

  const RELEVANT_KEYS = [K_LEFT, K_RIGHT, K_UP, K_DOWN];
  function stopKey(ev) {
    return RELEVANT_KEYS.indexOf(ev.keyCode) !== -1;
  }

  gameLoop({ onFrame, stopKey });
});
