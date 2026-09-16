/**
 * SolarSystemControllerTest - Test class for SolarSystemController
 * Achieves >75% code coverage for deployment to production.
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

        // Verify it's valid JSON by deserializing
        List<Object> planets = (List<Object>) JSON.deserializeUntyped(result);
        System.assertEquals(8, planets.size(), 'Should return 8 planets');
    }

    @isTest
    static void testGetPlanetsJSON_NoRecords() {
        // Delete all test records to test fallback
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
        System.assert((Decimal) result.get('diameterRatio') > 0, 'Diameter ratio should be positive');
    }

    @isTest
    static void testSeedPlanetData() {
        // Clear existing data
        delete [SELECT Id FROM Planet__c];

        Test.startTest();
        SolarSystemController.seedPlanetData();
        Test.stopTest();

        List<Planet__c> planets = [SELECT Id, Name__c FROM Planet__c ORDER BY OrderFromSun__c ASC];
        System.assertEquals(8, planets.size(), 'Should seed 8 planets');
        System.assertEquals('Mercury', planets[0].Name__c);
        System.assertEquals('Neptune', planets[7].Name__c);
    }
}
