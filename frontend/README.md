# Baniere Frontend

React + TypeScript frontend for the University Schedule Builder.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Features

- **Course Search**: Real-time search with autocomplete
- **Filter Panel**: Configure schedule preferences
- **Schedule Viewer**: Visual weekly grid with navigation
- **Responsive Design**: Works on desktop and mobile
- **Spanish UI**: Full localization

## Project Structure

```
src/
├── components/
│   ├── CourseSearch/      # Course search and selection
│   ├── FilterPanel/        # Filter configuration
│   ├── ScheduleViewer/     # Schedule display
│   └── common/             # Reusable components
├── hooks/
│   ├── useCourses.ts       # React Query hooks
│   ├── useFilters.ts       # Filter state management
│   └── useScheduleGenerator.ts
├── services/
│   └── api.ts              # API client
├── types/
│   ├── course.ts
│   ├── schedule.ts
│   └── filter.ts
├── utils/
│   ├── timeFormatter.ts
│   └── cn.ts               # Class name utility
├── App.tsx
├── main.tsx
└── index.css
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **TanStack Query**: Data fetching
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Axios**: HTTP client

## API Integration

The frontend communicates with the backend API at `http://localhost:3001`. The Vite dev server proxies `/api` requests to the backend.

## State Management

- **React Query**: Server state (courses, schedules)
- **useState**: Local component state
- **localStorage**: Filter persistence

## Styling

The app uses Tailwind CSS with a custom color palette. See `tailwind.config.js` for configuration.

## Spanish Translations

All UI text is in Spanish. Translations are defined in:
- `src/types/filter.ts` (day names)
- Individual components (inline strings)
