import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { prisma } from './src/lib/prisma.js';
import { calcTotal, calcTransport, calcEnergy, calcDiet, calcShopping } from './src/lib/carbonCalc.js';
import { getPersonalizedInsight } from './src/lib/gemini.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(express.json());

  // API 0: REGISTER USER (POST /api/auth/register)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, city, country } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, name, and password are required' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: password,
          name: name.trim(),
          city: (city && city.trim()) ? city.trim() : 'New Delhi',
          country: (country && country.trim()) ? country.trim() : 'India',
        },
      });

      return res.status(201).json({ success: true, user });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to register new user' });
    }
  });

  // API 0.5: LOGIN USER (POST /api/auth/login)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      return res.json({ success: true, user });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to log in' });
    }
  });

  // API 1: SAVE ACTIVITY LOG (POST /api/log)
  app.post('/api/log', async (req, res) => {
    try {
      const {
        email = 'aryan.raj@trace.earth',
        transport,
        energy,
        diet,
        shopping,
        date = new Date().toISOString(),
      } = req.body;

      if (!transport || !energy || !diet || !shopping) {
        return res.status(400).json({ error: 'Missing required activity categories data' });
      }

      // Find or create user
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0],
            city: 'New Delhi',
            country: 'India',
          },
        });
      }

      // Calculate category metrics using engine
      const { transportKg, energyKg, dietKg, shoppingKg, totalKg } = calcTotal({
        transport,
        energy,
        diet,
        shopping,
      });

      // Insert log
      const newLog = await prisma.activityLog.create({
        data: {
          userId: user.id,
          date: new Date(date),
          transportKg,
          energyKg,
          dietKg,
          shoppingKg,
          totalKg,
        },
      });

      return res.status(201).json({
        success: true,
        log: newLog,
        metrics: { transportKg, energyKg, dietKg, shoppingKg, totalKg },
      });
    } catch (error) {
      console.error('Error posting activity log:', error);
      return res.status(500).json({ error: 'Internal server error saving footprint activity log' });
    }
  });

  // API 2: FETCH STATS (GET /api/stats)
  app.get('/api/stats', async (req, res) => {
    try {
      const email = (req.query.email as string) || 'aryan.raj@trace.earth';

      let user = await prisma.user.findUnique({
        where: { email },
        include: { logs: { orderBy: { date: 'asc' } } },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0],
            city: 'New Delhi',
            country: 'India',
          },
        }) as any;
        if (user) {
          (user as any).logs = [];
        }
      }

      const logs = user.logs;
      if (logs.length === 0) {
        return res.json({
          user,
          scoreToday: 0,
          consecutiveDays: 0,
          averageKg: 0,
          stats7Days: [],
          categoryBreakdown: { transport: 0, energy: 0, diet: 0, shopping: 0 },
          history: [],
        });
      }

      // 1. Today's total score (Latest log matching today, or latest log overall for demo)
      const latestLog = logs[logs.length - 1];
      const todayTotal = latestLog.totalKg;

      // 2. Weekly category aggregates (for last 7 logs or logs in last 7 days)
      const recentLogs = logs.slice(-7);
      let totalTransport = 0;
      let totalEnergy = 0;
      let totalDiet = 0;
      let totalShopping = 0;
      let totalSum = 0;

      recentLogs.forEach((log) => {
        totalTransport += log.transportKg;
        totalEnergy += log.energyKg;
        totalDiet += log.dietKg;
        totalShopping += log.shoppingKg;
        totalSum += log.totalKg;
      });

      const avgDailyTotal = recentLogs.length > 0 ? Number((totalSum / recentLogs.length).toFixed(2)) : 0;

      // 3. Streak Calculator (consecutive days logged)
      let consecutiveDays = 0;
      if (logs.length > 0) {
        consecutiveDays = 1;
        // Examine days backward
        const dates = logs.map((l) => {
          const d = new Date(l.date);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        });
        const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a); // descending order

        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const diffTime = Math.abs(uniqueDates[i] - uniqueDates[i + 1]);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            consecutiveDays++;
          } else if (diffDays > 1) {
            break;
          }
        }
      }

      return res.json({
        user,
        scoreToday: todayTotal,
        todayCategoryBreakdown: {
          transport: latestLog.transportKg,
          energy: latestLog.energyKg,
          diet: latestLog.dietKg,
          shopping: latestLog.shoppingKg,
        },
        consecutiveDays,
        averageKg: avgDailyTotal,
        stats7Days: recentLogs.map((log) => ({
          date: log.date.toISOString().split('T')[0],
          transport: log.transportKg,
          energy: log.energyKg,
          diet: log.dietKg,
          shopping: log.shoppingKg,
          total: log.totalKg,
        })),
        categoryBreakdown: {
          transport: Number(totalTransport.toFixed(2)),
          energy: Number(totalEnergy.toFixed(2)),
          diet: Number(totalDiet.toFixed(2)),
          shopping: Number(totalShopping.toFixed(2)),
        },
        history: logs.map((log) => ({
          id: log.id,
          date: log.date.toISOString().split('T')[0],
          total: log.totalKg,
          transport: log.transportKg,
          energy: log.energyKg,
          diet: log.dietKg,
          shopping: log.shoppingKg,
        })),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return res.status(500).json({ error: 'Internal server error compiling carbon stats' });
    }
  });

  // API 3: LEADERBOARD (GET /api/leaderboard)
  app.get('/api/leaderboard', async (req, res) => {
    try {
      // Find all users and compute their average emissions across logs
      const users = await prisma.user.findMany({
        include: { logs: true },
      });

      const leaderData = users
        .map((user, idx) => {
          const logsCount = user.logs.length;
          const avgEmission =
            logsCount > 0
              ? Number((user.logs.reduce((sum, l) => sum + l.totalKg, 0) / logsCount).toFixed(2))
              : 13.7; // default average if no logs

          // If anonymous is toggled, hide name
          const displayName = user.isAnonymous ? `Anonymous Eco-Partner #${idx + 1}` : user.name || 'Anonymous Eco-Partner';

          return {
            id: user.id,
            email: user.email,
            name: displayName,
            city: user.city || 'New Delhi',
            country: user.country || 'India',
            avgEmission,
            logsLogged: logsCount,
            targetGoal: user.targetKgPerDay,
          };
        })
        .sort((a, b) => a.avgEmission - b.avgEmission); // lower score = healthier = higher rank

      return res.json(leaderData);
    } catch (error) {
      console.error('Error compiling leaderboard:', error);
      return res.status(500).json({ error: 'Internal server error compiling carbon leaderboard' });
    }
  });

  // API 4: AI COACHING INSIGHT (GET /api/insights/ai)
  app.get('/api/insights/ai', async (req, res) => {
    try {
      const email = (req.query.email as string) || 'aryan.raj@trace.earth';

      const user = await prisma.user.findUnique({
        where: { email },
        include: { logs: { orderBy: { date: 'desc' } } },
      });

      if (!user || user.logs.length === 0) {
        return res.json({
          tip: 'No current log entries found. Complete your daily track activity to receive intelligent suggestions today!',
        });
      }

      const latestLog = user.logs[0];

      // Check if cache is still valid (less than 24h old and has cache)
      const now = new Date();
      if (
        latestLog.aiTipCache &&
        latestLog.aiTipGeneratedAt &&
        now.getTime() - new Date(latestLog.aiTipGeneratedAt).getTime() < 24 * 60 * 60 * 1000
      ) {
        return res.json({ tip: latestLog.aiTipCache });
      }

      // Generate new tip using gemini
      const categories = [
        { name: 'transport', val: latestLog.transportKg },
        { name: 'energy', val: latestLog.energyKg },
        { name: 'diet', val: latestLog.dietKg },
        { name: 'shopping', val: latestLog.shoppingKg },
      ];
      categories.sort((a, b) => b.val - a.val);
      const highest = categories[0];

      const tipText = await getPersonalizedInsight({
        totalKg: latestLog.totalKg,
        highestCategory: highest.name,
        highestVal: highest.val,
      });

      // Write tip cache into DB
      await prisma.activityLog.update({
        where: { id: latestLog.id },
        data: {
          aiTipCache: tipText,
          aiTipGeneratedAt: now,
        },
      });

      return res.json({ tip: tipText });
    } catch (error) {
      console.error('Error generating AI coaching tip:', error);
      return res.status(500).json({ error: 'Internal server error triggering coach AI engine' });
    }
  });

  // API 5: PROFILE SETTINGS PUT (PUT /api/profile)
  app.put('/api/profile', async (req, res) => {
    try {
      const { email = 'aryan.raj@trace.earth', name, city, country, isAnonymous, targetKgPerDay, image } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name: name !== undefined ? name : user.name,
          city: city !== undefined ? city : user.city,
          country: country !== undefined ? country : user.country,
          isAnonymous: isAnonymous !== undefined ? isAnonymous : user.isAnonymous,
          targetKgPerDay: targetKgPerDay !== undefined ? Number(targetKgPerDay) : user.targetKgPerDay,
          image: image !== undefined ? image : user.image,
        },
      });

      return res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ error: 'Internal server error updating setting fields' });
    }
  });

  // API 6: EXPORT DATA TO CSV (GET /api/export)
  app.get('/api/export', async (req, res) => {
    try {
      const email = (req.query.email as string) || 'aryan.raj@trace.earth';

      const user = await prisma.user.findUnique({
        where: { email },
        include: { logs: { orderBy: { date: 'asc' } } },
      });

      if (!user) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      // Generate CSV file content
      const headers = ['Record ID', 'Log Date', 'Transport CO2 (kg)', 'Energy CO2 (kg)', 'Diet CO2 (kg)', 'Shopping CO2 (kg)', 'Total Carbon Footprint (kg)'];
      const rows = user.logs.map((log) => [
        log.id,
        log.date.toISOString().split('T')[0],
        log.transportKg.toFixed(2),
        log.energyKg.toFixed(2),
        log.dietKg.toFixed(2),
        log.shoppingKg.toFixed(2),
        log.totalKg.toFixed(2),
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="trace_emissions_${user.name?.replace(/\s+/g, '_') || 'user'}.csv"`);
      return res.send(csvContent);
    } catch (error) {
      console.error('Error exporting activity data as CSV:', error);
      return res.status(500).json({ error: 'Internal server error compiling data export' });
    }
  });

  // Setup static/vite delivery
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`trace.earth server successfully booted on http://localhost:${PORT}`);
  });
}

startServer();
