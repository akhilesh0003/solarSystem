/**
 * Planet__c Model - Represents planet data in Salesforce
 * Custom Object fields:
 *   Name__c (Text), Diameter__c (Number), DistanceFromSun__c (Number),
 *   OrbitalPeriod__c (Number), Color__c (Text), Size__c (Number),
 *   OrbitRadius__c (Number), Description__c (Long Text Area),
 *   OrderFromSun__c (Number)
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
}
