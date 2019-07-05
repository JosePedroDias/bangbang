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

const canvasEl = document.querySelector('canvas');
const ctx = canvasEl.getContext('2d');

let t = 0;
let prevT = -1 / 60 / 1000;

const imageNames = ['char', 'map'];
const loadedImages = {};
const sprites = [
  {
    pos: [0, 0],
    sprite: 'map'
  },
  {
    pos: [50, 50],
    sprite: 'char'
  }
];

function draw(dt) {
  ctx.clearRect(0, 0, 800, 600);
  sprites.forEach((s) => {
    ctx.drawImage(s.el, s.pos[0], s.pos[1]);
  });
}

function onUpdate(dt) {
  sprites[1].pos[1] += t * 0.4;
  const hits = collide(sprites[0], sprites[1]);

  // stop at collision
  /*if (hits.length) {
    sprites[1].pos[1] -= t * 0.4;
  }*/

  // carve collision out of the map
  if (hits.length) {
    hits.forEach((pos) => {
      clearPixel(sprites[0], pos);
      //setPixel(sprites[0], pos, 'red'); // TODO appearing black?
    });
  }
}

function onFrame(dt) {
  draw(dt);
  onUpdate(dt);
}

function collide(s1, s2) {
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
      }
    }
  }

  return hits;
}

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

function setPixel(s, [x, y], clr) {
  s.fillStyle = clr;
  s.ctx.fillRect(x, y, 1, 1);
}

function clearPixel(s, [x, y]) {
  s.ctx.clearRect(x, y, 1, 1);
}

function boot() {
  Promise.all([
    loadImage('sprites/char.png'),
    loadImage('sprites/map.png')
  ]).then((imageEls) => {
    imageNames.forEach((key, i) => {
      const imgEl = imageEls[i];
      const canvasEl = document.createElement('canvas');
      canvasEl.width = imgEl.width;
      canvasEl.height = imgEl.height;
      const ctx = canvasEl.getContext('2d');
      ctx.drawImage(imgEl, 0, 0);
      //console.log(key, imgEl.width, imgEl.height);
      loadedImages[key] = { el: canvasEl, ctx };
    });

    sprites.forEach((s) => {
      const li = loadedImages[s.sprite];
      s.ctx = li.ctx;
      s.el = li.el;
      s.dims = [s.el.width, s.el.height];
    });

    /*
      carveRectHole(sprites[0], [200, 500], [40, 20]);
      carveCircHole(sprites[0], [300, 500], 20);
      carveRectHole(sprites[0], [400, 500], [40, 20]);
      carveCircHole(sprites[0], [500, 500], 20);

      fillRect(sprites[0], [200, 500], [32, 12], 'red');
      fillCirc(sprites[0], [300, 500], 16, 'blue');
      fillRect(sprites[0], [400, 500], [32, 12], 'yellow');
      fillCirc(sprites[0], [500, 500], 16, 'purple');
      */

    //collide(sprites[0], sprites[1]);

    window.requestAnimationFrame(step);
  });
}

function step(ms) {
  prevT = t;
  t = ms / 1000;
  const dt = t - prevT;
  onFrame(dt);
  window.requestAnimationFrame(step);
}

boot();
