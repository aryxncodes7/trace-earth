/**
 * Carbon Calculation Engine
 * Contains emission factors (kg CO2) for different category activities
 */

export const EMISSION_FACTORS = {
  transport: {
    petrolCar: 0.21,
    dieselCar: 0.17,
    ev: 0.05,
    bus: 0.09,
    metro: 0.04,
    flight: 0.26, // Short-haul per km
    none: 0.0,    // Walking or biking
  },
  energy: {
    grid: 0.40,      // Standard grid per kWh
    mixed: 0.18,     // Mixed renewables per kWh
    renewable: 0.01, // 100% renewable per kWh
  },
  diet: {
    meatHeavy: 3.3,
    omnivore: 1.8,
    vegetarian: 0.9,
    vegan: 0.5,
  },
  foodWaste: {
    none: 1.0,
    some: 1.15,
    lots: 1.35,
  },
  shopping: {
    onlineOrder: 0.5,  // Per order
    clothingItem: 8.0, // Per item
  },
  streaming: {
    perHour: 0.036,
  },
};

export interface TransportInput {
  mode: 'petrolCar' | 'dieselCar' | 'ev' | 'bus' | 'metro' | 'flight' | 'none';
  distance: number; // km
}

export interface EnergyInput {
  kwh: number;
  source: 'grid' | 'mixed' | 'renewable';
  acHours?: number; // Optional metadata
}

export interface DietInput {
  type: 'meatHeavy' | 'omnivore' | 'vegetarian' | 'vegan';
  mealsCount: number; // usually 3
  waste: 'none' | 'some' | 'lots';
}

export interface ShoppingInput {
  onlineOrders: number;
  clothingItems: number;
  streamingHours: number;
}

export interface LogInput {
  transport: TransportInput;
  energy: EnergyInput;
  diet: DietInput;
  shopping: ShoppingInput;
}

/**
 * Calculates carbon footprint for transport
 */
export function calcTransport(input: TransportInput): number {
  const factor = EMISSION_FACTORS.transport[input.mode] || 0;
  return Number((input.distance * factor).toFixed(2));
}

/**
 * Calculates carbon footprint for energy
 */
export function calcEnergy(input: EnergyInput): number {
  const factor = EMISSION_FACTORS.energy[input.source] || 0;
  return Number((input.kwh * factor).toFixed(2));
}

/**
 * Calculates carbon footprint for diet
 */
export function calcDiet(input: DietInput): number {
  const factor = EMISSION_FACTORS.diet[input.type] || 0;
  const multiplier = EMISSION_FACTORS.foodWaste[input.waste] || 1.0;
  return Number((input.mealsCount * factor * multiplier).toFixed(2));
}

/**
 * Calculates carbon footprint for shopping & streaming
 */
export function calcShopping(input: ShoppingInput): number {
  const orderKg = input.onlineOrders * EMISSION_FACTORS.shopping.onlineOrder;
  const clothesKg = input.clothingItems * EMISSION_FACTORS.shopping.clothingItem;
  const streamingKg = input.streamingHours * EMISSION_FACTORS.streaming.perHour;
  return Number((orderKg + clothesKg + streamingKg).toFixed(2));
}

/**
 * Calculates total footprint
 */
export function calcTotal(input: LogInput): {
  transportKg: number;
  energyKg: number;
  dietKg: number;
  shoppingKg: number;
  totalKg: number;
} {
  const transportKg = calcTransport(input.transport);
  const energyKg = calcEnergy(input.energy);
  const dietKg = calcDiet(input.diet);
  const shoppingKg = calcShopping(input.shopping);
  const totalKg = Number((transportKg + energyKg + dietKg + shoppingKg).toFixed(2));

  return {
    transportKg,
    energyKg,
    dietKg,
    shoppingKg,
    totalKg,
  };
}
