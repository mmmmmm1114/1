const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

const GRAVITY = 0.6;
const FLOOR_Y = 360;

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
  facing: 1 // 1 – вправо, -1 – вліво
};

const bullets = [];

function shoot() {
  bullets.push({
    x: player.x + (player.facing === 1 ? player.w : 0),
    y: player.y + player.h / 2,
    r: 4,
    vx: 10 * player.facing
  });
}

function updatePlayer() {
  // рух по X
  player.vx = 0;
  if (keys['ArrowRight'] || keys['KeyD']) {
    player.vx = player.speed;
    player.facing = 1;
  }
  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.vx = -player.speed;
    player.facing = -1;
  }

  // стрибок
  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.canJump) {
    player.vy = player.jumpPower;
    player.canJump = false;
  }

  // гравітація
  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  // підлога
  if (player.y >= FLOOR_Y) {
    player.y = FLOOR_Y;
    player.vy = 0;
    player.canJump = true;
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].vx;
    if (bullets[i].x < -50 || bullets[i].x > canvas.width + 50) {
      bullets.splice(i, 1);
    }
  }
}

window.addEventListener('keydown', e => {
  if (e.code === 'KeyJ') { // кнопка стрільби
    shoot();
  }
});

function drawBackground() {
  // небо
  ctx.fillStyle = '#3b5c7a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // "ліс"
  ctx.fillStyle = '#23402f';
  for (let i = 0; i < 10; i++) {
    const x = i * 80 + 20;
    ctx.fillRect(x, 200, 40, 200);
    ctx.beginPath();
    ctx.arc(x + 20, 200, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  // земля
  ctx.fillStyle = '#3b2b16';
  ctx.fillRect(0, FLOOR_Y + player.h, canvas.width, canvas.height - FLOOR_Y);
  ctx.fillStyle = '#4f8a2b';
  ctx.fillRect(0, FLOOR_Y + player.h - 10, canvas.width, 10);
}

function drawPlayer() {
  // тіло
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // пов'язка
  ctx.fillStyle = '#c02020';
  ctx.fillRect(player.x, player.y + 5, player.w, 6);

  // "зброя"
  ctx.fillStyle = '#111';
  const gunX = player.facing === 1 ? player.x + player.w : player.x - 16;
  ctx.fillRect(gunX, player.y + 18, 16, 6);
}

function drawBullets() {
  ctx.fillStyle = '#ffd000';
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function loop() {
  updatePlayer();
  updateBullets();

  drawBackground();
  drawPlayer();
  drawBullets();

  requestAnimationFrame(loop);
}

loop();
