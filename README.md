# Baniere - University Schedule Builder

A web application for generating optimal university course schedules based on course availability and student preferences.

> **🚀 [Live Demo](https://baniere.vercel.app)** (Update this link after deployment)

## Features

- **Course Search**: Search and select courses by code or name
- **Smart Filters**: Configure constraints like free days, max end time, only open sections
- **Schedule Generation**: Automatically generate all possible conflict-free schedules
- **Visual Grid**: View schedules in a weekly calendar grid
- **Schedule Comparison**: Compare multiple schedules side-by-side
- **Spanish UI**: Full Spanish language interface for Universidad de los Andes students

## Tech Stack

### Backend
- Node.js + TypeScript + Express
- Banner/Ellucian JSON data normalization
- Backtracking DFS algorithm for schedule generation
- In-memory caching (Redis-ready for production)

### Frontend
- React 18 + TypeScript + Vite
- TanStack Query for data fetching
- Tailwind CSS for styling
- Lucide React for icons

## Project Structure

```
baniere/
├── backend/          # Express API server
├── frontend/         # React web app
├── courses.json      # Sample course data (6,013 courses)
└── instructions.md   # Detailed development guide
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Windows (PowerShell) or Unix-like system

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will start on http://localhost:3001

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on http://localhost:5173

## API Endpoints

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/search?q=ADMI` - Search courses
- `GET /api/courses/:code` - Get course sections
- `GET /api/courses/subjects/list` - List all subjects

### Schedules
- `POST /api/schedules/generate` - Generate schedules

**Request Example:**
```json
{
  "courses": ["ADMI1101", "MATE1203", "FISI1018"],
  "filters": {
    "maxEndTime": "1800",
    "freeDays": ["friday"],
    "onlyOpenSections": true
  },
  "maxResults": 500
}
```

## Development

### Backend
```bash
cd backend
npm run dev      # Development with hot reload
npm run build    # Build for production
npm test         # Run tests
```

### Frontend
```bash
cd frontend
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Configuration

### Backend (.env)
```
PORT=3001
NODE_ENV=development
COURSES_JSON_PATH=../courses.json
CORS_ORIGIN=http://localhost:5173
```

### Frontend
The frontend proxies API requests to the backend through Vite configuration.

## Data Format

The application uses Banner/Ellucian format course data. See `instructions.md` for detailed data contract and normalization rules.

## Algorithm

The schedule generation uses:
- **Backtracking DFS** with pruning
- **Conflict pre-computation** for O(1) lookups
- **Smallest-branching-first** heuristic
- **Progressive generation** with configurable limits
- **Multi-criteria scoring** for schedule ranking

## Contributing

1. Follow TypeScript best practices
2. Maintain Spanish UI strings
3. Write tests for new features
4. Update documentation

## License

MIT

## Deployment

### Quick Deploy to Production (Free)

This project can be deployed completely free:

1. **Backend**: Deploy to [Render.com](https://render.com) (Free tier, 750 hrs/month)
2. **Frontend**: Deploy to [Vercel](https://vercel.com) (Free unlimited)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete step-by-step guide.

### One-Command Setup

```powershell
# Windows PowerShell
.\deploy-to-github.ps1
```

This will:
- Initialize Git repository
- Configure GitHub remote
- Commit all files
- Guide you through pushing to GitHub

After pushing to GitHub, follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to Render + Vercel.

## Support

For questions or issues, please refer to `instructions.md` for detailed technical documentation.
