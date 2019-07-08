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
    dims: [W, H],
    origin: [0, 0]
  };
}

function generateCannon() {
  const w = 64;
  const R = 16;
  const r = 8;
  const clr = '#a00';
  const base = canvasToSprite(createCanvas(w, w));
  const cannon = canvasToSprite(createCanvas(w, w));
  base.ctx.fillStyle = clr;
  base.ctx.fillRect(w / 2 - R, w / 2, R * 2, w / 2);
  fillCirc(base, [w / 2, w / 2], R, clr);
  cannon.ctx.fillStyle = clr;
  base.ctx.fillRect(w / 2, w / 2 - r, w / 2, r * 2);
  base.origin = [w / 2, w / 2];
  cannon.origin = [w / 2, w / 2];
  cannon.angle = 0;
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
  const char = canvasToSprite(o.char);

  const sprites = [map, char];

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

  {
    const { base, cannon } = generateCannon();
    sprites.push(base);
    sprites.push(cannon);
    base.pos[0] = 150;
    base.pos[1] = findFloor(150) - 30;
  }

  {
    const { base, cannon } = generateCannon();
    sprites.push(base);
    sprites.push(cannon);
    base.pos[0] = W - 150;
    base.pos[1] = findFloor(W - 150) - 30;
  }

  const ball = generateBall();
  ball.pos = [150, 40];
  sprites.push(ball);

  function draw() {
    main.ctx.clearRect(0, 0, W, H);
    sprites.forEach((s, i) => {
      if (isFinite(s.angle)) {
        //console.log(i, s.angle);
        main.ctx.save();
        main.ctx.rotate(D2R * (s.angle || 0));
        main.ctx.translate(s.pos[0] - s.origin[0], s.pos[1] - s.origin[1]);
        main.ctx.drawImage(s.el, 0, 0);
        main.ctx.restore();
      } else {
        main.ctx.drawImage(
          s.el,
          s.pos[0] - s.origin[0],
          s.pos[1] - s.origin[1]
        );
      }
    });
  }

  function onUpdate(t, dt, keysDown) {
    //console.log(keysDown); // 37 39, 38 40

    //sprites[3].angle += 1;

    const dx = (keysDown[K_LEFT] && -1) || (keysDown[K_RIGHT] && 1) || 0;

    char.pos[0] += dx;
    char.pos[1] += t * 0.4;
    //char.angle += 2;
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
