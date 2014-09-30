// Geom is a namespace for 2d math functions.
Geom = {}

Geom.point = function(x, y) {
  return { x: x, y: y };
}

// Return the distance between two points
Geom.dist = function(p1, p2) {
  return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
}

// Return the distance squared between two points
Geom.distSquared = function(p1, p2) {
  return (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
}

Geom.lengthSquared = function(v) {
  return v.x * v.x + v.y * v.y;
}

Geom.length = function(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

Geom.dot = function(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

Geom.sub = function(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

Geom.add = function(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

Geom.scale = function(v, s) {
  return { x: v.x * s, y: v.y * s };
}
