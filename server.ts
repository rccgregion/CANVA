import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PinterestSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  username?: string;
  profileImage?: string;
}

const pinterestSessions = new Map<string, PinterestSession>();
const pendingOAuthStates = new Map<string, { createdAt: number }>();

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) result[key] = decodeURIComponent(val);
  }
  return result;
};

const getAppBaseUrl = (): string => {
  const configured = process.env.APP_URL;
  if (configured && configured !== 'MY_APP_URL' && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
};

const isAllowedPinterestPageUrl = (rawUrl: string): boolean => {
  try {
    const u = new URL(rawUrl);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    return /(^|\.)pinterest\.[a-z.]+$/i.test(u.hostname) || /^pin\.it$/i.test(u.hostname);
  } catch {
    return false;
  }
};

const isAllowedPinImgUrl = (rawUrl: string): boolean => {
  try {
    const u = new URL(rawUrl);
    return u.protocol === 'https:' && /^(i|s)\.pinimg\.com$/i.test(u.hostname);
  } catch {
    return false;
  }
};

const proxyPinImageUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  if (isAllowedPinImgUrl(rawUrl)) {
    return `/api/pinterest/image-proxy?url=${encodeURIComponent(rawUrl)}`;
  }
  return rawUrl;
};

const probeBinary = (names: string[]): string | null => {
  for (const bin of names) {
    try {
      const found = execSync(`command -v ${bin} 2>/dev/null`, { timeout: 1500 })
        .toString()
        .trim();
      if (found) return found.split('\n')[0];
    } catch {
      // Binary not on PATH
    }
  }
  return null;
};

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Live REA verification & analysis backend inventory endpoint
  app.get('/api/verify-rea', (_req: Request, res: Response) => {
    let version = '6.9.0';
    let functional = false;
    const pkgPath = '/usr/local/lib/node_modules/rea-agents/package.json';
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.version) version = pkg.version;
        functional = fs.existsSync('/usr/local/bin/rea');
      } catch {
        // Keep fallback
      }
    } else if (fs.existsSync('/usr/local/bin/rea')) {
      try {
        version = execSync('/usr/local/bin/rea --version', { timeout: 3000 }).toString().trim() || version;
        functional = true;
      } catch {
        // Keep fallback
      }
    }

    const ghidraPath = probeBinary(['analyzeHeadless', 'ghidraRun', 'ghidra']);
    const idaPath = probeBinary(['idat64', 'ida64', 'ida']);
    const hopperPath = probeBinary(['hopper', 'hopperv4']);
    const kunaPath = probeBinary(['kuna']);
    const rizinPath = probeBinary(['rizin', 'rz-bin', 'cutter']);
    const objdumpPath = probeBinary(['objdump', 'llvm-objdump']);
    const gdbPath = probeBinary(['gdb']);
    const jadxPath = probeBinary(['jadx', 'jadx-gui']);
    const binwalkPath = probeBinary(['binwalk']);
    const unblobPath = probeBinary(['unblob']);
    const cdpPath = probeBinary(['playwright-cli', 'chromium', 'google-chrome']);

    const backends = [
      {
        id: 'ghidra',
        name: 'Ghidra',
        category: 'Native Binary Decompilers & Disassemblers',
        mode: 'external',
        available: Boolean(ghidraPath),
        probePath: ghidraPath || 'analyzeHeadless / ghidra',
        description: 'Open-source decompiler and disassembler for ELF, PE, and Mach-O binaries.',
      },
      {
        id: 'ida',
        name: 'IDA / IDA Pro',
        category: 'Native Binary Decompilers & Disassemblers',
        mode: 'external',
        available: Boolean(idaPath),
        probePath: idaPath || 'ida64 / idat64',
        description: 'Commercial interactive disassembler and decompiler bridge.',
      },
      {
        id: 'hopper',
        name: 'Hopper',
        category: 'Native Binary Decompilers & Disassemblers',
        mode: 'external',
        available: Boolean(hopperPath),
        probePath: hopperPath || 'hopper',
        description: 'Commercial macOS and Linux disassembler and decompiler.',
      },
      {
        id: 'kuna',
        name: 'Kuna',
        category: 'Native Binary Decompilers & Disassemblers',
        mode: 'external',
        available: Boolean(kunaPath),
        probePath: kunaPath || 'kuna',
        description: 'Native binary static analysis engine.',
      },
      {
        id: 'rizin',
        name: 'Rizin & Cutter',
        category: 'Native Binary Decompilers & Disassemblers',
        mode: 'external',
        available: Boolean(rizinPath),
        probePath: rizinPath || 'rizin / cutter',
        description: 'Open-source reverse-engineering framework and GUI bridge for static analysis and debugging.',
      },
      {
        id: 'objdump',
        name: 'GNU objdump',
        category: 'Native Binary Decompilers & Disassemblers',
        mode: 'external',
        available: Boolean(objdumpPath),
        probePath: objdumpPath || 'objdump',
        description: 'Command-line disassembler for native symbols and DWARF debug information.',
      },
      {
        id: 'gdb',
        name: 'GDB',
        category: 'Native Binary Decompilers & Disassemblers',
        mode: 'external',
        available: Boolean(gdbPath),
        probePath: gdbPath || 'gdb',
        description: 'GNU Debugger for persistent or ephemeral runtime debugging sessions on Linux.',
      },
      {
        id: 'jadx',
        name: 'JADX',
        category: 'Mobile, Managed & Bytecode Backends',
        mode: 'external',
        available: Boolean(jadxPath),
        probePath: jadxPath || 'jadx',
        description: 'Android DEX and APK decompiler for inspecting classes, methods, and references.',
      },
      {
        id: 'dotnet-cli',
        name: '.NET / CLI Assembly Inspector',
        category: 'Mobile, Managed & Bytecode Backends',
        mode: 'built-in',
        available: true,
        probePath: 'built-in://clr-pe-inspector',
        description: 'Built-in reader for inspecting managed PE/CLI metadata tables and IL streams.',
      },
      {
        id: 'wasm-evm',
        name: 'WebAssembly (WASM) & EVM Analyzers',
        category: 'Mobile, Managed & Bytecode Backends',
        mode: 'built-in',
        available: true,
        probePath: 'built-in://wasm-evm-disasm',
        description: 'Built-in section decoder and opcode analyzer for WASM modules and EVM bytecode.',
      },
      {
        id: 'flutter',
        name: 'Flutter App Analyzer',
        category: 'Mobile, Managed & Bytecode Backends',
        mode: 'built-in',
        available: true,
        probePath: 'built-in://flutter-snapshot',
        description: 'Specialized inspection support for compiled Flutter targets and widget trees.',
      },
      {
        id: 'binwalk',
        name: 'Binwalk',
        category: 'Firmware & Archive Tools',
        mode: 'external',
        available: Boolean(binwalkPath),
        probePath: binwalkPath || 'binwalk',
        description: 'Caller-supplied firmware analysis and extraction backend on Linux.',
      },
      {
        id: 'unblob',
        name: 'Unblob',
        category: 'Firmware & Archive Tools',
        mode: 'external',
        available: Boolean(unblobPath),
        probePath: unblobPath || 'unblob',
        description: 'Caller-supplied firmware and archive extraction engine on Linux.',
      },
      {
        id: 'archive-apple',
        name: 'Archive & Apple Bundle Inspectors',
        category: 'Firmware & Archive Tools',
        mode: 'built-in',
        available: true,
        probePath: 'built-in://archive-plist-car',
        description: 'Built-in parsers for ZIP, APK, IPA, ASAR archives, Apple .plist, Interface Builder, and asset catalogs.',
      },
      {
        id: 'js-electron',
        name: 'Static JavaScript / Electron Analyzer',
        category: 'Web, JavaScript & Data Inspectors',
        mode: 'built-in',
        available: true,
        probePath: 'built-in://ast-asar-ipc',
        description: 'Built-in parser for inspecting JS trees, ASAR bundles, source maps, routes, and Electron IPC boundaries.',
      },
      {
        id: 'cdp',
        name: 'Chrome DevTools Protocol (CDP)',
        category: 'Web, JavaScript & Data Inspectors',
        mode: cdpPath ? 'built-in' : 'external',
        available: Boolean(cdpPath),
        probePath: cdpPath || 'playwright-cli / chromium',
        description: 'Live browser integration for inspecting websites, DOM state, and runtime web behavior.',
      },
      {
        id: 'har-sqlite',
        name: 'HAR & SQLite Inspectors',
        category: 'Web, JavaScript & Data Inspectors',
        mode: 'built-in',
        available: true,
        probePath: 'built-in://har-sqlite-reader',
        description: 'Built-in readers for saved HTTP Archive (HAR) network captures and SQLite databases.',
      },
    ];

    res.json({
      status: functional ? 'healthy' : cdpPath ? 'cdp-ready' : 'degraded',
      functional,
      version,
      toolsCount: 229,
      builtInCount: backends.filter((b) => b.available).length,
      totalBackends: backends.length,
      backends,
      details: functional
        ? `REA Engine v${version} installed and verified.`
        : cdpPath
          ? `Built-in web/bytecode inspectors & CDP runtime ready (${cdpPath}); external native binaries are caller-supplied.`
          : 'Built-in static inspectors ready; external native binaries not detected on PATH.',
    });
  });

  // 2. Pinterest OAuth 2.0 Status
  app.get('/api/pinterest/status', (req: Request, res: Response) => {
    const clientId = process.env.PINTEREST_CLIENT_ID;
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
    const oauthConfigured = Boolean(
      clientId &&
        clientSecret &&
        clientId !== 'MY_PINTEREST_CLIENT_ID' &&
        clientSecret !== 'MY_PINTEREST_CLIENT_SECRET'
    );

    const cookies = parseCookies(req.headers.cookie);
    const sid = cookies.pinterest_sid;
    const session = sid ? pinterestSessions.get(sid) : undefined;
    const baseUrl = getAppBaseUrl();

    res.json({
      oauthConfigured,
      connected: Boolean(session?.accessToken),
      username: session?.username || null,
      profileImage: session?.profileImage || null,
      callbackUrl: `${baseUrl}/auth/pinterest/callback`,
    });
  });

  // 3. Pinterest OAuth 2.0 Authorization URL generator
  app.get('/api/pinterest/auth/url', (_req: Request, res: Response) => {
    const clientId = process.env.PINTEREST_CLIENT_ID;
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
    const baseUrl = getAppBaseUrl();
    const redirectUri = `${baseUrl}/auth/pinterest/callback`;

    if (
      !clientId ||
      !clientSecret ||
      clientId === 'MY_PINTEREST_CLIENT_ID' ||
      clientSecret === 'MY_PINTEREST_CLIENT_SECRET'
    ) {
      return res.status(400).json({
        configured: false,
        callbackUrl: redirectUri,
        error:
          'Pinterest OAuth credentials (PINTEREST_CLIENT_ID & PINTEREST_CLIENT_SECRET) are not configured on the server yet. You can still import any Pinterest Pin URL directly via oEmbed below.',
      });
    }

    // Prune stale states older than 15 minutes
    const now = Date.now();
    for (const [key, meta] of pendingOAuthStates.entries()) {
      if (now - meta.createdAt > 15 * 60 * 1000) pendingOAuthStates.delete(key);
    }

    const state = crypto.randomBytes(24).toString('hex');
    pendingOAuthStates.set(state, { createdAt: now });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'boards:read,pins:read,user_accounts:read',
      state,
    });

    return res.json({
      configured: true,
      url: `https://www.pinterest.com/oauth/?${params.toString()}`,
      callbackUrl: redirectUri,
    });
  });

  // 4. Pinterest OAuth 2.0 Popup Callback Handler (both / and trailing /)
  const handlePinterestCallback = async (req: Request, res: Response) => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const errParam = typeof req.query.error === 'string' ? req.query.error : '';

    const sendPopupResult = (success: boolean, message: string) => {
      const payload = JSON.stringify({
        type: success ? 'OAUTH_AUTH_SUCCESS' : 'OAUTH_AUTH_ERROR',
        provider: 'pinterest',
        error: success ? undefined : message,
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(`<!DOCTYPE html>
<html>
  <head><title>Pinterest Connection</title></head>
  <body style="font-family:system-ui,-apple-system,sans-serif;padding:24px;background:#0f172a;color:#f8fafc;text-align:center;">
    <p>${message.replace(/[<>&"]/g, '')}</p>
    <script>
      try {
        if (window.opener) {
          window.opener.postMessage(${payload}, '*');
          window.close();
        } else {
          window.location.href = '/';
        }
      } catch (e) {
        window.location.href = '/';
      }
    </script>
  </body>
</html>`);
    };

    if (errParam) {
      return sendPopupResult(false, `Pinterest authorization denied: ${errParam}`);
    }
    if (!code || !state || !pendingOAuthStates.has(state)) {
      return sendPopupResult(false, 'Invalid or expired Pinterest OAuth state.');
    }
    pendingOAuthStates.delete(state);

    const clientId = process.env.PINTEREST_CLIENT_ID || '';
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET || '';
    const redirectUri = `${getAppBaseUrl()}/auth/pinterest/callback`;

    try {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch('https://api.pinterest.com/v5/oauth/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }).toString(),
      });

      const tokenJson = (await tokenRes.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        message?: string;
      };

      if (!tokenRes.ok || !tokenJson.access_token) {
        return sendPopupResult(
          false,
          `Pinterest token exchange failed: ${tokenJson.message || tokenRes.statusText}`
        );
      }

      let username = 'Pinterest Creator';
      let profileImage: string | undefined;
      try {
        const userRes = await fetch('https://api.pinterest.com/v5/user_account', {
          headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        });
        if (userRes.ok) {
          const userJson = (await userRes.json()) as { username?: string; profile_image?: string };
          if (userJson.username) username = userJson.username;
          if (userJson.profile_image) profileImage = proxyPinImageUrl(userJson.profile_image);
        }
      } catch {
        // Non-fatal profile fetch error
      }

      const sid = crypto.randomBytes(24).toString('hex');
      pinterestSessions.set(sid, {
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        expiresAt: tokenJson.expires_in ? Date.now() + tokenJson.expires_in * 1000 : undefined,
        username,
        profileImage,
      });

      res.cookie('pinterest_sid', sid, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendPopupResult(true, 'Pinterest account connected. Closing window...');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected OAuth error';
      return sendPopupResult(false, msg);
    }
  };

  app.get(['/auth/pinterest/callback', '/auth/pinterest/callback/'], handlePinterestCallback);

  // 5. Disconnect Pinterest session
  app.post('/api/pinterest/disconnect', (req: Request, res: Response) => {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.pinterest_sid) {
      pinterestSessions.delete(cookies.pinterest_sid);
    }
    res.clearCookie('pinterest_sid', { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ disconnected: true });
  });

  // 6. List User Pinterest Boards (Authenticated API v5)
  app.get('/api/pinterest/boards', async (req: Request, res: Response) => {
    const cookies = parseCookies(req.headers.cookie);
    const session = cookies.pinterest_sid ? pinterestSessions.get(cookies.pinterest_sid) : undefined;
    if (!session?.accessToken) {
      return res.status(401).json({ error: 'Not connected to Pinterest.' });
    }

    try {
      const r = await fetch('https://api.pinterest.com/v5/boards?page_size=25', {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const data = (await r.json()) as {
        items?: Array<{
          id: string;
          name: string;
          description?: string;
          pin_count?: number;
          media?: { image_cover_url?: string };
        }>;
        message?: string;
      };
      if (!r.ok) {
        return res.status(r.status).json({ error: data.message || 'Failed to fetch Pinterest boards.' });
      }
      const boards = (data.items || []).map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description || '',
        pinCount: b.pin_count || 0,
        coverUrl: proxyPinImageUrl(b.media?.image_cover_url),
      }));
      return res.json({ boards });
    } catch (err) {
      return res.status(502).json({ error: err instanceof Error ? err.message : 'Pinterest API unreachable' });
    }
  });

  // 7. List Pins from a Board or Account (Authenticated API v5)
  app.get('/api/pinterest/pins', async (req: Request, res: Response) => {
    const cookies = parseCookies(req.headers.cookie);
    const session = cookies.pinterest_sid ? pinterestSessions.get(cookies.pinterest_sid) : undefined;
    if (!session?.accessToken) {
      return res.status(401).json({ error: 'Not connected to Pinterest.' });
    }

    const boardId = typeof req.query.boardId === 'string' ? req.query.boardId : '';
    const endpoint =
      boardId && boardId !== 'all'
        ? `https://api.pinterest.com/v5/boards/${encodeURIComponent(boardId)}/pins?page_size=25`
        : 'https://api.pinterest.com/v5/pins?page_size=25';

    try {
      const r = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const data = (await r.json()) as {
        items?: Array<{
          id: string;
          title?: string;
          description?: string;
          alt_text?: string;
          board_id?: string;
          dominant_color?: string;
          link?: string;
          media?: {
            images?: Record<string, { width?: number; height?: number; url?: string }>;
          };
        }>;
        message?: string;
      };
      if (!r.ok) {
        return res.status(r.status).json({ error: data.message || 'Failed to fetch Pinterest pins.' });
      }

      const pins = (data.items || []).map((p) => {
        const imgs = p.media?.images || {};
        const picked = imgs['600x'] || imgs['1200x'] || imgs['originals'] || imgs['400x300'] || Object.values(imgs)[0];
        return {
          id: p.id,
          title: p.title || p.alt_text || 'Pinterest Design Pin',
          description: p.description || '',
          boardId: p.board_id || '',
          dominantColor: p.dominant_color || '#7d2ae8',
          pinUrl: `https://www.pinterest.com/pin/${p.id}/`,
          imageUrl: proxyPinImageUrl(picked?.url),
          width: picked?.width || 600,
          height: picked?.height || 800,
          author: session.username || 'Pinterest Board',
        };
      });
      return res.json({ pins });
    } catch (err) {
      return res.status(502).json({ error: err instanceof Error ? err.message : 'Pinterest API unreachable' });
    }
  });

  // 8. Official Zero-Key Pinterest oEmbed Pin Converter (works immediately for any public Pin URL)
  app.post('/api/pinterest/oembed', async (req: Request, res: Response) => {
    const rawUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    const category = typeof req.body?.category === 'string' && req.body.category.trim() ? req.body.category.trim() : 'Minimal';

    if (!rawUrl || !isAllowedPinterestPageUrl(rawUrl)) {
      return res.status(400).json({
        error: 'Please enter a valid Pinterest Pin URL (e.g. https://www.pinterest.com/pin/99360735500167749/).',
      });
    }

    try {
      let targetUrl = rawUrl;
      // Resolve pin.it short URL safely
      if (/^pin\.it$/i.test(new URL(rawUrl).hostname)) {
        const resolveRes = await fetch(rawUrl, { method: 'HEAD', redirect: 'follow' });
        if (resolveRes.url && isAllowedPinterestPageUrl(resolveRes.url)) {
          targetUrl = resolveRes.url;
        }
      }

      const oembedEndpoint = `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(targetUrl)}`;
      const r = await fetch(oembedEndpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CanvaStudio/1.0)',
          Accept: 'application/json',
        },
      });
      if (!r.ok) {
        return res.status(r.status === 404 ? 404 : 502).json({
          error: `Pinterest oEmbed returned ${r.status}. Verify that the Pin URL is public and points to a specific pin.`,
        });
      }

      const data = (await r.json()) as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
        width?: number;
        height?: number;
        url?: string;
      };

      if (!data.thumbnail_url) {
        return res.status(422).json({ error: 'This Pinterest link did not include an extractable design image.' });
      }

      // Upgrade 236x thumbnail URL to 736x when hosted on i.pinimg.com for sharper artboard rendering
      const hiResUrl = data.thumbnail_url.replace(/i\.pinimg\.com\/236x\//i, 'i.pinimg.com/736x/');
      const pinIdMatch = (data.url || targetUrl).match(/\/pin\/(\d+)/);
      const pinId = pinIdMatch ? pinIdMatch[1] : crypto.randomBytes(6).toString('hex');

      return res.json({
        pin: {
          id: `pin-${pinId}`,
          title: (data.title || 'Pinterest Design Template').trim(),
          author: (data.author_name || 'Pinterest Creator').trim(),
          pinUrl: data.url || targetUrl,
          imageUrl: proxyPinImageUrl(hiResUrl),
          width: data.width || 736,
          height: data.height || 736,
          category,
        },
      });
    } catch (err) {
      return res.status(502).json({
        error: err instanceof Error ? err.message : 'Unable to reach Pinterest oEmbed service.',
      });
    }
  });

  // 9. CORS-safe pinimg image proxy so HTML5 Canvas2D exports remain untainted
  app.get('/api/pinterest/image-proxy', async (req: Request, res: Response) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
    if (!isAllowedPinImgUrl(rawUrl)) {
      return res.status(400).send('Invalid Pinterest CDN URL');
    }

    try {
      const upstream = await fetch(rawUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.pinterest.com/' },
      });
      if (!upstream.ok) {
        // Fallback from 736x to 236x if the larger size is missing
        if (/\/736x\//i.test(rawUrl)) {
          const fallbackUrl = rawUrl.replace(/\/736x\//i, '/236x/');
          const fallbackRes = await fetch(fallbackUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.pinterest.com/' },
          });
          if (fallbackRes.ok) {
            const buf = Buffer.from(await fallbackRes.arrayBuffer());
            res.setHeader('Content-Type', fallbackRes.headers.get('content-type') || 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.send(buf);
          }
        }
        return res.status(upstream.status).send('Failed to load Pinterest asset');
      }
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(buf);
    } catch {
      return res.status(502).send('Error proxying Pinterest image');
    }
  });

  // Mount Vite middleware in dev, or serve static dist/ in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/auth/')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
