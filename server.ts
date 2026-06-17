import 'dotenv/config';
import express from 'express';
import path from 'path';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { createServer as createViteServer } from 'vite';
import { prisma } from './src/lib/prisma.js';
import { calcTotal, calcTransport, calcEnergy, calcDiet, calcShopping } from './src/lib/carbonCalc.js';
import { getPersonalizedInsight } from './src/lib/gemini.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import session from 'express-session';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[a-zA-Z][a-zA-Z\s'.-]{1,79}$/;
const LOCATION_PATTERN = /^[a-zA-Z][a-zA-Z\s'.-]{1,79}$/;
const PASSWORD_HASH_PREFIX = 'scrypt$';

const normalizeEmail = (value: unknown) => {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
};

const normalizeText = (value: unknown) => {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
};

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${PASSWORD_HASH_PREFIX}${salt}$${hash}`;
};

const verifyPassword = (password: string, storedPassword: string) => {
  if (!storedPassword) return false;

  if (!storedPassword.startsWith(PASSWORD_HASH_PREFIX)) {
    return password === storedPassword;
  }

  const [, salt, hash] = storedPassword.split('$');
  if (!salt || !hash) return false;

  const storedBuffer = Buffer.from(hash, 'hex');
  const suppliedBuffer = scryptSync(password, salt, 64);

  return storedBuffer.length === suppliedBuffer.length && timingSafeEqual(storedBuffer, suppliedBuffer);
};

const validatePassword = (password: unknown) => {
  if (typeof password !== 'string') return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password must be 128 characters or less';
  return null;
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set('trust proxy', 1);

  // Global Middlewares
  app.use(express.json());

  // Session middleware
  const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'some-secure-custom-ambient-secret';
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000
}
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Dynamic origin helper for callback URLs
  const getOrigin = (req: express.Request) => {
    if (process.env.APP_URL) {
      return process.env.APP_URL.replace(/\/$/, '');
    }
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    return `${protocol}://${host}`;
  };

  // Google Strategy
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
      callbackURL: 'dummy-callback-placeholder',
      passReqToCallback: true,
    },
    async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }
        let user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: email.toLowerCase().trim(),
              name: profile.displayName || profile.name?.givenName || email.split('@')[0],
              image: profile.photos?.[0]?.value || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              city: 'New Delhi',
              country: 'India',
            }
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));

  // GitHub Strategy
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID || 'dummy-github-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy-github-client-secret',
      callbackURL: 'dummy-callback-placeholder',
      passReqToCallback: true,
    },
    async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let email = profile.emails?.[0]?.value;
        if (!email) {
          email = `${profile.username || profile.id}@github.com`;
        }
        let user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: email.toLowerCase().trim(),
              name: profile.displayName || profile.username || email.split('@')[0],
              image: profile.photos?.[0]?.value || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              city: 'New Delhi',
              country: 'India',
            }
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));

  // Authentication Endpoints
  app.get('/api/auth/google', (req, res, next) => {
    const origin = getOrigin(req);
    const callbackURL = `${origin}/api/auth/google/callback`;
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      callbackURL
    } as any)(req, res, next);
  });

  app.get('/api/auth/google/callback', (req, res, next) => {
    const origin = getOrigin(req);
    const callbackURL = `${origin}/api/auth/google/callback`;
    passport.authenticate('google', {
      callbackURL,
      failureRedirect: '/?error=google-auth-failed'
    } as any, (err: any, user: any, info: any) => {
      if (err || !user) {
        return res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: '${err?.message || "Auth failed"}' }, '*');
                  window.close();
                } else {
                  window.location.href = '/?error=google-auth-failed';
                }
              </script>
            </body>
          </html>
        `);
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        return res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', email: '${user.email}' }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
            </body>
          </html>
        `);
      });
    })(req, res, next);
  });

  app.get('/api/auth/github', (req, res, next) => {
    const origin = getOrigin(req);
    const callbackURL = `${origin}/api/auth/github/callback`;
    passport.authenticate('github', {
      scope: ['user:email'],
      callbackURL
    } as any)(req, res, next);
  });

  app.get('/api/auth/github/callback', (req, res, next) => {
    const origin = getOrigin(req);
    const callbackURL = `${origin}/api/auth/github/callback`;
    passport.authenticate('github', {
      callbackURL,
      failureRedirect: '/?error=github-auth-failed'
    } as any, (err: any, user: any, info: any) => {
      if (err || !user) {
        return res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: '${err?.message || "Auth failed"}' }, '*');
                  window.close();
                } else {
                  window.location.href = '/?error=github-auth-failed';
                }
              </script>
            </body>
          </html>
        `);
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        return res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', email: '${user.email}' }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
            </body>
          </html>
        `);
      });
    })(req, res, next);
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return res.json({ authenticated: true, user: req.user });
    }
    return res.json({ authenticated: false });
  });

  app.post('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });

  // API 0: REGISTER USER (POST /api/auth/register)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, city, country } = req.body;
      const emailValue = normalizeEmail(email);
      const nameValue = normalizeText(name);
      const cityValue = normalizeText(city);
      const countryValue = normalizeText(country);
      const passwordError = validatePassword(password);

      if (!EMAIL_PATTERN.test(emailValue)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }

      if (!NAME_PATTERN.test(nameValue)) {
        return res.status(400).json({ error: 'Please enter a valid name' });
      }

      if (!LOCATION_PATTERN.test(cityValue)) {
        return res.status(400).json({ error: 'Please enter a valid city' });
      }

      if (!LOCATION_PATTERN.test(countryValue)) {
        return res.status(400).json({ error: 'Please enter a valid country' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email: emailValue } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const user = await prisma.user.create({
        data: {
          email: emailValue,
          password: hashPassword(password),
          name: nameValue,
          city: cityValue,
          country: countryValue,
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
      const emailValue = normalizeEmail(email);
      const passwordError = validatePassword(password);

      if (!EMAIL_PATTERN.test(emailValue)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }

      const user = await prisma.user.findUnique({ where: { email: emailValue } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (!verifyPassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (user.password && !user.password.startsWith(PASSWORD_HASH_PREFIX)) {
        await prisma.user.update({
          where: { email: emailValue },
          data: { password: hashPassword(password) },
        });
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
        const dates: number[] = logs.map((l): number => {
          const d = new Date(l.date);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        });
        const uniqueDates: number[] = Array.from(new Set<number>(dates)).sort((a, b) => b - a); // descending order

        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const currentDate = uniqueDates[i] ?? 0;
          const previousDate = uniqueDates[i + 1] ?? currentDate;
          const diffTime = Math.abs(currentDate - previousDate);
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
