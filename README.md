<div align="center">
  <br />

  <h1 align="center" style="font-size: 40px; font-weight: 700; margin-bottom: 0;">
    trace<span style="color: #16a34a; font-weight: 500;">.earth</span>
  </h1>

  <p align="center" style="font-size: 14px; margin-top: 4px; color: #888888;">
    <i>Track your carbon footprint. Understand your impact. Act today.</i>
  </p>
  
  <br />
 
[![Live Demo](https://img.shields.io/badge/Live%20Demo-trace--earth.onrender.com-16a34a?style=flat-square)](https://trace-earth.onrender.com)
[![Built with](https://img.shields.io/badge/Built%20with-React%20%2B%20Express-orange?style=flat-square)](https://react.dev)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-purple?style=flat-square)](https://ai.google.dev)
 
</div>


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

## 🛠️ Local Setup

Follow these steps to get the project running locally on your machine.



### Installation Steps

1. **Clone the repository:**
   ```
   git clone [https://github.com/your-username/trace.earth.git](https://github.com/your-username/trace.earth.git)
   cd trace.earth
   ```

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

##  AI-Assisted Development Workflow
This project was rapidly prototyped and built using an iterative design-by-prompting workflow in **Google AI Studio**. 

Instead of writing everything from scratch, the development process focused on:
* **Strategic Prompting:** Breaking down complex full-stack requirements into modular prompts.
* **Rapid Iteration:** Reviewing generated outputs in real-time, diagnosing layout/logic bugs, and feeding immediate feedback back into Gemini 1.5 Flash to refine the codebase.
* **Human-in-the-Loop Architecture:** Guiding the AI to stitch together state management (Zustand), database ORM (Prisma), and authentication pipelines into a cohesive, production-ready system.
---

<div align="center">

Built by [Aryan Raj](https://github.com/aryxncodes7) · PromptWars Virtual 2026

</div>
