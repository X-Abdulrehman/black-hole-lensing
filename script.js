
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const isMobile = window.innerWidth < 768;

canvas.width = isMobile ? window.innerWidth : 800;
canvas.height = isMobile ? window.innerHeight : 700;

const CX = canvas.width / 2;
const CY = canvas.height / 2;
const BH_RADIUS = 40;
const STRENGTH = 600;
const SPEED = 5;
const COUNT = 5;

const blackhole = { x: CX, y: CY, radius: BH_RADIUS };


function makeRays() {
        const result = []

        // left → right
        for (let i = 0; i < COUNT; i++) {
            const y = (canvas.height / COUNT) * i
            const color = `hsl(${Math.random() * 360}, 100%, 40%)`
            result.push({ x: 0, y, vx: SPEED, vy: 0, color, alive: true })
            trails.push([])
        }

        return result
    }

function stepRay(ray) {
    if (!ray.alive) {
        return
    }
    const dx = blackhole.x - ray.x
    const dy = blackhole.y - ray.y
    const distance = Math.hypot(dx, dy)
    if (distance < blackhole.radius) {
        ray.alive = false
        return
    }
    const force = Math.min(STRENGTH / (distance * distance), 2)
    ray.vx += (dx / distance) * force
    ray.vy += (dy / distance) * force
    ray.x += ray.vx
    ray.y += ray.vy
}

let rays = [];
let trails = [];
let running = false;
let animId;

function init() {
    rays = makeRays();
    trails = rays.map(() => []);
}

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // black hole gradient
    const grad = ctx.createRadialGradient(CX, CY, 0, CX, CY, 80);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.4, 'rgba(0,0,0,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(CX, CY, 80, 0, Math.PI * 2);
    ctx.fill();

    // hard center
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(CX, CY, BH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // accretion ring
    ctx.strokeStyle = 'rgba(255,140,0,0.5)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'orange';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(CX, CY, BH_RADIUS + 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // rays + trails
    rays.forEach((ray, i) => {
        if (!ray.alive) return;
        trails[i].push({ x: ray.x, y: ray.y });
        if (trails[i].length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = ray.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = ray.color;
        ctx.shadowBlur = 5;
        ctx.moveTo(trails[i][0].x, trails[i][0].y);
        trails[i].forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.shadowBlur = 0;
    });
}

function loop() {
    rays.forEach(stepRay);
    draw();

    const allDone = rays.every(r =>
        !r.alive || r.x > canvas.width || r.x < 0 || r.y > canvas.height || r.y < 0
    );

    if (allDone) {
        running = false;
        document.getElementById('btn-run').textContent = '▶ RUN';
        return;
    }

    animId = requestAnimationFrame(loop);
}

document.getElementById('btn-run').onclick = () => {
    running = !running;
    document.getElementById('btn-run').textContent = running ? '⏸ PAUSE' : '▶ RUN';
    if (running) loop();
    else cancelAnimationFrame(animId);
};

document.getElementById('btn-reset').onclick = () => {
    cancelAnimationFrame(animId);
    running = false;
    document.getElementById('btn-run').textContent = '▶ RUN';
    init();
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

// init
init();
ctx.fillStyle = '#0a0a0f';
ctx.fillRect(0, 0, canvas.width, canvas.height);
