/**
 * NeonType — Animated Particle Background
 * Creates a canvas-based particle system with floating orbs and grid lines
 */

(function () {
    'use strict';

    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let gridOpacity = 0.03;
    let animationId;

    // Configuration
    const CONFIG = {
        particleCount: 50,
        particleMinSize: 1,
        particleMaxSize: 3,
        particleSpeed: 0.3,
        connectionDistance: 150,
        connectionOpacity: 0.06,
        orbCount: 4,
        orbMinSize: 80,
        orbMaxSize: 200,
        orbSpeed: 0.2,
        gridSize: 40,
        primaryColor: { r: 255, g: 46, b: 46 },
    };

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = CONFIG.particleMinSize + Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize);
            this.speedX = (Math.random() - 0.5) * CONFIG.particleSpeed;
            this.speedY = (Math.random() - 0.5) * CONFIG.particleSpeed;
            this.opacity = 0.1 + Math.random() * 0.4;
            this.pulseSpeed = 0.005 + Math.random() * 0.01;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.pulsePhase += this.pulseSpeed;

            // Wrap around
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            this.currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.pulsePhase));
        }

        draw() {
            const { r, g, b } = CONFIG.primaryColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.currentOpacity})`;
            ctx.fill();

            // Glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.currentOpacity * 0.15})`;
            ctx.fill();
        }
    }

    // Floating Orb class
    class Orb {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = CONFIG.orbMinSize + Math.random() * (CONFIG.orbMaxSize - CONFIG.orbMinSize);
            this.speedX = (Math.random() - 0.5) * CONFIG.orbSpeed;
            this.speedY = (Math.random() - 0.5) * CONFIG.orbSpeed;
            this.opacity = 0.02 + Math.random() * 0.04;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < -this.size) this.x = width + this.size;
            if (this.x > width + this.size) this.x = -this.size;
            if (this.y < -this.size) this.y = height + this.size;
            if (this.y > height + this.size) this.y = -this.size;
        }

        draw() {
            const { r, g, b } = CONFIG.primaryColor;
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.opacity})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    let orbs = [];

    // Draw subtle grid
    function drawGrid() {
        const { r, g, b } = CONFIG.primaryColor;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${gridOpacity})`;
        ctx.lineWidth = 0.5;

        for (let x = 0; x < width; x += CONFIG.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = 0; y < height; y += CONFIG.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    // Draw connections between nearby particles
    function drawConnections() {
        const { r, g, b } = CONFIG.primaryColor;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.connectionDistance) {
                    const opacity = CONFIG.connectionOpacity * (1 - dist / CONFIG.connectionDistance);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // Resize handler
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    // Initialize
    function init() {
        resize();
        particles = [];
        orbs = [];

        // Reduce particles on mobile
        const count = width < 600 ? Math.floor(CONFIG.particleCount / 2) : CONFIG.particleCount;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }

        for (let i = 0; i < CONFIG.orbCount; i++) {
            orbs.push(new Orb());
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        drawGrid();

        // Update and draw orbs
        orbs.forEach(orb => {
            orb.update();
            orb.draw();
        });

        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        drawConnections();

        animationId = requestAnimationFrame(animate);
    }

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            // Reinitialize particles for new dimensions
            particles.forEach(p => {
                if (p.x > width) p.x = Math.random() * width;
                if (p.y > height) p.y = Math.random() * height;
            });
        }, 200);
    });

    // Start
    init();
    animate();
})();
