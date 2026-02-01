export class Starfield {
    constructor() {
        this.canvas = document.getElementById('bg-stars');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.speed = 2;
        this.count = 400;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initStars();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < this.count; i++) {
            this.stars.push(this.createStar());
        }
    }

    createStar() {
        return {
            x: (Math.random() - 0.5) * this.canvas.width * 2,
            y: (Math.random() - 0.5) * this.canvas.height * 2,
            z: Math.random() * this.canvas.width
        };
    }

    animate() {
        this.ctx.fillStyle = '#050b14'; // Match bg-app
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.stars.forEach((star, i) => {
            star.z -= this.speed;

            if (star.z <= 0) {
                this.stars[i] = this.createStar();
                this.stars[i].z = this.canvas.width;
            }

            const x = (star.x / star.z) * 100 + this.cx;
            const y = (star.y / star.z) * 100 + this.cy;
            const size = (1 - star.z / this.canvas.width) * 3;
            const alpha = (1 - star.z / this.canvas.width);

            if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) return;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}
