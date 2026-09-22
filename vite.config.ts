import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function sheetProxyPlugin(): Plugin {
  return {
    name: 'sheet-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/sheet-proxy', async (req, res) => {
        try {
          const fullUrl = new URL(req.url || '', 'http://localhost:3000');
          const targetUrl = fullUrl.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing url query parameter' }));
            return;
          }

          const fetchRes = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (!fetchRes.ok) {
            res.statusCode = fetchRes.status;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`Fetch failed with HTTP ${fetchRes.status}: ${fetchRes.statusText}`);
            return;
          }

          const text = await fetchRes.text();
          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(text);
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          const msg = err instanceof Error ? err.message : String(err);
          res.end(JSON.stringify({ error: msg }));
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/sheet-proxy', async (req, res) => {
        try {
          const fullUrl = new URL(req.url || '', 'http://localhost:3000');
          const targetUrl = fullUrl.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing url query parameter' }));
            return;
          }

          const fetchRes = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (!fetchRes.ok) {
            res.statusCode = fetchRes.status;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`Fetch failed with HTTP ${fetchRes.status}`);
            return;
          }

          const text = await fetchRes.text();
          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(text);
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          const msg = err instanceof Error ? err.message : String(err);
          res.end(JSON.stringify({ error: msg }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sheetProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets',
      sourcemap: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
