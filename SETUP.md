# Setup Instructions

Follow these steps to get Baniere running on your local machine.

## Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PowerShell** (Windows) or terminal (Mac/Linux)

## Step-by-Step Setup

### 1. Install Backend Dependencies

```powershell
cd backend
npm install
```

This will install:
- express, cors, dotenv
- TypeScript and type definitions
- Development tools (tsx, jest)

### 2. Install Frontend Dependencies

```powershell
cd ../frontend
npm install
```

This will install:
- React, React DOM
- Vite build tool
- TanStack Query
- Tailwind CSS
- TypeScript types

### 3. Start the Backend Server

```powershell
cd ../backend
npm run dev
```

You should see:
```
🚀 Baniere Backend Server
Port: 3001
Courses JSON: ../courses.json
Available endpoints:
  GET  /health
  GET  /api/courses
  ...
```

Keep this terminal window open.

### 4. Start the Frontend (New Terminal)

Open a **new terminal window**, then:

```powershell
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5. Open in Browser

Navigate to **http://localhost:5173**

You should see the Baniere interface!

## Troubleshooting

### "Cannot find module" errors
- Run `npm install` in both backend and frontend directories

### Backend won't start
- Check if port 3001 is already in use
- Verify `courses.json` exists in the root directory
- Check `.env` file in backend directory

### Frontend won't connect to backend
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify proxy configuration in `vite.config.ts`

### TypeScript errors
These are normal before installing dependencies. They will disappear after `npm install`.

## Verification

### Test Backend
```powershell
curl http://localhost:3001/health
```

Should return:
```json
{"success":true,"status":"healthy",...}
```

### Test Course Search
```powershell
curl "http://localhost:3001/api/courses/search?q=ADMI"
```

Should return course results.

### Test Frontend
- Open http://localhost:5173
- Search for "ADMI" in the course search
- Should see course suggestions

## Next Steps

1. **Try generating a schedule:**
   - Search and add 2-3 courses
   - Configure filters (optional)
   - Click "Generar Horarios"
   - View generated schedules in the grid

2. **Explore the data:**
   - The app uses `courses.json` with 6,013 real courses
   - Try different filter combinations
   - Compare multiple schedules

3. **Development:**
   - Backend code is in `backend/src/`
   - Frontend code is in `frontend/src/`
   - See `instructions.md` for architecture details

## Production Build

### Backend
```powershell
cd backend
npm run build
npm start
```

### Frontend
```powershell
cd frontend
npm run build
npm run preview
```

## Need Help?

- Check `README.md` for feature overview
- See `instructions.md` for detailed technical docs
- Review API endpoints in `backend/README.md`
- Check component structure in `frontend/README.md`
