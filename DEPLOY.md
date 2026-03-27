# Deployment guide — quick steps to get a hosted link

This project consists of a Node/Express backend and a Vite + React frontend.

Recommended hosts:
- Frontend: Vercel (easy, automatic for Vite)
- Backend: Render (simple for Node + environment variables)

1) Push this repository to GitHub (if not already).

2) Deploy backend to Render (or Railway/Heroku):
  - Create a new Web Service on Render and connect the GitHub repo.
  - Build command: `npm install && npm run build` (not required for this backend). Render will detect Node.
  - Start command: `npm run start` or `node server.js`.
  - Set environment variables in Render dashboard:
    - `MONGO_URI` = your Atlas connection string
    - `JWT_SECRET` = a strong secret
    - `PORT` = 5000 (optional)
  - Deploy and note the service URL (e.g. `https://your-backend.onrender.com`).

3) Deploy frontend to Vercel:
  - Create a new project on Vercel and import the same GitHub repo.
  - Vercel detects Vite and uses `npm run build` by default.
  - Set an Environment Variable on Vercel:
    - `VITE_API_URL` = `https://your-backend.onrender.com/api/v1`
  - Deploy and note Vercel URL (this will be your public app link).

4) After deployment:
  - Test frontend URL in browser.
  - Use the app; backend endpoints should be reachable from the frontend.

If you want, I can perform the deployment for you — I will need GitHub (repo) access or you can add me as a collaborator, and Vercel/Render access (or I can guide you through connecting them). Tell me which you'd like.
