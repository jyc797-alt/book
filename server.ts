import { createServer as createViteServer } from 'vite';
import express from 'express';
import { app } from './src/server/app';
import { DEFAULT_GAS_URL } from './src/data/mockData';

const PORT = 3000;

// Initial sync from user's live spreadsheet if possible
async function syncFromGasIfPossible() {
  if (!DEFAULT_GAS_URL) return;
  try {
    const res = await fetch(`${DEFAULT_GAS_URL}?action=getAllReservations`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.reservations) && data.reservations.length > 0) {
        console.log(`Loaded ${data.reservations.length} live reservations from GAS`);
      }
    }
  } catch (e: any) {
    console.log('Initial GAS sync skipped:', e.message);
  }
}

// Mount Vite middleware for dev or serve dist in prod
async function startServer() {
  await syncFromGasIfPossible();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
