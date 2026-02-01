export class SpaceBackground {
    constructor() {
        this.canvas = document.getElementById('bg-stars');
        this.ctx = this.canvas.getContext('2d');

        this.stars = [];
        this.nebulae = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Mouse interact
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        this.init();
        this.animate();
    }

    handleMouseMove(e) {
        // Normalized -1 to 1
        this.targetX = (e.clientX / this.width) * 2 - 1;
        this.targetY = (e.clientY / this.height) * 2 - 1;
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.init(); // Re-init on heavy resize to fill screen
    }

    init() {
        this.stars = [];
        this.nebulae = [];

        // Layer 1: Distant stars (slow, many, dim)
        this.createStars(400, 0.2, 0.8, '#ffffff', 0.5);
        // Layer 2: Mid-range stars (medium, brighter)
        this.createStars(150, 0.5, 1.5, '#a3eaff', 0.8);
        // Layer 3: Close stars (fast, few, bright)
        this.createStars(50, 1.2, 2.5, '#ffffff', 1.0);

        // Nebulae (Soft clouds) - Procedural gradients
        for (let i = 0; i < 5; i++) {
            this.nebulae.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 200 + Math.random() * 400,
                color: Math.random() > 0.5 ? 'rgba(0, 243, 255, 0.03)' : 'rgba(188, 19, 254, 0.02)',
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2
            });
        }
    }

    createStars(count, speed, sizeBase, color, alpha) {
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                z: Math.random() * 2, // fake depth
                size: Math.random() * sizeBase + 0.5,
                baseAlpha: alpha * Math.random(),
                speed: speed,
                color: color
            });
        }
    }

    animate() {
        this.ctx.fillStyle = '#050b14'; // Deep space base
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Smooth mouse follow
        this.mouseX += (this.targetX - this.mouseX) * 0.05;
        this.mouseY += (this.targetY - this.mouseY) * 0.05;

        // Draw Nebulae
        this.nebulae.forEach(neb => {
            neb.x += neb.vx;
            neb.y += neb.vy;

            // Wrap
            if (neb.x < -neb.radius) neb.x = this.width + neb.radius;
            if (neb.x > this.width + neb.radius) neb.x = -neb.radius;
            if (neb.y < -neb.radius) neb.y = this.height + neb.radius;
            if (neb.y > this.height + neb.radius) neb.y = -neb.radius;

            const grad = this.ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
            grad.addColorStop(0, neb.color);
            grad.addColorStop(1, 'transparent');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw Stars with Parallax
        this.stars.forEach(star => {
            // Move star slightly based on mouse (parallax)
            // Nearer stars (higher speed val) move more
            const px = star.x - (this.mouseX * 50 * star.speed);
            const py = star.y - (this.mouseY * 50 * star.speed);

            // Drift slowly up/left like a ship moving
            star.x -= star.speed * 0.2;

            // Wrap
            if (star.x < 0) star.x = this.width;

            // Twinkle
            const alpha = star.baseAlpha + (Math.random() * 0.2 - 0.1);

            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            this.ctx.beginPath();
            this.ctx.arc(px, py, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1.0;
        requestAnimationFrame(() => this.animate());
    }
}
