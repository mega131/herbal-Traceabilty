// utils/geofence.js

// Coordinates defining Ashwagandha cultivation zones in Karnataka
// Existing zones: Raichur, Bagalkot, Belagavi, Davanagere, Tumkur
// Added Bengaluru zone
const cultivationZones = [
    // Raichur
    [
        [15.0, 76.0],
        [16.0, 76.0],
        [16.0, 77.0],
        [15.0, 77.0]
    ],
    // Bagalkot
    [
        [16.0, 75.0],
        [16.5, 75.0],
        [16.5, 75.5],
        [16.0, 75.5]
    ],
    // Belagavi
    [
        [15.5, 74.5],
        [16.0, 74.5],
        [16.0, 75.0],
        [15.5, 75.0]
    ],
    // Davanagere
    [
        [14.5, 75.5],
        [15.0, 75.5],
        [15.0, 76.0],
        [14.5, 76.0]
    ],
    // Tumkur
    [
        [13.5, 77.0],
        [14.0, 77.0],
        [14.0, 77.5],
        [13.5, 77.5]
    ],
    // Bengaluru (including nearby cultivable areas)
    [
        [12.8, 77.4],
        [13.2, 77.4],
        [13.2, 77.8],
        [12.8, 77.8]
    ]
];

// Function to check if a point is within any of the cultivation zones
function isWithinCultivationZone(latitude, longitude) {
    return cultivationZones.some(zone => {
        return pointInPolygon([latitude, longitude], zone);
    });
}

// Function to determine if a point is inside a polygon
function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

exports.isWithinCultivationZone = isWithinCultivationZone;
