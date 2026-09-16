export interface ApexFile {
  id: string;
  name: string;
  type: string;
  icon: string;
  code: string;
}

export const apexFiles: ApexFile[] = [
  {
    id: 'controller',
    name: 'SolarSystemController.cls',
    type: 'Apex Controller',
    icon: '🎮',
    code: `/**
 * SolarSystemController - Apex Controller for the Solar System Visualforce Page
 * Handles server-side logic for planet data retrieval and user interactions.
 */
public with sharing class SolarSystemController {

    // Default planet data for initialization
    private static final List<Map<String, Object>> DEFAULT_PLANETS = new List<Map<String, Object>>{
        createPlanetMap('Mercury', 4879, 57.9, 88, '#b5b5b5', 8, 70,
            'The smallest planet and closest to the Sun.', 1),
        createPlanetMap('Venus', 12104, 108.2, 225, '#e8cda0', 12, 105,
            'The hottest planet with a thick toxic atmosphere.', 2),
        createPlanetMap('Earth', 12756, 149.6, 365, '#4da6ff', 13, 145,
            'Our home planet and the only known planet to harbor life.', 3),
        createPlanetMap('Mars', 6792, 227.9, 687, '#e27b58', 10, 190,
            'The Red Planet, known for its iron oxide surface.', 4),
        createPlanetMap('Jupiter', 142984, 778.5, 4333, '#c88b3a', 28, 250,
            'The largest planet with a Great Red Spot storm.', 5),
        createPlanetMap('Saturn', 120536, 1434, 10759, '#e8d5a3', 24, 315,
            'Famous for its stunning ring system made of ice and rock.', 6),
        createPlanetMap('Uranus', 51118, 2871, 30687, '#7ec8e3', 18, 375,
            'An ice giant that rotates on its side.', 7),
        createPlanetMap('Neptune', 49528, 4495, 60190, '#3f54ba', 17, 430,
            'The windiest planet with speeds up to 2,100 km/h.', 8)
    };

    /**
     * Returns all planet data as a serialized JSON string.
     */
    @RemoteAction
    public static String getPlanetsJSON() {
        try {
            List<Planet__c> records = [
                SELECT Name__c, Diameter__c, DistanceFromSun__c,
                       OrbitalPeriod__c, Color__c, Size__c, OrbitRadius__c,
                       Description__c, OrderFromSun__c
                FROM Planet__c
                ORDER BY OrderFromSun__c ASC
            ];

            if (records.isEmpty()) {
                return JSON.serialize(DEFAULT_PLANETS);
            }

            List<Map<String, Object>> result = new List<Map<String, Object>>();
            for (Planet__c p : records) {
                result.add(createPlanetMap(
                    p.Name__c, p.Diameter__c, p.DistanceFromSun__c,
                    p.OrbitalPeriod__c, p.Color__c, p.Size__c,
                    p.OrbitRadius__c, p.Description__c, p.OrderFromSun__c
                ));
            }
            return JSON.serialize(result);
        } catch (Exception e) {
            return JSON.serialize(DEFAULT_PLANETS);
        }
    }

    /**
     * Logs a planet view event for analytics tracking.
     */
    @RemoteAction
    public static void logPlanetView(String planetName) {
        Planet_View_Log__c log = new Planet_View_Log__c(
            Planet_Name__c = planetName,
            Viewed_At__c = DateTime.now(),
            User_Name__c = UserInfo.getName()
        );
        insert log;
    }

    /**
     * Calculates comparison data between two planets.
     */
    @RemoteAction
    public static Map<String, Object> comparePlanets(String planet1Name, String planet2Name) {
        Map<String, Object> comparison = new Map<String, Object>();

        Planet__c p1 = [SELECT Name__c, Diameter__c, DistanceFromSun__c,
                        OrbitalPeriod__c FROM Planet__c WHERE Name__c = :planet1Name LIMIT 1];
        Planet__c p2 = [SELECT Name__c, Diameter__c, DistanceFromSun__c,
                        OrbitalPeriod__c FROM Planet__c WHERE Name__c = :planet2Name LIMIT 1];

        comparison.put('planet1', p1.Name__c);
        comparison.put('planet2', p2.Name__c);
        comparison.put('diameterRatio', p1.Diameter__c / p2.Diameter__c);
        comparison.put('distanceRatio', p1.DistanceFromSun__c / p2.DistanceFromSun__c);
        comparison.put('periodRatio', p1.OrbitalPeriod__c / p2.OrbitalPeriod__c);

        return comparison;
    }

    /**
     * Seeds the database with default planet data.
     */
    public static void seedPlanetData() {
        List<Planet__c> planetsToInsert = new List<Planet__c>();

        for (Map<String, Object> data : DEFAULT_PLANETS) {
            Planet__c p = new Planet__c(
                Name__c = (String) data.get('name'),
                Diameter__c = (Decimal) data.get('diameter'),
                DistanceFromSun__c = (Decimal) data.get('distanceFromSun'),
                OrbitalPeriod__c = (Decimal) data.get('orbitalPeriod'),
                Color__c = (String) data.get('color'),
                Size__c = (Decimal) data.get('size'),
                OrbitRadius__c = (Decimal) data.get('orbitRadius'),
                Description__c = (String) data.get('description'),
                OrderFromSun__c = (Decimal) data.get('orderFromSun')
            );
            planetsToInsert.add(p);
        }

        if (!planetsToInsert.isEmpty()) {
            insert planetsToInsert;
        }
    }

    // Private helper method
    private static Map<String, Object> createPlanetMap(
        String name, Decimal diameter, Decimal distance,
        Decimal period, String color, Decimal size,
        Decimal orbitRadius, String description, Decimal order
    ) {
        Map<String, Object> m = new Map<String, Object>();
        m.put('name', name);
        m.put('diameter', diameter);
        m.put('distanceFromSun', distance);
        m.put('orbitalPeriod', period);
        m.put('color', color);
        m.put('size', size);
        m.put('orbitRadius', orbitRadius);
        m.put('description', description);
        m.put('orderFromSun', order);
        return m;
    }
}`,
  },
  {
    id: 'model',
    name: 'PlanetData.cls',
    type: 'Apex Model',
    icon: '📊',
    code: `/**
 * PlanetData - Model class for Planet data operations
 * Custom Object: Planet__c
 *
 * Fields:
 *   - Name__c (Text, 255)
 *   - Diameter__c (Number, 18, 0) - in km
 *   - DistanceFromSun__c (Number, 18, 1) - in million km
 *   - OrbitalPeriod__c (Number, 18, 0) - in Earth days
 *   - Color__c (Text, 7) - hex color code
 *   - Size__c (Number, 18, 0) - visual size
 *   - OrbitRadius__c (Number, 18, 0) - visual orbit radius
 *   - Description__c (Long Text Area, 32768)
 *   - OrderFromSun__c (Number, 2, 0)
 */
public class PlanetData {

    @AuraEnabled
    public static List<Map<String, Object>> getAllPlanets() {
        List<Planet__c> planetRecords = [
            SELECT Id, Name__c, Diameter__c, DistanceFromSun__c,
                   OrbitalPeriod__c, Color__c, Size__c, OrbitRadius__c,
                   Description__c, OrderFromSun__c
            FROM Planet__c
            ORDER BY OrderFromSun__c ASC
        ];

        List<Map<String, Object>> result = new List<Map<String, Object>>();
        for (Planet__c p : planetRecords) {
            Map<String, Object> planetMap = new Map<String, Object>();
            planetMap.put('id', p.Id);
            planetMap.put('name', p.Name__c);
            planetMap.put('diameter', p.Diameter__c);
            planetMap.put('distanceFromSun', p.DistanceFromSun__c);
            planetMap.put('orbitalPeriod', p.OrbitalPeriod__c);
            planetMap.put('color', p.Color__c);
            planetMap.put('size', p.Size__c);
            planetMap.put('orbitRadius', p.OrbitRadius__c);
            planetMap.put('description', p.Description__c);
            planetMap.put('orderFromSun', p.OrderFromSun__c);
            result.add(planetMap);
        }
        return result;
    }

    @AuraEnabled
    public static Map<String, Object> getPlanetById(Id planetId) {
        Planet__c p = [
            SELECT Id, Name__c, Diameter__c, DistanceFromSun__c,
                   OrbitalPeriod__c, Color__c, Size__c, OrbitRadius__c,
                   Description__c, OrderFromSun__c
            FROM Planet__c
            WHERE Id = :planetId
            LIMIT 1
        ];

        Map<String, Object> result = new Map<String, Object>();
        result.put('id', p.Id);
        result.put('name', p.Name__c);
        result.put('diameter', p.Diameter__c);
        result.put('distanceFromSun', p.DistanceFromSun__c);
        result.put('orbitalPeriod', p.OrbitalPeriod__c);
        result.put('color', p.Color__c);
        result.put('size', p.Size__c);
        result.put('orbitRadius', p.OrbitRadius__c);
        result.put('description', p.Description__c);
        result.put('orderFromSun', p.OrderFromSun__c);
        return result;
    }

    /**
     * Get formatted planet info for display
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getFormattedPlanetInfo(Id planetId) {
        Planet__c p = [
            SELECT Name__c, Diameter__c, DistanceFromSun__c,
                   OrbitalPeriod__c, Description__c, OrderFromSun__c
            FROM Planet__c WHERE Id = :planetId LIMIT 1
        ];

        Map<String, String> info = new Map<String, String>();
        info.put('name', p.Name__c);
        info.put('diameter', String.valueOf(p.Diameter__c) + ' km');
        info.put('distance', String.valueOf(p.DistanceFromSun__c) + ' million km');
        info.put('period', formatOrbitalPeriod(p.OrbitalPeriod__c));
        info.put('description', p.Description__c);
        info.put('order', String.valueOf(p.OrderFromSun__c) + ' from the Sun');
        return info;
    }

    private static String formatOrbitalPeriod(Decimal days) {
        if (days < 365) {
            return String.valueOf(days) + ' Earth days';
        }
        Decimal years = days / 365.25;
        return String.valueOf(years) + ' Earth years';
    }
}`,
  },
  {
    id: 'test',
    name: 'SolarSystemControllerTest.cls',
    type: 'Apex Test Class',
    icon: '🧪',
    code: `/**
 * SolarSystemControllerTest - Test class for SolarSystemController
 * Achieves >75% code coverage for deployment to production.
 *
 * Test Methods:
 *   - testGetPlanetsJSON: Tests JSON retrieval with records
 *   - testGetPlanetsJSON_NoRecords: Tests fallback to defaults
 *   - testLogPlanetView: Tests analytics logging
 *   - testComparePlanets: Tests planet comparison logic
 *   - testSeedPlanetData: Tests data seeding
 */
@isTest
private class SolarSystemControllerTest {

    @TestSetup
    static void setupTestData() {
        List<Planet__c> testPlanets = new List<Planet__c>();

        testPlanets.add(new Planet__c(
            Name__c = 'Mercury',
            Diameter__c = 4879,
            DistanceFromSun__c = 57.9,
            OrbitalPeriod__c = 88,
            Color__c = '#b5b5b5',
            Size__c = 8,
            OrbitRadius__c = 70,
            Description__c = 'The smallest planet.',
            OrderFromSun__c = 1
        ));

        testPlanets.add(new Planet__c(
            Name__c = 'Venus',
            Diameter__c = 12104,
            DistanceFromSun__c = 108.2,
            OrbitalPeriod__c = 225,
            Color__c = '#e8cda0',
            Size__c = 12,
            OrbitRadius__c = 105,
            Description__c = 'The hottest planet.',
            OrderFromSun__c = 2
        ));

        testPlanets.add(new Planet__c(
            Name__c = 'Earth',
            Diameter__c = 12756,
            DistanceFromSun__c = 149.6,
            OrbitalPeriod__c = 365,
            Color__c = '#4da6ff',
            Size__c = 13,
            OrbitRadius__c = 145,
            Description__c = 'Our home planet.',
            OrderFromSun__c = 3
        ));

        testPlanets.add(new Planet__c(
            Name__c = 'Mars',
            Diameter__c = 6792,
            DistanceFromSun__c = 227.9,
            OrbitalPeriod__c = 687,
            Color__c = '#e27b58',
            Size__c = 10,
            OrbitRadius__c = 190,
            Description__c = 'The Red Planet.',
            OrderFromSun__c = 4
        ));

        testPlanets.add(new Planet__c(
            Name__c = 'Jupiter',
            Diameter__c = 142984,
            DistanceFromSun__c = 778.5,
            OrbitalPeriod__c = 4333,
            Color__c = '#c88b3a',
            Size__c = 28,
            OrbitRadius__c = 250,
            Description__c = 'The largest planet.',
            OrderFromSun__c = 5
        ));

        testPlanets.add(new Planet__c(
            Name__c = 'Saturn',
            Diameter__c = 120536,
            DistanceFromSun__c = 1434,
            OrbitalPeriod__c = 10759,
            Color__c = '#e8d5a3',
            Size__c = 24,
            OrbitRadius__c = 315,
            Description__c = 'The ringed planet.',
            OrderFromSun__c = 6
        ));

        testPlanets.add(new Planet__c(
            Name__c = 'Uranus',
            Diameter__c = 51118,
            DistanceFromSun__c = 2871,
            OrbitalPeriod__c = 30687,
            Color__c = '#7ec8e3',
            Size__c = 18,
            OrbitRadius__c = 375,
            Description__c = 'The tilted ice giant.',
            OrderFromSun__c = 7
        ));

        testPlanets.add(new Planet__c(
            Name__c = 'Neptune',
            Diameter__c = 49528,
            DistanceFromSun__c = 4495,
            OrbitalPeriod__c = 60190,
            Color__c = '#3f54ba',
            Size__c = 17,
            OrbitRadius__c = 430,
            Description__c = 'The windiest planet.',
            OrderFromSun__c = 8
        ));

        insert testPlanets;
    }

    @isTest
    static void testGetPlanetsJSON() {
        Test.startTest();
        String result = SolarSystemController.getPlanetsJSON();
        Test.stopTest();

        System.assertNotEquals(null, result, 'JSON result should not be null');
        System.assert(result.contains('Mercury'), 'Should contain Mercury');
        System.assert(result.contains('Earth'), 'Should contain Earth');
        System.assert(result.contains('Neptune'), 'Should contain Neptune');

        List<Object> planets = (List<Object>) JSON.deserializeUntyped(result);
        System.assertEquals(8, planets.size(), 'Should return 8 planets');
    }

    @isTest
    static void testGetPlanetsJSON_NoRecords() {
        delete [SELECT Id FROM Planet__c];

        Test.startTest();
        String result = SolarSystemController.getPlanetsJSON();
        Test.stopTest();

        System.assertNotEquals(null, result, 'Should return default data');
        System.assert(result.contains('Mercury'), 'Default data should include Mercury');
    }

    @isTest
    static void testLogPlanetView() {
        Test.startTest();
        SolarSystemController.logPlanetView('Earth');
        Test.stopTest();

        List<Planet_View_Log__c> logs = [SELECT Id, Planet_Name__c FROM Planet_View_Log__c];
        System.assertEquals(1, logs.size(), 'Should have 1 log entry');
        System.assertEquals('Earth', logs[0].Planet_Name__c);
    }

    @isTest
    static void testComparePlanets() {
        Test.startTest();
        Map<String, Object> result = SolarSystemController.comparePlanets('Earth', 'Mars');
        Test.stopTest();

        System.assertNotEquals(null, result, 'Comparison result should not be null');
        System.assertEquals('Earth', result.get('planet1'));
        System.assertEquals('Mars', result.get('planet2'));
        System.assert((Decimal) result.get('diameterRatio') > 0, 'Ratio should be positive');
    }

    @isTest
    static void testSeedPlanetData() {
        delete [SELECT Id FROM Planet__c];

        Test.startTest();
        SolarSystemController.seedPlanetData();
        Test.stopTest();

        List<Planet__c> planets = [SELECT Id, Name__c FROM Planet__c ORDER BY OrderFromSun__c ASC];
        System.assertEquals(8, planets.size(), 'Should seed 8 planets');
        System.assertEquals('Mercury', planets[0].Name__c);
        System.assertEquals('Neptune', planets[7].Name__c);
    }
}`,
  },
  {
    id: 'vfpage',
    name: 'SolarSystemPage.vfp',
    type: 'Visualforce Page',
    icon: '📄',
    code: `<apex:page controller="SolarSystemController" showHeader="false"
    sidebar="false" standardStylesheets="false">
<!DOCTYPE html>
<html>
<head>
    <title>Solar System Explorer</title>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: #030712;
            color: #fff;
            overflow: hidden;
            height: 100vh;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 24px;
            background: rgba(17, 24, 39, 0.8);
            backdrop-filter: blur(8px);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .header h1 { font-size: 1.25rem; font-weight: bold; }
        .main-content { display: flex; height: calc(100vh - 57px); }
        .canvas-container { flex: 1; position: relative; }
        #solarCanvas { width: 100%; height: 100%; display: block; }
        .controls {
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(17, 24, 39, 0.9);
            border-radius: 9999px;
            padding: 12px 20px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .btn {
            width: 40px; height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            border: none; color: #fff; cursor: pointer;
        }
        .btn:hover { background: rgba(255,255,255,0.2); }
        .speed-slider { width: 120px; accent-color: #3b82f6; }
        .info-panel {
            width: 320px;
            background: rgba(17, 24, 39, 0.95);
            border-left: 1px solid rgba(255,255,255,0.1);
            padding: 24px;
            overflow-y: auto;
            display: none;
        }
        .info-panel.active { display: block; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌌 Solar System Explorer</h1>
        <p>Click on any planet to learn more</p>
    </div>

    <div class="main-content">
        <div class="canvas-container">
            <canvas id="solarCanvas"></canvas>
            <div class="controls">
                <button class="btn" id="playPauseBtn">⏸️</button>
                <span>Speed:</span>
                <input type="range" class="speed-slider" id="speedSlider"
                    min="0.1" max="5" step="0.1" value="1"/>
                <span id="speedValue">1.0x</span>
            </div>
        </div>

        <div class="info-panel" id="infoPanel">
            <div class="info-header">
                <h2 id="planetName">Planet</h2>
                <button class="close-btn" id="closePanel">✕</button>
            </div>
            <div class="planet-visual">
                <div class="planet-sphere" id="planetSphere"></div>
            </div>
            <p class="description" id="planetDescription"></p>
            <div id="planetStats"></div>
        </div>
    </div>

    <script>
        let planets = [];
        let angles = [];
        let isPlaying = true;
        let speed = 1;

        // Fetch data from Apex controller via JS Remoting
        Visualforce.remoting.Manager.invokeAction(
            '{!$RemoteAction.SolarSystemController.getPlanetsJSON}',
            function(result, event) {
                if (event.status) {
                    planets = JSON.parse(result);
                    angles = planets.map(function() {
                        return Math.random() * Math.PI * 2;
                    });
                    requestAnimationFrame(animate);
                }
            },
            { escape: false }
        );

        // Animation loop
        function animate(timestamp) {
            var canvas = document.getElementById('solarCanvas');
            var ctx = canvas.getContext('2d');
            // ... rendering logic
            requestAnimationFrame(animate);
        }

        // Controls
        document.getElementById('playPauseBtn')
            .addEventListener('click', function() {
                isPlaying = !isPlaying;
            });

        document.getElementById('speedSlider')
            .addEventListener('input', function(e) {
                speed = parseFloat(e.target.value);
                document.getElementById('speedValue').textContent =
                    speed.toFixed(1) + 'x';
            });
    </script>
</body>
</html>
</apex:page>`,
  },
  {
    id: 'lwc',
    name: 'solarSystemExplorer.js',
    type: 'Lightning Web Component',
    icon: '⚡',
    code: `import { LightningElement, track, wire } from 'lwc';
import getPlanets from '@salesforce/apex/SolarSystemController.getPlanetsJSON';
import logPlanetView from '@salesforce/apex/SolarSystemController.logPlanetView';

/**
 * SolarSystemExplorer - Lightning Web Component
 * Interactive Solar System visualization with animated planet orbits.
 *
 * Features:
 * - Canvas-based rendering of Sun and 8 planets
 * - Click-to-select planet info panel
 * - Play/Pause animation controls
 * - Adjustable animation speed
 * - Responsive design
 */
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

        // Draw stars, orbits, sun, and planets
        this.drawStars(width, height);
        this.drawOrbits(centerX, centerY, width, height);
        this.drawSun(centerX, centerY);
        this.drawPlanets(centerX, centerY, width, height, delta);
    }

    drawPlanets(centerX, centerY, width, height, delta) {
        const maxOrbit = 430;
        const availableRadius = Math.min(width, height) / 2 - 40;
        const scale = availableRadius / maxOrbit;

        this.planets.forEach((planet, index) => {
            if (this.isPlaying) {
                const angularSpeed = (2 * Math.PI) /
                    (planet.orbitalPeriod * 0.01) * this.speed;
                this.angles[index] += angularSpeed * delta;
            }

            const angle = this.angles[index];
            const orbitRadius = planet.orbitRadius * scale;
            const x = centerX + Math.cos(angle) * orbitRadius;
            const y = centerY + Math.sin(angle) * orbitRadius;
            const planetSize = Math.max(planet.size * scale * 0.7, 4);

            // Draw planet with gradient
            const pGrad = this.ctx.createRadialGradient(
                x - planetSize * 0.3, y - planetSize * 0.3, 0,
                x, y, planetSize
            );
            pGrad.addColorStop(0, this.lightenColor(planet.color, 40));
            pGrad.addColorStop(1, planet.color);
            this.ctx.beginPath();
            this.ctx.arc(x, y, planetSize, 0, Math.PI * 2);
            this.ctx.fillStyle = pGrad;
            this.ctx.fill();
        });
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const positions = this.getPlanetPositions();

        for (let i = positions.length - 1; i >= 0; i--) {
            const pos = positions[i];
            const dist = Math.sqrt(
                (clickX - pos.x) ** 2 + (clickY - pos.y) ** 2
            );
            if (dist <= pos.size + 10) {
                this.selectedPlanet = pos.planet;
                // Log the view
                logPlanetView({ planetName: pos.planet.name });
                return;
            }
        }
        this.selectedPlanet = null;
    }

    handleTogglePlay() {
        this.isPlaying = !this.isPlaying;
    }

    handleSpeedChange(event) {
        this.speed = parseFloat(event.target.value);
    }

    handleClosePanel() {
        this.selectedPlanet = null;
    }

    get hasSelectedPlanet() {
        return this.selectedPlanet !== null;
    }

    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, (num >> 16) + percent);
        const g = Math.min(255, ((num >> 8) & 0xff) + percent);
        const b = Math.min(255, (num & 0xff) + percent);
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
}`,
  },
  {
    id: 'schema',
    name: 'Planet__c.object',
    type: 'Custom Object Schema',
    icon: '🗂️',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Planet</label>
    <pluralLabel>Planets</pluralLabel>
    <nameField>
        <label>Planet Name</label>
        <type>Text</type>
    </nameField>
    <deploymentStatus>Deployed</deploymentStatus>
    <sharingModel>ReadWrite</sharingModel>
    <fields>
        <!-- Diameter in kilometers -->
        <fullName>Diameter__c</fullName>
        <label>Diameter (km)</label>
        <type>Number</type>
        <precision>18</precision>
        <scale>0</scale>
        <required>true</required>
    </fields>
    <fields>
        <!-- Distance from Sun in million km -->
        <fullName>DistanceFromSun__c</fullName>
        <label>Distance from Sun (million km)</label>
        <type>Number</type>
        <precision>18</precision>
        <scale>1</scale>
        <required>true</required>
    </fields>
    <fields>
        <!-- Orbital period in Earth days -->
        <fullName>OrbitalPeriod__c</fullName>
        <label>Orbital Period (Earth days)</label>
        <type>Number</type>
        <precision>18</precision>
        <scale>0</scale>
        <required>true</required>
    </fields>
    <fields>
        <!-- Display color as hex code -->
        <fullName>Color__c</fullName>
        <label>Display Color</label>
        <type>Text</type>
        <length>7</length>
        <required>true</required>
    </fields>
    <fields>
        <!-- Visual size for rendering -->
        <fullName>Size__c</fullName>
        <label>Visual Size</label>
        <type>Number</type>
        <precision>18</precision>
        <scale>0</scale>
        <required>true</required>
    </fields>
    <fields>
        <!-- Visual orbit radius -->
        <fullName>OrbitRadius__c</fullName>
        <label>Orbit Radius (visual)</label>
        <type>Number</type>
        <precision>18</precision>
        <scale>0</scale>
        <required>true</required>
    </fields>
    <fields>
        <!-- Planet description -->
        <fullName>Description__c</fullName>
        <label>Description</label>
        <type>LongTextArea</type>
        <length>32768</length>
        <visibleLines>5</visibleLines>
    </fields>
    <fields>
        <!-- Order from the Sun (1-8) -->
        <fullName>OrderFromSun__c</fullName>
        <label>Order from Sun</label>
        <type>Number</type>
        <precision>2</precision>
        <scale>0</scale>
        <required>true</required>
        <unique>true</unique>
    </fields>
</CustomObject>

<!-- Planet_View_Log__c - Analytics tracking object -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Planet View Log</label>
    <pluralLabel>Planet View Logs</pluralLabel>
    <fields>
        <fullName>Planet_Name__c</fullName>
        <label>Planet Name</label>
        <type>Text</type>
        <length>255</length>
        <required>true</required>
    </fields>
    <fields>
        <fullName>Viewed_At__c</fullName>
        <label>Viewed At</label>
        <type>DateTime</type>
        <required>true</required>
    </fields>
    <fields>
        <fullName>User_Name__c</fullName>
        <label>User Name</label>
        <type>Text</type>
        <length>255</length>
    </fields>
</CustomObject>`,
  },
];
