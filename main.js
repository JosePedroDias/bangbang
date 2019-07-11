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
  ball.pos = [-100, -100];
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
  ball.acc = [0, 0];
  ball.vel = [0, 0];
  sprites.push(ball);

  function draw() {
    const c = main.ctx;
    c.clearRect(0, 0, W, H);
    sprites.forEach((s) => {
      if (isFinite(s.angle)) {
        c.save();

        c.translate(s.pos[0], s.pos[1]);
        c.rotate(D2R * (s.angle || 0));
        c.drawImage(
          //console.log(i, s.angle);
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

  let powers = [0, 0];

  const P1_CCW = K_LEFT;
  const P1_FIRE = K_SPACE;
  const P1_CW = K_RIGHT;

  const P2_CCW = K_A;
  const P2_FIRE = K_S;
  const P2_CW = K_D;

  function onUpdate(t, dt, keysDown, keysWentUp) {
    //console.log(keysDown); // 37 39, 38 40

    const cannons = [sprites[2], sprites[4]];
    const ball = sprites[5];

    if (ball.acc[1]) {
      const dt2 = -0.5 * dt * dt;

      ball.vel[0] += ball.acc[0] * dt;
      ball.vel[1] += ball.acc[1] * dt;
      ball.pos[0] += ball.vel[0] * dt + ball.acc[0] * dt2;
      ball.pos[0] += ball.vel[1] * dt + ball.acc[1] * dt2;
      //console.log(`${ball.pos[0].toFixed(2)} , ${ball.pos[1].toFixed(2)}`);
    }

    const dr0 = (keysDown[P1_CCW] && -1) || (keysDown[P1_CW] && 1) || 0;
    const dr1 = (keysDown[P2_CCW] && -1) || (keysDown[P2_CW] && 1) || 0;

    if (keysWentUp[P1_FIRE]) {
      const p = powers[0] * 10;
      //console.log(p);
      ball.acc = [0, 9.8];
      ball.vel = polar([0, 0], cannons[0].angle, p);
      ball.pos = polar(cannons[0].pos, cannons[0].angle, 30);
      powers[0] = 0;
    } else if (keysDown[P1_FIRE]) {
      powers[0] += 1;
    }

    if (keysWentUp[P2_FIRE]) {
      const p = powers[1];
      //console.log(p);
      ball.acc = [0, 9.8];
      ball.vel = polar([0, 0], cannons[1].angle, p);
      ball.pos = polar(cannons[1].pos, cannons[1].angle, 30);
      powers[1] = 0;
    } else if (keysDown[P2_FIRE]) {
      powers[1] += 1;
    }

    //if (dr0) console.log('dr0', dr0);
    //if (dr1) console.log('dr1', dr1);

    cannons[0].angle += dr0 * 2;
    cannons[1].angle += dr1 * 2;

    /*const hits = collide(map, char, true);
    if (hits.length) {
      char.pos[1] -= t * 0.4;
    }*/
  }

  function onFrame({ t, dt, keysDown, keysWentUp }) {
    draw();
    onUpdate(t, dt, keysDown, keysWentUp);
  }

  const RELEVANT_KEYS = [K_LEFT, K_RIGHT, K_SPACE, K_A, K_S, K_D];
  function stopKey(ev) {
    return RELEVANT_KEYS.indexOf(ev.keyCode) !== -1;
  }

  gameLoop({ onFrame, stopKey });
});
