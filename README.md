# Readmigo Dashboard

[![CI](https://github.com/readmigo/dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/readmigo/dashboard/actions/workflows/ci.yml)

Admin dashboard for managing Readmigo platform.

## Tech Stack

- **Framework**: React with Vite
- **Language**: TypeScript
- **UI Library**: Ant Design
- **Charts**: Recharts
- **State Management**: React Query

## Features

- User management and analytics
- Book catalog management
- Content moderation
- Reading statistics and trends
- Subscription management
- System health monitoring

## Project Structure

```
├── src/
│   ├── pages/           # Dashboard pages
│   │   ├── demographics/
│   │   ├── retention/
│   │   ├── performance/
│   │   └── ...
│   ├── components/      # Shared components
│   ├── services/        # API services
│   └── utils/           # Utilities
└── public/
```

## Online Services

| Environment | URL |
|-------------|-----|
| Production | https://dashboard.readmigo.com |

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Deployment

Deployed on Vercel with automatic deployments from main branch.
