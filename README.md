<div align="center">

<br />

<svg width="180" height="44" viewBox="0 0 180 44" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="nc"><circle cx="22" cy="22" r="16"/></clipPath></defs>
  <circle cx="22" cy="22" r="16" fill="#dbeafe"/>
  <ellipse cx="20" cy="20" rx="5" ry="7" fill="#16a34a" opacity="0.75" clip-path="url(#nc)"/>
  <ellipse cx="27" cy="25" rx="4" ry="5" fill="#16a34a" opacity="0.6" clip-path="url(#nc)"/>
  <circle cx="22" cy="22" r="16" fill="none" stroke="#93c5fd" stroke-width="0.5"/>
  <ellipse cx="22" cy="22" rx="21" ry="7" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.5"/>
  <circle cx="43" cy="22" r="3" fill="#16a34a"/>
  <text x="52" y="28" font-family="Inter, sans-serif" font-size="22" font-weight="500" fill="#0f172a">trace<tspan fill="#16a34a" font-weight="400">.earth</tspan></text>
</svg>

<br />

**Track your carbon footprint. Understand your impact. Act today.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-trace--earth.onrender.com-16a34a?style=flat-square)](https://trace-earth.onrender.com)
[![Built with](https://img.shields.io/badge/Built%20with-React%20%2B%20Express-orange?style=flat-square)](https://react.dev)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-purple?style=flat-square)](https://ai.google.dev)

</div>

---

## What is trace.earth?

trace.earth is a personal carbon footprint awareness platform that helps individuals track, understand, and reduce their daily CO₂ emissions. Most carbon calculators are either too complex for everyday use or too vague to be meaningful. trace.earth sits in the middle - accurate enough to matter, simple enough to use every day.

Users log their daily activities across transport, energy, diet, and shopping. The platform calculates real CO₂ emissions using IPCC-verified emission factors, visualizes trends over time, and uses Gemini AI to generate personalized, actionable reduction tips based on each user's highest-impact category.

---

## Features

- **Cinematic splash screen** - animated Earth globe with live global CO₂ counter on first visit
- **Daily activity logger** - multi-step form covering transport, home energy, diet, and shopping
- **Real-time CO₂ calculation** - IPCC-standard emission factors, updates as you type
- **Personal dashboard** - score ring, weekly trend chart, category breakdown, streak counter
- **AI environmental coach** - Gemini 1.5 Flash generates personalized 2-sentence tips, cached 24h
- **Monthly heatmap** - GitHub-style calendar showing emission patterns over time
- **Global leaderboard** - ranked by daily average CO₂, with anonymous mode toggle
- **Carbon offset marketplace** - browse real offset programs with Gold Standard / VCS certification
- **OAuth authentication** - sign in with Google or GitHub, or continue as guest
- **CSV data export** - download your full emission history
- **Dark mode** - full dark/light theme support
- **Mobile responsive** - bottom tab navigation on mobile, works on all screen sizes

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| State management | Zustand |
| Animations | Motion (Framer Motion) |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | Sonner |
| Backend | Node.js, Express |
| Database | Prisma ORM + PostgreSQL (Neon) |
| AI | Google Gemini 1.5 Flash (`@google/genai`) |
| Auth | Passport.js (Google OAuth + GitHub OAuth) |
| Language | TypeScript (end-to-end) |
| Deployment | Render (backend) |

---

## Carbon calculation methodology

Emission factors sourced from IPCC AR6 and IEA 2024 data:

**Transport** (kg CO₂ per km)
| Mode | Factor |
|---|---|
| Petrol car | 0.21 |
| Diesel car | 0.17 | 
| Electric vehicle | 0.05 |
| Bus | 0.09 |
| Metro / rail | 0.04 |
| Short-haul flight | 0.26 |
| Walk / bike | 0.00 |

**Home energy** (kg CO₂ per kWh)
| Source | Factor |
|---|---|
| Standard grid | 0.40 |
| Mixed renewables | 0.18 |
| 100% renewable | 0.01 |

**Diet** (kg CO₂ per meal)
| Type | Factor |
|---|---|
| Meat-heavy | 3.30 |
| Omnivore balanced | 1.80 |
| Vegetarian | 0.90 |
| Vegan | 0.50 |

Food waste multiplier: none = 1.0×, some = 1.15×, lots = 1.35×  
Shopping: 0.5 kg per online order, 8 kg per new clothing item  
Streaming: 0.036 kg per hour

---

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Neon free tier recommended)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Local setup


# Clone the repository
```
git clone https://github.com/aryxncodes7/trace-earth.git
cd trace-earth
```

# Install dependencies
```
npm install
```

# Copy environment variables
```
cp .env.example .env
```
# Fill in your values in .env

# Run database migrations
```
npx prisma migrate dev
```

# Seed with demo data
```
npx prisma db seed
```

# Start development server
```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```env
DATABASE_URL=postgresql://...          # Neon or any PostgreSQL connection string
GEMINI_API_KEY=...                     # Google AI Studio API key
GOOGLE_CLIENT_ID=...                   # Google OAuth client ID
GOOGLE_CLIENT_SECRET=...               # Google OAuth client secret
GITHUB_CLIENT_ID=...                   # GitHub OAuth client ID
GITHUB_CLIENT_SECRET=...               # GitHub OAuth client secret
NEXTAUTH_SECRET=...                    # Session encryption secret (any random string)
APP_URL=https://your-domain.com        # Your deployed URL
NODE_ENV=production                    # Set to production on deployment
```

### OAuth callback URLs

When setting up OAuth apps, use these callback URLs:

**Google Cloud Console:**
```
https://your-domain.com/api/auth/google/callback
```

**GitHub Developer Settings:**
```
https://your-domain.com/api/auth/github/callback
```

---

## Deployment

### Deploy on Render (recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run start`
5. Add all environment variables from above
6. Deploy

---

## Project structure

```
trace-earth/
├── src/
│   ├── app/                    # Page components
│   ├── components/             # Reusable UI components
│   │   ├── ActivityForm.tsx    # Multi-step emission logger
│   │   ├── AIInsightCard.tsx   # Gemini AI coaching card
│   │   ├── CalendarHeatmap.tsx # Monthly CO₂ heatmap
│   │   ├── CategoryBreakdown.tsx
│   │   ├── GlobalEmissionsCounter.tsx
│   │   ├── LeaderboardTable.tsx
│   │   ├── Navbar.tsx
│   │   ├── OffsetCard.tsx
│   │   ├── ScoreRing.tsx       # Animated CO₂ score ring
│   │   ├── SplashScreen.tsx    # Cinematic intro animation
│   │   └── WeeklyChart.tsx
│   ├── lib/
│   │   ├── carbonCalc.ts       # IPCC emission factor engine
│   │   ├── gemini.ts           # Gemini AI integration
│   │   └── prisma.ts           # Database client
│   └── store/
│       └── useStore.ts         # Zustand global state
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Demo data seeder
├── server.ts                   # Express API server
├── vite.config.ts
└── package.json
```

---

## Built for PromptWars Virtual - Challenge 3

> "Create a digital solution that helps individuals track, understand, and reduce their personal carbon emissions."

trace.earth was built as a competition entry for PromptWars Virtual, Challenge 3: Carbon Footprint Awareness Platform. The goal was to move beyond basic carbon calculators and build something people would actually use - a product that feels personal, looks professional, and makes the data actionable.

---

<div align="center">

Built by [Aryan Raj](https://github.com/aryxncodes7) · PromptWars Virtual 2026

</div>
