const el1 = document.createElement('div');
const el2 = document.createElement('div');
const el3 = document.createElement('div');
el3.innerHTML = 'keys went down: ';
document.body.appendChild(el1);
document.body.appendChild(el2);
document.body.appendChild(el3);

const wentDown = [];
function onFrame({ t, dt, keysDown, keysWentDown, keysWentUp }) {
  el1.innerHTML = `t: ${t.toFixed(2)}, dt: ${dt.toFixed(2)}`;
  el2.innerHTML = 'keys are down: ' + Object.keys(keysDown).join(' ');
  el3.innerHTML += ' ' + Object.keys(keysWentDown).join(' ');
}

const RELEVANT_KEYS = [K_LEFT, K_RIGHT, K_UP, K_DOWN];
function stopKey(ev) {
  return RELEVANT_KEYS.indexOf(ev.keyCode) !== -1;
}

gameLoop({ onFrame, stopKey });
