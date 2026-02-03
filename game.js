const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

const GRAVITY = 0.6;
const FLOOR_Y = 360;

// ======= КАМЕРА =======
let cameraX = 0;

// ======= ГРАВЕЦЬ =======
const player = {
  x: 100,
  y: FLOOR_Y,
  w: 32,
  h: 48,
  vx: 0,
  vy: 0,
  speed: 4,
  jumpPower: -12,
  canJump: true,
  facing: 1
};

// ======= КУЛІ =======
const bullets = [];

// ======= ВОРОГИ =======
const enemies = [
  { x: 600, y: FLOOR_Y, w: 32, h: 48, dir: 1, speed: 2, minX: 550, maxX: 750, alive: true },
  { x: 1200, y: FLOOR_Y, w: 32, h: 48, dir: -1, speed: 2, minX: 1100, maxX: 1300, alive: true },
  { x: 1800, y: FLOOR_Y, w: 32, h: 48, dir: 1, speed: 1.5, minX: 1700, maxX: 2000, alive: true }
];

// ======= КАРТА =======
const MAP_WIDTH = 3000; // ширина світу

function shoot() {
  bullets.push({
    x: player.x + (player.facing === 1 ? player.w : 0),
    y: player.y + player.h / 2,
    r: 4,
    vx: 10 * player.facing
  });
}

window.addEventListener('keydown', e => {
  if (e.code === 'KeyJ') shoot();
});

// ======= ОНОВЛЕННЯ ГРАВЦЯ =======
function updatePlayer() {
  player.vx = 0;

  if (keys['ArrowRight'] || keys['KeyD']) {
    player.vx = player.speed;
    player.facing = 1;
  }
  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.vx = -player.speed;
    player.facing = -1;
  }

  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.canJump) {
    player.vy = player.jumpPower;
    player.canJump = false;
  }

  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  if (player.y >= FLOOR_Y) {
    player.y = FLOOR_Y;
    player.vy = 0;
    player.canJump = true;
  }

  // межі карти
  if (player.x < 0) player.x = 0;
  if (player.x > MAP_WIDTH - player.w) player.x = MAP_WIDTH - player.w;

  // камера слідує за гравцем
  cameraX = player.x - canvas.width / 2;
  if (cameraX < 0) cameraX = 0;
  if (cameraX > MAP_WIDTH - canvas.width) cameraX = MAP_WIDTH - canvas.width;
}

// ======= ОНОВЛЕННЯ ВОРОГІВ =======
function updateEnemies() {
  enemies.forEach(e => {
    if (!e.alive) return;

    e.x += e.speed * e.dir;

    if (e.x < e.minX) e.dir = 1;
    if (e.x > e.maxX) e.dir = -1;
  });
}

// ======= ОНОВЛЕННЯ КУЛЬ =======
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;

    // видалення куль
    if (b.x < 0 || b.x > MAP_WIDTH) {
      bullets.splice(i, 1);
      continue;
    }

    // перевірка попадання у ворога
    enemies.forEach(e => {
      if (!e.alive) return;

      if (b.x > e.x && b.x < e.x + e.w &&
          b.y > e.y && b.y < e.y + e.h) {
        e.alive = false;
        bullets.splice(i, 1);
      }
    });
  }
}

// ======= МАЛЮВАННЯ =======
function drawBackground() {
  ctx.fillStyle = '#3b5c7a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // далекі дерева
  ctx.fillStyle = '#2b3f2b';
  for (let i = 0; i < 40; i++) {
    const x = i * 150 - cameraX * 0.5;
    ctx.fillRect(x, 220, 40, 200);
    ctx.beginPath();
    ctx.arc(x + 20, 220, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  // земля
  ctx.fillStyle = '#3b2b16';
  ctx.fillRect(-cameraX, FLOOR_Y + player.h, MAP_WIDTH, 200);

  ctx.fillStyle = '#4f8a2b';
  ctx.fillRect(-cameraX, FLOOR_Y + player.h - 10, MAP_WIDTH, 10);
}

function drawPlayer() {
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(player.x - cameraX, player.y, player.w, player.h);

  ctx.fillStyle = '#c02020';
  ctx.fillRect(player.x - cameraX, player.y + 5, player.w, 6);

  ctx.fillStyle = '#111';
  const gunX = player.facing === 1 ? player.x + player.w - cameraX : player.x - 16 - cameraX;
  ctx.fillRect(gunX, player.y + 18, 16, 6);
}

function drawEnemies() {
  enemies.forEach(e => {
    if (!e.alive) return;

    ctx.fillStyle = '#552222';
    ctx.fillRect(e.x - cameraX, e.y, e.w, e.h);

    ctx.fillStyle = '#000';
    const eyeX = e.dir === 1 ? e.x + e.w - 10 : e.x + 5;
    ctx.fillRect(eyeX - cameraX, e.y + 10, 6, 6);
  });
}

function drawBullets() {
  ctx.fillStyle = '#ffd000';
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x - cameraX, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ======= ГОЛОВНИЙ ЦИКЛ =======
function loop() {
  updatePlayer();
  updateEnemies();
  updateBullets();

  drawBackground();
  drawPlayer();
  drawEnemies();
  drawBullets();

  requestAnimationFrame(loop);
}

loop();
