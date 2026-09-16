/**
 * SolarSystemController - Apex Controller for the Solar System Visualforce Page
 * Handles server-side logic for planet data retrieval and user interactions.
 */
public with sharing class SolarSystemController {

    // Default planet data for initialization
    private static final List<Map<String, Object>> DEFAULT_PLANETS = new List<Map<String, Object>>{
        createPlanetMap('Mercury', 4879, 57.9, 88, '#b5b5b5', 8, 70,
            'The smallest planet and closest to the Sun. It has no atmosphere and extreme temperature variations.', 1),
        createPlanetMap('Venus', 12104, 108.2, 225, '#e8cda0', 12, 105,
            'The hottest planet with a thick toxic atmosphere. It rotates in the opposite direction to most planets.', 2),
        createPlanetMap('Earth', 12756, 149.6, 365, '#4da6ff', 13, 145,
            'Our home planet and the only known planet to harbor life. 71% of its surface is covered in water.', 3),
        createPlanetMap('Mars', 6792, 227.9, 687, '#e27b58', 10, 190,
            'The Red Planet, known for its iron oxide surface. It has the largest volcano in the solar system.', 4),
        createPlanetMap('Jupiter', 142984, 778.5, 4333, '#c88b3a', 28, 250,
            'The largest planet with a Great Red Spot storm. It has 95 known moons.', 5),
        createPlanetMap('Saturn', 120536, 1434, 10759, '#e8d5a3', 24, 315,
            'Famous for its stunning ring system made of ice and rock. It could float on water!', 6),
        createPlanetMap('Uranus', 51118, 2871, 30687, '#7ec8e3', 18, 375,
            'An ice giant that rotates on its side. Blue-green color due to methane in its atmosphere.', 7),
        createPlanetMap('Neptune', 49528, 4495, 60190, '#3f54ba', 17, 430,
            'The windiest planet with speeds up to 2,100 km/h. First planet found by mathematical prediction.', 8)
    };

    /**
     * Returns all planet data as a serialized JSON string for the Visualforce page.
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

            // If no records exist, return default data
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
            // Fallback to defaults on any error
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

    // Private helper
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
}
