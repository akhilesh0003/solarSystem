import { useState, useEffect, useRef, useCallback } from 'react';
import { planets, PlanetData } from './data/planets';

export default function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const anglesRef = useRef<number[]>(planets.map(() => Math.random() * Math.PI * 2));
  const lastTimeRef = useRef<number>(0);

  const drawSolarSystem = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle canvas resize
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate time delta
    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const delta = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw starfield background
    drawStars(ctx, width, height);

    // Scale orbits to fit canvas
    const maxOrbit = 430;
    const availableRadius = Math.min(width, height) / 2 - 40;
    const scale = availableRadius / maxOrbit;

    // Draw orbit paths
    planets.forEach((planet) => {
      const orbitRadius = planet.orbitRadius * scale;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw Sun
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
    sunGradient.addColorStop(0, '#fff7e6');
    sunGradient.addColorStop(0.3, '#ffcc00');
    sunGradient.addColorStop(0.7, '#ff9500');
    sunGradient.addColorStop(1, '#ff6600');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    // Sun glow
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 60);
    glowGradient.addColorStop(0, 'rgba(255, 200, 0, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Update and draw planets
    planets.forEach((planet, index) => {
      // Update angle based on orbital period and speed
      if (isPlaying) {
        const angularSpeed = (2 * Math.PI) / (planet.orbitalPeriod * 0.01) * speed;
        anglesRef.current[index] += angularSpeed * delta;
      }

      const angle = anglesRef.current[index];
      const orbitRadius = planet.orbitRadius * scale;
      const x = centerX + Math.cos(angle) * orbitRadius;
      const y = centerY + Math.sin(angle) * orbitRadius;

      // Draw planet
      const planetSize = Math.max(planet.size * scale * 0.7, 4);
      
      // Planet glow
      const isHovered = hoveredPlanet === planet.id;
      const isSelected = selectedPlanet?.id === planet.id;
      
      if (isHovered || isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, planetSize + 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.fill();
      }

      // Planet body
      const planetGradient = ctx.createRadialGradient(
        x - planetSize * 0.3, y - planetSize * 0.3, 0,
        x, y, planetSize
      );
      planetGradient.addColorStop(0, lightenColor(planet.color, 40));
      planetGradient.addColorStop(1, planet.color);
      
      ctx.beginPath();
      ctx.arc(x, y, planetSize, 0, Math.PI * 2);
      ctx.fillStyle = planetGradient;
      ctx.fill();

      // Saturn's rings
      if (planet.id === 'saturn') {
        ctx.beginPath();
        ctx.ellipse(x, y, planetSize * 1.8, planetSize * 0.5, -0.3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(232, 213, 163, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Planet name label
      if (isHovered || isSelected) {
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(planet.name, x, y - planetSize - 8);
      }
    });

    animationRef.current = requestAnimationFrame(drawSolarSystem);
  }, [isPlaying, speed, hoveredPlanet, selectedPlanet]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(drawSolarSystem);
    return () => cancelAnimationFrame(animationRef.current);
  }, [drawSolarSystem]);

  // Handle canvas click for planet selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxOrbit = 430;
    const availableRadius = Math.min(rect.width, rect.height) / 2 - 40;
    const scale = availableRadius / maxOrbit;

    let clickedPlanet: PlanetData | null = null;

    planets.forEach((planet, index) => {
      const angle = anglesRef.current[index];
      const orbitRadius = planet.orbitRadius * scale;
      const x = centerX + Math.cos(angle) * orbitRadius;
      const y = centerY + Math.sin(angle) * orbitRadius;
      const planetSize = Math.max(planet.size * scale * 0.7, 4);

      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      if (distance <= planetSize + 10) {
        clickedPlanet = planet;
      }
    });

    if (clickedPlanet) {
      setSelectedPlanet(clickedPlanet);
    } else {
      setSelectedPlanet(null);
    }
  };

  // Handle canvas mouse move for hover
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxOrbit = 430;
    const availableRadius = Math.min(rect.width, rect.height) / 2 - 40;
    const scale = availableRadius / maxOrbit;

    let hovered: string | null = null;

    planets.forEach((planet, index) => {
      const angle = anglesRef.current[index];
      const orbitRadius = planet.orbitRadius * scale;
      const x = centerX + Math.cos(angle) * orbitRadius;
      const y = centerY + Math.sin(angle) * orbitRadius;
      const planetSize = Math.max(planet.size * scale * 0.7, 4);

      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      if (distance <= planetSize + 10) {
        hovered = planet.id;
      }
    });

    setHoveredPlanet(hovered);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  return (
    <div className="w-full h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 flex items-center justify-between bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌌</span>
          <h1 className="text-xl font-bold text-white">Solar System Explorer</h1>
        </div>
        <p className="text-sm text-gray-400 hidden sm:block">Click on any planet to learn more</p>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Canvas area */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
          />

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900/90 backdrop-blur-sm rounded-full px-5 py-3 border border-white/10">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Speed control */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Speed:</span>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-24 sm:w-32 accent-blue-500"
              />
              <span className="text-xs text-white font-mono w-10">{speed.toFixed(1)}x</span>
            </div>

            {/* Speed presets */}
            <div className="flex gap-1">
              {[0.5, 1, 2, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    speed === s
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Planet info panel */}
        {selectedPlanet && (
          <div className="lg:w-80 flex-shrink-0 bg-gray-900/95 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-white/10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedPlanet.name}</h2>
              <button
                onClick={() => setSelectedPlanet(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Planet visual */}
            <div className="flex justify-center mb-6">
              <div
                className="rounded-full shadow-lg"
                style={{
                  width: `${Math.min(selectedPlanet.size * 3, 100)}px`,
                  height: `${Math.min(selectedPlanet.size * 3, 100)}px`,
                  background: `radial-gradient(circle at 35% 35%, ${lightenColor(selectedPlanet.color, 40)}, ${selectedPlanet.color})`,
                  boxShadow: `0 0 30px ${selectedPlanet.color}40`,
                }}
              />
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {selectedPlanet.description}
            </p>

            {/* Stats */}
            <div className="space-y-4">
              <StatCard
                icon="📏"
                label="Diameter"
                value={`${selectedPlanet.diameter.toLocaleString()} km`}
              />
              <StatCard
                icon="☀️"
                label="Distance from Sun"
                value={`${selectedPlanet.distanceFromSun.toLocaleString()} million km`}
              />
              <StatCard
                icon="🔄"
                label="Orbital Period"
                value={formatOrbitalPeriod(selectedPlanet.orbitalPeriod)}
              />
              <StatCard
                icon="🌡️"
                label="Planet Order"
                value={`${planets.findIndex(p => p.id === selectedPlanet.id) + 1} from the Sun`}
              />
            </div>

            {/* Planet list */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">All Planets</h3>
              <div className="grid grid-cols-2 gap-2">
                {planets.map((planet) => (
                  <button
                    key={planet.id}
                    onClick={() => setSelectedPlanet(planet)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedPlanet.id === planet.id
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: planet.color }}
                    />
                    <span className="truncate">{planet.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components
function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

// Helper functions
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
  const b = Math.min(255, (num & 0x0000ff) + percent);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function formatOrbitalPeriod(days: number): string {
  if (days < 365) {
    return `${days} Earth days`;
  }
  const years = (days / 365.25).toFixed(1);
  return `${years} Earth years (${days.toLocaleString()} days)`;
}

// Star drawing function
let starsGenerated = false;
let starPositions: { x: number; y: number; size: number; opacity: number }[] = [];

function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number) {
  if (!starsGenerated || starPositions.length === 0) {
    starPositions = [];
    for (let i = 0; i < 200; i++) {
      starPositions.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }
    starsGenerated = true;
  }

  starPositions.forEach((star) => {
    if (star.x > width || star.y > height) {
      star.x = Math.random() * width;
      star.y = Math.random() * height;
    }
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.fill();
  });
}
