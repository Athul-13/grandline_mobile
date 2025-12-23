/**
 * Interpolation Utilities for Mobile
 * Provides smooth animation functions for marker movement and rotation
 */

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Angle interpolation with 360° wrap handling
 */
export function lerpAngle(start: number, end: number, t: number): number {
  start = ((start % 360) + 360) % 360;
  end = ((end % 360) + 360) % 360;

  let diff = end - start;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return start + diff * t;
}

/**
 * Calculate distance between two lat/lng points in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

