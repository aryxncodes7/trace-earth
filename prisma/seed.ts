import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with realistic carbon tracker logs...');

  // Clean up any existing records to keep the seed clean and repeatable
  await prisma.activityLog.deleteMany({});
  await prisma.user.deleteMany({});

  // Create primary demo user
  const demoEmail = 'aryan.raj@trace.earth';
  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      name: 'Aryan Raj',
      image: '',
      city: 'New Delhi',
      country: 'India',
      isAnonymous: false,
      targetKgPerDay: 10.0, // A personal goal lower than the 13.7kg global average
    },
  });

  console.log(`Created demo user: ${user.name} (${user.email})`);

  // Generate 30 days of realistic carbon footprint log entries starting backwards from June 17th, 2026
  const baseDate = new Date('2026-06-17T12:00:00Z');
  const activityLogs = [];

  // Emission patterns: weekdays have higher transport, work energy; weekends have higher shopping and meat diets
  for (let i = 29; i >= 0; i--) {
    const logDate = new Date(baseDate);
    logDate.setDate(baseDate.getDate() - i);
    const dayOfWeek = logDate.getDay(); // 0 is Sunday, 6 is Saturday

    // 1. TRANSPORT CALCULATION
    let transportKg = 0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: shorter trips (e.g. 15 km in Petrol Car = 3.15 kg, or Walk/metro = 0.5 kg)
      const random = Math.random();
      if (random < 0.4) {
        transportKg = Number((15 * 0.21).toFixed(2)); // Petrol car
      } else if (random < 0.7) {
        transportKg = Number((20 * 0.04).toFixed(2)); // Metro
      } else {
        transportKg = 0; // Walked/Biked
      }
    } else {
      // Weekday: Commuting 35km.
      const random = Math.random();
      if (random < 0.5) {
        transportKg = Number((35 * 0.21).toFixed(2)); // Petrol car (7.35 kg)
      } else if (random < 0.8) {
        transportKg = Number((35 * 0.05).toFixed(2)); // EV (1.75 kg)
      } else {
        transportKg = Number((35 * 0.04).toFixed(2)); // Train/Metro (1.40 kg)
      }
    }

    // 2. ENERGY CALCULATION
    let energyKg = 0;
    // Standard grid (0.40/kWh), Mixed (0.18), Solar (0.01)
    const activeHrs = weekdayFactor(dayOfWeek, 6, 9);
    const baseKwh = 12 + activeHrs * 1.5;
    const randomSource = Math.random();
    if (randomSource < 0.4) {
      energyKg = Number((baseKwh * 0.40).toFixed(2)); // Standard grid
    } else if (randomSource < 0.8) {
      energyKg = Number((baseKwh * 0.18).toFixed(2)); // Mixed solar/grid
    } else {
      energyKg = Number((baseKwh * 0.01).toFixed(2)); // 100% renew
    }

    // 3. DIET CALCULATION
    let dietKg = 0;
    // Diet factors (kg CO2 / meal): Meat: 3.3, Omnivore: 1.8, Veg: 0.9, Vegan: 0.5
    // Food waste multiplier: none=1.0, some=1.15, lots=1.35
    const dietTypeRoll = Math.random();
    let baseMealFactor = 1.8; // Omnivore by default
    if (dietTypeRoll < 0.2) {
      baseMealFactor = 3.3; // Meat-heavy day
    } else if (dietTypeRoll < 0.7) {
      baseMealFactor = 1.8; // Omnivore
    } else if (dietTypeRoll < 0.9) {
      baseMealFactor = 0.9; // Vegetarian day
    } else {
      baseMealFactor = 0.5; // Vegan day
    }

    const wasteRoll = Math.random();
    const wasteMultiplier = wasteRoll < 0.6 ? 1.0 : (wasteRoll < 0.9 ? 1.15 : 1.35);

    dietKg = Number((3 * baseMealFactor * wasteMultiplier).toFixed(2));

    // 4. SHOPPING CALCULATION
    let shoppingKg = 0;
    // 0.5 kg per online order, 8 kg per new clothing item, 0.036 kg per streaming hr
    const streamingHrs = Math.floor(Math.random() * 4) + 1; // 1-4 hours
    const streamingKg = streamingHrs * 0.036;

    const shoppingRoll = Math.random();
    let onlineOrdersKg = 0;
    let clothesKg = 0;
    if (shoppingRoll < 0.25) {
      onlineOrdersKg = 1 * 0.5;
    } else if (shoppingRoll < 0.05) {
      clothesKg = 1 * 8.0;
    }
    shoppingKg = Number((onlineOrdersKg + clothesKg + streamingKg).toFixed(2));

    // Calculate total CO2
    const totalKg = Number((transportKg + energyKg + dietKg + shoppingKg).toFixed(2));

    let aiTipCache = null;
    let aiTipGeneratedAt = null;

    // Pick 3 days to pre-cache some AI tips to demonstrate fast UI loading
    if (i === 0) {
      aiTipCache = 'Switching to vegetarian meals twice a week could reduce your food footprint by nearly 20%. Try replacing red meat with local legumes today.';
      aiTipGeneratedAt = logDate;
    } else if (i === 7) {
      aiTipCache = 'Your transport emissions represent your largest carbon source. Pooling rides or substituting 2 car trips with public transit this week makes a huge difference.';
      aiTipGeneratedAt = logDate;
    } else if (i === 15) {
      aiTipCache = 'Using solar power or standard mixed renewable tariffs lowers home energy footprint instantly. Ensure your thermostat is set to 78°F in summer to reduce A/C loads.';
      aiTipGeneratedAt = logDate;
    }

    activityLogs.push({
      userId: user.id,
      date: logDate,
      transportKg,
      energyKg,
      dietKg,
      shoppingKg,
      totalKg,
      aiTipCache,
      aiTipGeneratedAt,
    });
  }

  // Insert all log entries
  await prisma.activityLog.createMany({
    data: activityLogs,
  });

  console.log(`Successfully seeded database with 30 activity logs!`);
}

function weekdayFactor(dayOfWeek: number, weekdayVal: number, weekendVal: number): number {
  return (dayOfWeek === 0 || dayOfWeek === 6) ? weekendVal : weekdayVal;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
