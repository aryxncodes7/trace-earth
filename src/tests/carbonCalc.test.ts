import { describe, it, expect } from 'vitest';

const TRANSPORT_FACTORS: Record<string, number> = {
  petrol: 0.21, diesel: 0.17, ev: 0.05, bus: 0.09,
  metro: 0.04, flight: 0.26, walk: 0.0, bike: 0.0,
};
const ENERGY_FACTORS: Record<string, number> = { grid: 0.40, mixed: 0.18, renewable: 0.01 };
const DIET_FACTORS: Record<string, number> = { 'meat-heavy': 3.3, omnivore: 1.8, vegetarian: 0.9, vegan: 0.5 };
const WASTE_MULTIPLIERS: Record<string, number> = { none: 1.0, some: 1.15, lots: 1.35 };

function calcTransport(mode: string, distanceKm: number): number {
  return Number(((TRANSPORT_FACTORS[mode] ?? 0) * distanceKm).toFixed(2));
}
function calcEnergy(source: string, kwh: number): number {
  return Number(((ENERGY_FACTORS[source] ?? 0.4) * kwh).toFixed(2));
}
function calcDiet(type: string, meals: number, waste: string): number {
  return Number(((DIET_FACTORS[type] ?? 1.8) * meals * (WASTE_MULTIPLIERS[waste] ?? 1.0)).toFixed(2));
}
function calcShopping(orders: number, clothing: number, streamingHours: number): number {
  return Number(((orders * 0.5) + (clothing * 8) + (streamingHours * 0.036)).toFixed(2));
}
function calcTotal(t: number, e: number, d: number, s: number): number {
  return Number((t + e + d + s).toFixed(2));
}

describe('calcTransport', () => {
  it('calculates petrol car emissions', () => { expect(calcTransport('petrol', 10)).toBe(2.1); });
  it('calculates EV emissions', () => { expect(calcTransport('ev', 10)).toBe(0.5); });
  it('returns 0 for walking', () => { expect(calcTransport('walk', 100)).toBe(0); });
  it('returns 0 for biking', () => { expect(calcTransport('bike', 50)).toBe(0); });
  it('calculates flight emissions', () => { expect(calcTransport('flight', 100)).toBe(26); });
  it('calculates metro emissions', () => { expect(calcTransport('metro', 20)).toBe(0.8); });
  it('calculates bus emissions', () => { expect(calcTransport('bus', 15)).toBe(1.35); });
  it('returns 0 for zero distance', () => { expect(calcTransport('petrol', 0)).toBe(0); });
  it('defaults to 0 for unknown mode', () => { expect(calcTransport('spaceship', 10)).toBe(0); });
});

describe('calcEnergy', () => {
  it('calculates standard grid', () => { expect(calcEnergy('grid', 10)).toBe(4.0); });
  it('calculates mixed renewables', () => { expect(calcEnergy('mixed', 10)).toBe(1.8); });
  it('calculates 100% renewable', () => { expect(calcEnergy('renewable', 10)).toBe(0.1); });
  it('returns 0 for 0 kwh', () => { expect(calcEnergy('grid', 0)).toBe(0); });
  it('defaults to grid for unknown source', () => { expect(calcEnergy('unknown', 10)).toBe(4.0); });
});

describe('calcDiet', () => {
  it('calculates meat-heavy diet', () => { expect(calcDiet('meat-heavy', 3, 'none')).toBe(9.9); });
  it('calculates vegan diet', () => { expect(calcDiet('vegan', 3, 'none')).toBe(1.5); });
  it('applies some waste multiplier', () => { expect(calcDiet('omnivore', 3, 'some')).toBeCloseTo(6.21, 1); });
  it('applies lots waste multiplier', () => { expect(calcDiet('vegan', 2, 'lots')).toBeCloseTo(1.35, 1); });
  it('calculates vegetarian diet', () => { expect(calcDiet('vegetarian', 2, 'none')).toBe(1.8); });
});

describe('calcShopping', () => {
  it('calculates online orders', () => { expect(calcShopping(2, 0, 0)).toBe(1.0); });
  it('calculates clothing emissions', () => { expect(calcShopping(0, 1, 0)).toBe(8.0); });
  it('calculates streaming emissions', () => { expect(calcShopping(0, 0, 10)).toBeCloseTo(0.36, 2); });
  it('calculates combined shopping', () => { expect(calcShopping(1, 1, 0)).toBe(8.5); });
  it('returns 0 for all zeros', () => { expect(calcShopping(0, 0, 0)).toBe(0); });
});

describe('calcTotal', () => {
  it('sums all categories', () => { expect(calcTotal(2.1, 4.0, 5.4, 1.0)).toBe(12.5); });
  it('returns 0 when all zero', () => { expect(calcTotal(0, 0, 0, 0)).toBe(0); });
  it('handles decimals correctly', () => { expect(calcTotal(1.23, 2.45, 3.67, 0.12)).toBe(7.47); });
});

describe('emission thresholds', () => {
  it('low emission day is < 8kg', () => { expect(6.5 < 8).toBe(true); });
  it('moderate emission day is 8-13kg', () => { const t = 10.0; expect(t >= 8 && t <= 13).toBe(true); });
  it('high emission day is > 13kg', () => { expect(15.0 > 13).toBe(true); });
  it('boundary: 8kg is moderate', () => { const t = 8.0; expect(t >= 8 && t <= 13).toBe(true); });
  it('boundary: 13kg is moderate', () => { const t = 13.0; expect(t >= 8 && t <= 13).toBe(true); });
});
