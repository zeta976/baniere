# Baniere Backend API

Backend API server for the University Schedule Builder.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
copy .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The server will start on http://localhost:3001

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Courses
- `GET /api/courses` - List all courses (supports query params: term, subject, openOnly)
- `GET /api/courses/search?q=ADMI` - Search courses by code or title
- `GET /api/courses/:code` - Get all sections for a course (e.g., ADMI1101)
- `GET /api/courses/subjects/list` - Get list of all subjects

### Schedules
- `POST /api/schedules/generate` - Generate all possible schedules

#### Request Body Example:
```json
{
  "courses": ["ADMI1101", "MATE1203", "FISI1018"],
  "filters": {
    "maxEndTime": "1800",
    "freeDays": ["friday"],
    "onlyOpenSections": true,
    "preferCompact": true
  },
  "maxResults": 500
}
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## Architecture

```
src/
├── api/
│   ├── routes/          # Express routes
│   └── middleware/      # Middleware (validation, error handling)
├── services/
│   ├── normalizer.ts    # Banner JSON → normalized format
│   ├── generator.ts     # Schedule generation algorithm
│   ├── conflictChecker.ts
│   └── filterEngine.ts
├── models/              # TypeScript interfaces
├── utils/               # Helper functions
├── config/              # Configuration
└── index.ts             # Express app entry point
```
