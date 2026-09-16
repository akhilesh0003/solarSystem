import { LightningElement, track, wire } from 'lwc';
import getPlanets from '@salesforce/apex/SolarSystemController.getPlanetsJSON';

export default class SolarSystemExplorer extends LightningElement {
    @track planets = [];
    @track selectedPlanet = null;
    @track isPlaying = true;
    @track speed = 1;
    @track hoveredPlanet = null;
    @track isLoading = true;

    angles = [];
    animationFrame = null;
    lastTime = 0;
    canvas;
    ctx;
    stars = [];

    connectedCallback() {
        this.loadPlanetData();
    }

    renderedCallback() {
        if (!this.canvas) {
            this.canvas = this.template.querySelector('canvas');
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
                this.generateStars();
                this.startAnimation();
            }
        }
    }

    disconnectedCallback() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    async loadPlanetData() {
        try {
            const result = await getPlanets();
            this.planets = JSON.parse(result);
            this.angles = this.planets.map(() => Math.random() * Math.PI * 2);
            this.isLoading = false;
        } catch (error) {
            console.error('Error loading planets:', error);
            this.isLoading = false;
        }
    }

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.7 + 0.3
            });
        }
    }

    startAnimation() {
        const animate = (timestamp) => {
            this.draw(timestamp);
            this.animationFrame = requestAnimationFrame(animate);
        };
        this.animationFrame = requestAnimationFrame(animate);
    }

    draw(timestamp) {
        if (!this.canvas || !this.ctx) return;

        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const centerX = width / 2;
        const centerY = height / 2;

        if (this.lastTime === 0) this.lastTime = timestamp;
        const delta = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, width, height);

        // Draw stars
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
            this.ctx.fill();
        });

        const maxOrbit = 430;
        const availableRadius = Math.min(width, height) / 2 - 40;
        const scale = availableRadius / maxOrbit;

        // Draw orbits
        this.planets.forEach(planet => {
            const orbitRadius = planet.orbitRadius * scale;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });

        // Draw Sun
        const sunGrad = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
        sunGrad.addColorStop(0, '#fff7e6');
        sunGrad.addColorStop(0.3, '#ffcc00');
        sunGrad.addColorStop(0.7, '#ff9500');
        sunGrad.addColorStop(1, '#ff6600');
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        this.ctx.fillStyle = sunGrad;
        this.ctx.fill();

        // Draw planets
        this.planets.forEach((planet, index) => {
            if (this.isPlaying) {
                const angularSpeed = (2 * Math.PI) / (planet.orbitalPeriod * 0.01) * this.speed;
                this.angles[index] += angularSpeed * delta;
            }

            const angle = this.angles[index];
            const orbitRadius = planet.orbitRadius * scale;
            const x = centerX + Math.cos(angle) * orbitRadius;
            const y = centerY + Math.sin(angle) * orbitRadius;
            const planetSize = Math.max(planet.size * scale * 0.7, 4);

            const isHovered = this.hoveredPlanet === planet.name;
            const isSelected = this.selectedPlanet && this.selectedPlanet.name === planet.name;

            if (isHovered || isSelected) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, planetSize + 6, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                this.ctx.fill();
            }

            const pGrad = this.ctx.createRadialGradient(
                x - planetSize * 0.3, y - planetSize * 0.3, 0, x, y, planetSize
            );
            pGrad.addColorStop(0, this.lightenColor(planet.color, 40));
            pGrad.addColorStop(1, planet.color);
            this.ctx.beginPath();
            this.ctx.arc(x, y, planetSize, 0, Math.PI * 2);
            this.ctx.fillStyle = pGrad;
            this.ctx.fill();

            if (planet.name === 'Saturn') {
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, planetSize * 1.8, planetSize * 0.5, -0.3, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(232,213,163,0.6)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }

            if (isHovered || isSelected) {
                this.ctx.font = '12px sans-serif';
                this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(planet.name, x, y - planetSize - 8);
            }
        });
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const positions = this.getPlanetPositions();

        for (let i = positions.length - 1; i >= 0; i--) {
            const pos = positions[i];
            const dist = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2);
            if (dist <= pos.size + 10) {
                this.selectedPlanet = pos.planet;
                return;
            }
        }
        this.selectedPlanet = null;
    }

    handleCanvasMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const positions = this.getPlanetPositions();

        let found = false;
        for (const pos of positions) {
            const dist = Math.sqrt((mouseX - pos.x) ** 2 + (mouseY - pos.y) ** 2);
            if (dist <= pos.size + 10) {
                this.hoveredPlanet = pos.planet.name;
                this.canvas.style.cursor = 'pointer';
                found = true;
                break;
            }
        }
        if (!found) {
            this.hoveredPlanet = null;
            this.canvas.style.cursor = 'default';
        }
    }

    getPlanetPositions() {
        const rect = this.canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const maxOrbit = 430;
        const availableRadius = Math.min(rect.width, rect.height) / 2 - 40;
        const scale = availableRadius / maxOrbit;

        return this.planets.map((planet, index) => {
            const orbitRadius = planet.orbitRadius * scale;
            const x = centerX + Math.cos(this.angles[index]) * orbitRadius;
            const y = centerY + Math.sin(this.angles[index]) * orbitRadius;
            const size = Math.max(planet.size * scale * 0.7, 4);
            return { x, y, size, planet };
        });
    }

    handleTogglePlay() {
        this.isPlaying = !this.isPlaying;
    }

    handleSpeedChange(event) {
        this.speed = parseFloat(event.target.value);
    }

    handleSelectPlanet(event) {
        const index = parseInt(event.currentTarget.dataset.index);
        this.selectedPlanet = this.planets[index];
    }

    handleClosePanel() {
        this.selectedPlanet = null;
    }

    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, (num >> 16) + percent);
        const g = Math.min(255, ((num >> 8) & 0xff) + percent);
        const b = Math.min(255, (num & 0xff) + percent);
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    get hasSelectedPlanet() {
        return this.selectedPlanet !== null;
    }

    get selectedPlanetSize() {
        if (!this.selectedPlanet) return 50;
        return Math.min(this.selectedPlanet.size * 3, 100);
    }

    get selectedPlanetStyle() {
        if (!this.selectedPlanet) return '';
        const size = this.selectedPlanetSize;
        return `width: ${size}px; height: ${size}px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, ${this.lightenColor(this.selectedPlanet.color, 40)}, ${this.selectedPlanet.color}); box-shadow: 0 0 30px ${this.selectedPlanet.color}40;`;
    }

    get orbitalPeriodFormatted() {
        if (!this.selectedPlanet) return '';
        const days = this.selectedPlanet.orbitalPeriod;
        if (days < 365) return `${days} Earth days`;
        const years = (days / 365.25).toFixed(1);
        return `${years} Earth years (${days.toLocaleString()} days)`;
    }
}
