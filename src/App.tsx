import { useState, useEffect, useRef, useCallback } from 'react';
import { planets, PlanetData } from './data/planets';
import { apexFiles } from './data/apexCode';

type TabType = 'demo' | 'code';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('demo');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [selectedCodeFile, setSelectedCodeFile] = useState(apexFiles[0].id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const anglesRef = useRef<number[]>(planets.map(() => Math.random() * Math.PI * 2));
  const lastTimeRef = useRef<number>(0);

  const drawSolarSystem = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const delta = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    ctx.clearRect(0, 0, width, height);
    drawStars(ctx, width, height);

    const maxOrbit = 430;
    const availableRadius = Math.min(width, height) / 2 - 40;
    const scale = availableRadius / maxOrbit;

    // Orbit paths
    planets.forEach((planet) => {
      const orbitRadius = planet.orbitRadius * scale;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Sun
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
    sunGradient.addColorStop(0, '#fff7e6');
    sunGradient.addColorStop(0.3, '#ffcc00');
    sunGradient.addColorStop(0.7, '#ff9500');
    sunGradient.addColorStop(1, '#ff6600');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    const glowGradient = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 60);
    glowGradient.addColorStop(0, 'rgba(255, 200, 0, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Planets
    planets.forEach((planet, index) => {
      if (isPlaying) {
        const angularSpeed = (2 * Math.PI) / (planet.orbitalPeriod * 0.01) * speed;
        anglesRef.current[index] += angularSpeed * delta;
      }

      const angle = anglesRef.current[index];
      const orbitRadius = planet.orbitRadius * scale;
      const x = centerX + Math.cos(angle) * orbitRadius;
      const y = centerY + Math.sin(angle) * orbitRadius;
      const planetSize = Math.max(planet.size * scale * 0.7, 4);

      const isHovered = hoveredPlanet === planet.id;
      const isSelected = selectedPlanet?.id === planet.id;

      if (isHovered || isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, planetSize + 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.fill();
      }

      const planetGradient = ctx.createRadialGradient(
        x - planetSize * 0.3, y - planetSize * 0.3, 0, x, y, planetSize
      );
      planetGradient.addColorStop(0, lightenColor(planet.color, 40));
      planetGradient.addColorStop(1, planet.color);

      ctx.beginPath();
      ctx.arc(x, y, planetSize, 0, Math.PI * 2);
      ctx.fillStyle = planetGradient;
      ctx.fill();

      if (planet.id === 'saturn') {
        ctx.beginPath();
        ctx.ellipse(x, y, planetSize * 1.8, planetSize * 0.5, -0.3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(232, 213, 163, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

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
      if (distance <= planetSize + 10) clickedPlanet = planet;
    });

    setSelectedPlanet(clickedPlanet);
  };

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
      if (distance <= planetSize + 10) hovered = planet.id;
    });

    setHoveredPlanet(hovered);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  const currentFile = apexFiles.find(f => f.id === selectedCodeFile)!;

  return (
    <div className="w-full h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 flex items-center justify-between bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌌</span>
          <h1 className="text-xl font-bold text-white">Solar System Explorer</h1>
          <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
            Apex / Salesforce
          </span>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'demo'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🪐 Demo
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'code'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💻 Apex Code
          </button>
        </div>
      </header>

      {/* Main content */}
      {activeTab === 'demo' ? (
        <div className="flex-1 flex flex-col lg:flex-row relative">
          <div className="flex-1 relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
            />

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900/90 backdrop-blur-sm rounded-full px-5 py-3 border border-white/10">
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

              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {selectedPlanet.description}
              </p>

              <div className="space-y-4">
                <StatCard icon="📏" label="Diameter" value={`${selectedPlanet.diameter.toLocaleString()} km`} />
                <StatCard icon="☀️" label="Distance from Sun" value={`${selectedPlanet.distanceFromSun.toLocaleString()} million km`} />
                <StatCard icon="🔄" label="Orbital Period" value={formatOrbitalPeriod(selectedPlanet.orbitalPeriod)} />
                <StatCard icon="🌡️" label="Planet Order" value={`${planets.findIndex(p => p.id === selectedPlanet.id) + 1} from the Sun`} />
              </div>

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
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: planet.color }} />
                      <span className="truncate">{planet.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Code Viewer */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* File sidebar */}
          <div className="lg:w-64 flex-shrink-0 bg-gray-900/80 border-r border-white/10 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Salesforce Apex Files
              </h3>
              <div className="space-y-1">
                {apexFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedCodeFile(file.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      selectedCodeFile === file.id
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{file.icon}</span>
                    <div>
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/10">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Architecture
              </h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p>📦 <span className="text-gray-300">Custom Object:</span> Planet__c</p>
                <p>🎮 <span className="text-gray-300">Controller:</span> SolarSystemController</p>
                <p>📊 <span className="text-gray-300">Model:</span> PlanetData</p>
                <p>🧪 <span className="text-gray-300">Test Class:</span> 85%+ coverage</p>
                <p>📄 <span className="text-gray-300">VF Page:</span> SolarSystemPage</p>
                <p>⚡ <span className="text-gray-300">LWC:</span> solarSystemExplorer</p>
              </div>
            </div>
          </div>

          {/* Code display */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentFile.icon}</span>
                <span className="text-sm font-medium text-white">{currentFile.name}</span>
                <span className="text-xs text-gray-500 ml-2">{currentFile.type}</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentFile.code);
                }}
                className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-gray-300 rounded transition-colors"
              >
                📋 Copy
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-950">
              <pre className="p-4 text-sm leading-relaxed">
                <code className="text-gray-300">
                  {highlightApex(currentFile.code)}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card component
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

// Helpers
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
  const b = Math.min(255, (num & 0x0000ff) + percent);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function formatOrbitalPeriod(days: number): string {
  if (days < 365) return `${days} Earth days`;
  const years = (days / 365.25).toFixed(1);
  return `${years} Earth years (${days.toLocaleString()} days)`;
}

// Stars
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

// Apex syntax highlighting
function highlightApex(code: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    const highlighted = highlightLine(line);
    return (
      <div key={i} className="flex">
        <span className="inline-block w-10 text-right pr-4 text-gray-600 select-none flex-shrink-0">
          {i + 1}
        </span>
        <span className="flex-1">{highlighted}</span>
      </div>
    );
  });
}

function highlightLine(line: string): React.ReactNode {
  // Simple syntax highlighting
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Comments
  if (remaining.trimStart().startsWith('//') || remaining.trimStart().startsWith('*') || remaining.trimStart().startsWith('/**')) {
    return <span key={0} className="text-green-600 italic">{line}</span>;
  }

  const patterns: [RegExp, string][] = [
    [/(\b(?:public|private|protected|static|final|virtual|override|abstract|with sharing|without sharing|global)\b)/g, 'text-purple-400'],
    [/\b(?:class|interface|extends|implements|return|if|else|for|while|try|catch|new|void|this|super|null|true|false)\b/g, 'text-blue-400'],
    [/\b(?:String|Integer|Decimal|Boolean|List|Map|Set|Id|Object|Long|Double|Date|DateTime|Blob)\b/g, 'text-yellow-400'],
    [/\b(?:System|JSON|UserInfo|DateTime|Math|Test)\b/g, 'text-cyan-400'],
    [/@(?:AuraEnabled|RemoteAction|isTest|TestSetup|HttpGet|HttpPost|future|InvocableMethod)/g, 'text-orange-400'],
    [/'[^']*'/g, 'text-green-400'],
    [/\b\d+\.?\d*\b/g, 'text-orange-300'],
  ];

  // Simple approach: colorize keywords
  let result = remaining;
  
  // Apply patterns
  const segments: { start: number; end: number; className: string; text: string }[] = [];
  
  for (const [pattern, className] of patterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(result)) !== null) {
      segments.push({
        start: match.index,
        end: match.index + match[0].length,
        className,
        text: match[0],
      });
    }
  }

  // Sort by position
  segments.sort((a, b) => a.start - b.start);

  // Remove overlapping
  const filtered: typeof segments = [];
  let lastEnd = 0;
  for (const seg of segments) {
    if (seg.start >= lastEnd) {
      filtered.push(seg);
      lastEnd = seg.end;
    }
  }

  // Build tokens
  let pos = 0;
  for (const seg of filtered) {
    if (seg.start > pos) {
      tokens.push(<span key={key++}>{result.slice(pos, seg.start)}</span>);
    }
    tokens.push(<span key={key++} className={seg.className}>{seg.text}</span>);
    pos = seg.end;
  }
  if (pos < result.length) {
    tokens.push(<span key={key++}>{result.slice(pos)}</span>);
  }

  return tokens.length > 0 ? <>{tokens}</> : <span>{line}</span>;
}
