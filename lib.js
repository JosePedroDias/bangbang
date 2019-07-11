// common functions

function noop() {}

function identity(a) {
  return a;
}

// image loading

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('img');

    el.addEventListener('load', () => {
      resolve(el);
    });
    el.addEventListener('error', (err) => {
      reject(err);
    });

    el.src = url;
  });
}

function loadImages(urls, urlToNameFn = identity, imgTransfFn = identity) {
  const promises = urls.map(loadImage);
  const keys = urls.map(urlToNameFn);
  const o = {};

  return Promise.all(promises).then((els) => {
    els.forEach((el, i) => {
      o[keys[i]] = imgTransfFn(el);
    });

    return o;
  });
}

function imgToCanvas(imgEl) {
  const canvasEl = createCanvas(imgEl.width, imgEl.height);
  const ctx = cvsCtx(canvasEl);
  ctx.drawImage(imgEl, 0, 0);
  return canvasEl;
}

// canvas utils

function createCanvas(w, h) {
  const canvasEl = document.createElement('canvas');
  canvasEl.width = w;
  canvasEl.height = h;
  return canvasEl;
}

function cvsCtx(el) {
  return el.getContext('2d');
}

// pixel manip

function setPixel(s, [x, y], clr) {
  s.ctx.fillStyle = clr;
  s.ctx.fillRect(x, y, 1, 1);
}

function clearPixel(s, [x, y]) {
  s.ctx.clearRect(x, y, 1, 1);
}

function getPixel(s, [x, y]) {
  return s.ctx.getImageData(x, y, 1, 1).data;
}

// shape manip
function carveRectHole(s, [x, y], [w, h]) {
  s.ctx.clearRect(x - w / 2, y - h / 2, w, h);
}

function fillRect(s, [x, y], [w, h], clr) {
  s.ctx.fillStyle = clr;
  s.ctx.fillRect(x - w / 2, y - h / 2, w, h);
}

function carveCircHole(s, [x, y], r) {
  s.ctx.globalCompositeOperation = 'destination-out';
  s.ctx.beginPath();
  s.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  s.ctx.fill();
  s.ctx.globalCompositeOperation = 'source-over';
}

function fillCirc(s, [x, y], r, clr) {
  s.ctx.fillStyle = clr;
  s.ctx.beginPath();
  s.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  s.ctx.fill();
}

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

// bresenham algo

function line(x0, y0, x1, y1, onPixel) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (onPixel(x0, y0)) {
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

// game loop

const K_LEFT = 37;
const K_RIGHT = 39;
const K_UP = 38;
const K_DOWN = 40;
const K_SPACE = 32;
const K_ENTER = 13;
const K_ESCAPE = 27;

function gameLoop({ onFrame = noop, stopKey = noop }) {
  let t = 0;
  let prevT = -1 / 60 / 1000;

  const keysDown = {};
  let keysWentDown = {};
  let keysWentUp = {};

  function step(ms) {
    prevT = t;
    t = ms / 1000;
    const dt = t - prevT;
    onFrame({ t, dt, keysDown, keysWentDown, keysWentUp });
    keysWentDown = {};
    keysWentUp = {};
    window.requestAnimationFrame(step);
  }

  document.body.addEventListener('keydown', (ev) => {
    const kc = ev.keyCode;
    keysWentDown[kc] = true;
    keysDown[kc] = true;

    if (stopKey(ev)) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  });

  document.body.addEventListener('keyup', (ev) => {
    const kc = ev.keyCode;
    keysWentUp[kc] = true;
    delete keysDown[kc];

    if (stopKey(ev)) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  });

  window.requestAnimationFrame(step);
}

function canvasToSprite(el) {
  return {
    el,
    ctx: cvsCtx(el),
    dims: [el.width, el.height],
    pos: [0, 0],
    origin: [0, 0]
  };
}

// assumes each sprite has dims, pos, ctx
function collide(s1, s2, breakOnFirstHit = false) {
  const [w, h] = s2.dims;
  const [x, y] = s2.pos;

  // assumes map to be s1 at 0, 0 origin
  const hits = [];
  const iData1 = s1.ctx.getImageData(x, y, w, h);
  const d1 = iData1.data;
  const iData2 = s2.ctx.getImageData(0, 0, w, h);
  const d2 = iData2.data;

  for (let yi = 0; yi < h; ++yi) {
    for (let xi = 0; xi < w; ++xi) {
      const i0 = (yi * w + xi) * 4 + 3;
      const a = d1[i0];
      const b = d2[i0];
      if (a & b) {
        //console.log(`pos: [${xi}, ${yi}] | a: ${a} | b: ${b}`);
        hits.push([xi + x, yi + y]);
        if (breakOnFirstHit) {
          return hits;
        }
      }
    }
  }

  return hits;
}

// dynamic script loading

function loadScript(url) {
  const scriptEl = document.createElement('script');
  scriptEl.src = url;
  document.body.appendChild(scriptEl);
}
