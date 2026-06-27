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

import { z } from 'zod';

export const transportSchema = z.object({
  mode: z.enum(['petrolCar', 'dieselCar', 'ev', 'bus', 'metro', 'flight', 'none']).catch('none'),
  distance: z.coerce.number().min(0).catch(0),
});
export type TransportInput = z.infer<typeof transportSchema>;

export const energySchema = z.object({
  kwh: z.coerce.number().min(0).catch(0),
  source: z.enum(['grid', 'mixed', 'renewable']).catch('grid'),
  acHours: z.coerce.number().optional(),
});
export type EnergyInput = z.infer<typeof energySchema>;

export const dietSchema = z.object({
  type: z.enum(['meatHeavy', 'omnivore', 'vegetarian', 'vegan']).catch('omnivore'),
  mealsCount: z.coerce.number().min(0).catch(0),
  waste: z.enum(['none', 'some', 'lots']).catch('some'),
});
export type DietInput = z.infer<typeof dietSchema>;

export const shoppingSchema = z.object({
  onlineOrders: z.coerce.number().min(0).catch(0),
  clothingItems: z.coerce.number().min(0).catch(0),
  streamingHours: z.coerce.number().min(0).catch(0),
});
export type ShoppingInput = z.infer<typeof shoppingSchema>;

export const logInputSchema = z.object({
  transport: transportSchema.catch({ mode: 'none', distance: 0 }),
  energy: energySchema.catch({ kwh: 0, source: 'grid' }),
  diet: dietSchema.catch({ type: 'omnivore', mealsCount: 0, waste: 'some' }),
  shopping: shoppingSchema.catch({ onlineOrders: 0, clothingItems: 0, streamingHours: 0 }),
});
export type LogInput = z.infer<typeof logInputSchema>;

/**
 * Calculates carbon footprint for transport
 */
export function calcTransport(input: any): number {
  const data = transportSchema.parse(input || {});
  const factor = EMISSION_FACTORS.transport[data.mode] || 0;
  return Number((data.distance * factor).toFixed(2));
}

/**
 * Calculates carbon footprint for energy
 */
export function calcEnergy(input: any): number {
  const data = energySchema.parse(input || {});
  const factor = EMISSION_FACTORS.energy[data.source] || 0;
  return Number((data.kwh * factor).toFixed(2));
}

/**
 * Calculates carbon footprint for diet
 */
export function calcDiet(input: any): number {
  const data = dietSchema.parse(input || {});
  const factor = EMISSION_FACTORS.diet[data.type] || 0;
  const multiplier = EMISSION_FACTORS.foodWaste[data.waste] || 1.0;
  return Number((data.mealsCount * factor * multiplier).toFixed(2));
}

/**
 * Calculates carbon footprint for shopping & streaming
 */
export function calcShopping(input: any): number {
  const data = shoppingSchema.parse(input || {});
  const orderKg = data.onlineOrders * EMISSION_FACTORS.shopping.onlineOrder;
  const clothesKg = data.clothingItems * EMISSION_FACTORS.shopping.clothingItem;
  const streamingKg = data.streamingHours * EMISSION_FACTORS.streaming.perHour;
  return Number((orderKg + clothesKg + streamingKg).toFixed(2));
}

/**
 * Calculates total footprint
 */
export function calcTotal(input: any): {
  transportKg: number;
  energyKg: number;
  dietKg: number;
  shoppingKg: number;
  totalKg: number;
} {
  const data = logInputSchema.parse(input || {});
  const transportKg = calcTransport(data.transport);
  const energyKg = calcEnergy(data.energy);
  const dietKg = calcDiet(data.diet);
  const shoppingKg = calcShopping(data.shopping);
  const totalKg = Number((transportKg + energyKg + dietKg + shoppingKg).toFixed(2));

  return {
    transportKg,
    energyKg,
    dietKg,
    shoppingKg,
    totalKg,
  };
}
