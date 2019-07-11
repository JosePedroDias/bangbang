const W = 800;
const H = 600;

const GRASS_CLR = '#291';
const IMAGE_KEY_RGX = /\/(.+)\.png/;
const IMAGE_NAMES = []; //'map', 'char'];

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
    dims: [W, H],
    origin: [0, 0]
  };
}

function generateCannon(clr, clr2) {
  const w = 64;
  const R = 16;
  const r = 8;

  const base = canvasToSprite(createCanvas(w, w));
  base.dims = [w, w];
  base.origin = [w / 2, w / 2];
  base.ctx.fillStyle = clr;
  base.ctx.fillRect(w / 2 - R, w / 2, R * 2, w / 2);
  fillCirc(base, [w / 2, w / 2], R, clr);

  const cannon = canvasToSprite(createCanvas(w, w));
  cannon.dims = [w, w];
  cannon.origin = [w / 2, w / 2];
  cannon.ctx.fillStyle = clr2;
  cannon.ctx.fillRect(w / 2, w / 2 - r, w / 2, r * 2);
  fillCirc(cannon, [w / 2, w / 2], r, clr2);

  const pos = [120, 60];
  base.pos = pos;
  cannon.pos = pos;

  return { base, cannon };
}

function generateBall() {
  const w = 14;
  const ball = canvasToSprite(createCanvas(w, w));
  const r = 6;
  const clr = '#444';
  fillCirc(ball, [w / 2, w / 2], r, clr);
  //ball.pos = [300, 200];
  ball.origin = [w / 2, w / 2];
  return ball;
}

loadImages(
  IMAGE_NAMES.map((fn) => `sprites/${fn}.png`),
  (url) => IMAGE_KEY_RGX.exec(url)[1],
  imgToCanvas
).then((o) => {
  //const map = canvasToSprite(o.map);
  const map = generateMap();

  const sprites = [map];

  function findFloor(x) {
    let y = 0;
    function onPixel(x, y_) {
      y = y_;
      const v = getPixel(map, [x, y_]);
      return !v[3];
    }
    line(x, 0, x, H, onPixel);
    return y;
  }

  const dx = 90;

  {
    const { base, cannon } = generateCannon('#a00', '#800');
    sprites.push(base);
    sprites.push(cannon);
    base.pos[0] = dx;
    base.pos[1] = findFloor(dx) - 30;
    cannon.angle = 0;
  }

  {
    const { base, cannon } = generateCannon('#00a', '#008');
    sprites.push(base);
    sprites.push(cannon);
    base.pos[0] = W - dx;
    base.pos[1] = findFloor(W - dx) - 30;
    cannon.angle = 180;
  }

  const ball = generateBall();
  ball.pos = [150, 40];
  sprites.push(ball);

  function draw() {
    const c = main.ctx;
    c.clearRect(0, 0, W, H);
    sprites.forEach((s, i) => {
      if (isFinite(s.angle)) {
        //console.log(i, s.angle);
        c.save();

        c.translate(s.pos[0], s.pos[1]);
        c.rotate(D2R * (s.angle || 0));
        //c.rotate(2);
        c.drawImage(
          s.el,
          0,
          0,
          s.dims[0],
          s.dims[1],
          -s.origin[0],
          -s.origin[1],
          s.dims[0],
          s.dims[1]
        );

        c.restore();
      } else {
        c.drawImage(s.el, s.pos[0] - s.origin[0], s.pos[1] - s.origin[1]);
      }
    });
  }

  function onUpdate(t, dt, keysDown) {
    //console.log(keysDown); // 37 39, 38 40

    const cannons = [sprites[2], sprites[4]];

    const dr0 = (keysDown[K_LEFT] && -1) || (keysDown[K_RIGHT] && 1) || 0;
    const dr1 = (keysDown[K_UP] && -1) || (keysDown[K_DOWN] && 1) || 0;

    //if (dr0) console.log('dr0', dr0);
    //if (dr1) console.log('dr1', dr1);

    cannons[0].angle += dr0 * 2;
    cannons[1].angle -= dr1 * 2;

    /*const hits = collide(map, char, true);
    if (hits.length) {
      char.pos[1] -= t * 0.4;
    }*/
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
