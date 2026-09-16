export interface PlanetData {
  id: string;
  name: string;
  diameter: number; // km
  distanceFromSun: number; // million km
  orbitalPeriod: number; // Earth days
  color: string;
  size: number; // visual size in px
  orbitRadius: number; // visual orbit radius in px
  description: string;
}

export const planets: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    diameter: 4879,
    distanceFromSun: 57.9,
    orbitalPeriod: 88,
    color: '#b5b5b5',
    size: 8,
    orbitRadius: 70,
    description: 'The smallest planet and closest to the Sun. It has no atmosphere and extreme temperature variations.',
  },
  {
    id: 'venus',
    name: 'Venus',
    diameter: 12104,
    distanceFromSun: 108.2,
    orbitalPeriod: 225,
    color: '#e8cda0',
    size: 12,
    orbitRadius: 105,
    description: 'The hottest planet with a thick toxic atmosphere. It rotates in the opposite direction to most planets.',
  },
  {
    id: 'earth',
    name: 'Earth',
    diameter: 12756,
    distanceFromSun: 149.6,
    orbitalPeriod: 365,
    color: '#4da6ff',
    size: 13,
    orbitRadius: 145,
    description: 'Our home planet and the only known planet to harbor life. 71% of its surface is covered in water.',
  },
  {
    id: 'mars',
    name: 'Mars',
    diameter: 6792,
    distanceFromSun: 227.9,
    orbitalPeriod: 687,
    color: '#e27b58',
    size: 10,
    orbitRadius: 190,
    description: 'The Red Planet, known for its iron oxide surface. It has the largest volcano in the solar system - Olympus Mons.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    diameter: 142984,
    distanceFromSun: 778.5,
    orbitalPeriod: 4333,
    color: '#c88b3a',
    size: 28,
    orbitRadius: 250,
    description: 'The largest planet with a Great Red Spot storm that has raged for hundreds of years. It has 95 known moons.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    diameter: 120536,
    distanceFromSun: 1434,
    orbitalPeriod: 10759,
    color: '#e8d5a3',
    size: 24,
    orbitRadius: 315,
    description: 'Famous for its stunning ring system made of ice and rock. It is the least dense planet - it could float on water!',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    diameter: 51118,
    distanceFromSun: 2871,
    orbitalPeriod: 30687,
    color: '#7ec8e3',
    size: 18,
    orbitRadius: 375,
    description: 'An ice giant that rotates on its side. It has a blue-green color due to methane in its atmosphere.',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    diameter: 49528,
    distanceFromSun: 4495,
    orbitalPeriod: 60190,
    color: '#3f54ba',
    size: 17,
    orbitRadius: 430,
    description: 'The windiest planet with speeds up to 2,100 km/h. It was the first planet found by mathematical prediction.',
  },
];
