import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import crypto from 'crypto';
import { defaultData } from './src/data/defaultData.js';
import { AppDatabase, LinkItem, Category, FileItem, SearchEngine, SiteConfig } from './src/types.js';

const app = express();
const PORT = 3000;

// Directories setup
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial default sample files if needed
const samplePdf = path.join(UPLOADS_DIR, 'sample-shortcuts-guide.pdf');
if (!fs.existsSync(samplePdf)) {
  fs.writeFileSync(samplePdf, 'OmniNav Keyboard Shortcuts Guide Sample PDF Content');
}
const sampleZip = path.join(UPLOADS_DIR, 'sample-wallpapers.zip');
if (!fs.existsSync(sampleZip)) {
  fs.writeFileSync(sampleZip, 'OmniNav Wallpapers Pack Sample Content');
}

// Initialize database in JSON file
let db: AppDatabase;
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(raw);
    // Ensure site title is updated to M14BEAT导航
    db.config = { ...defaultData.config, ...(db.config || {}), title: db.config?.title === 'OmniNav 极速导航' ? 'M14BEAT导航' : (db.config?.title || 'M14BEAT导航') };
    db.categories = db.categories || defaultData.categories;
    db.links = db.links || [];
    db.files = db.files || [];
    db.searchEngines = db.searchEngines || defaultData.searchEngines;
    db.adminPasswordHash = db.adminPasswordHash || defaultData.adminPasswordHash;
    // Save updated db structure
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } else {
    db = defaultData;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }
} catch (err) {
  console.error('Error reading db.json, falling back to defaultData:', err);
  db = defaultData;
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

// Active session token store
const activeTokens = new Set<string>();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
app.use('/uploads', express.static(UPLOADS_DIR));

// File Upload Storage setup via Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Helper auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录或凭证已失效' });
  }
  const token = authHeader.substring(7);
  if (!activeTokens.has(token)) {
    return res.status(401).json({ error: '登录会话已过期，请重新登录' });
  }
  next();
}

// Helper formatting file sizes
function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/* =========================================================
   PUBLIC API ENDPOINTS
   ========================================================= */

// Fetch site public data
app.get('/api/data', (req: Request, res: Response) => {
  res.json({
    categories: db.categories,
    links: db.links,
    files: db.files,
    searchEngines: db.searchEngines,
    config: db.config,
  });
});

// Click count increment
app.post('/api/links/click/:id', (req: Request, res: Response) => {
  const link = db.links.find((l) => l.id === req.params.id);
  if (link) {
    link.clicks = (link.clicks || 0) + 1;
    saveDb();
    return res.json({ success: true, clicks: link.clicks });
  }
  res.status(404).json({ error: 'Link not found' });
});

// Download count increment & download endpoint
app.get('/api/files/download/:id', (req: Request, res: Response) => {
  const fileItem = db.files.find((f) => f.id === req.params.id);
  if (!fileItem) {
    return res.status(404).json({ error: '文件不存在' });
  }
  fileItem.downloads = (fileItem.downloads || 0) + 1;
  saveDb();

  if (fileItem.isExternalUrl) {
    return res.redirect(fileItem.filePath);
  }

  const localPath = path.join(process.cwd(), fileItem.filePath.replace('/uploads/', 'uploads/'));
  if (fs.existsSync(localPath)) {
    return res.download(localPath, fileItem.filename);
  } else {
    return res.status(404).json({ error: '本地物理文件已被移除或不存在' });
  }
});

/* =========================================================
   AUTHENTICATION API
   ========================================================= */

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: '请输入密码' });
  }

  // Simple check against stored password
  if (password === db.adminPasswordHash) {
    const token = 'token_' + crypto.randomBytes(16).toString('hex');
    activeTokens.add(token);
    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ error: '密码不正确，请重新输入' });
  }
});

app.post('/api/auth/verify', (req: Request, res: Response) => {
  const token = req.body.token || req.headers.authorization?.substring(7);
  if (token && activeTokens.has(token)) {
    return res.json({ valid: true });
  }
  return res.json({ valid: false });
});

app.post('/api/auth/change-password', requireAuth, (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (oldPassword !== db.adminPasswordHash) {
    return res.status(400).json({ error: '原密码错误' });
  }
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: '新密码长度最少 4 位' });
  }
  db.adminPasswordHash = newPassword;
  saveDb();
  res.json({ success: true, message: '密码修改成功！' });
});

/* =========================================================
   ADMIN CRUD ENDPOINTS
   ========================================================= */

// Categories CRUD
app.post('/api/admin/categories', requireAuth, (req: Request, res: Response) => {
  const category: Category = req.body;
  if (!category.name) {
    return res.status(400).json({ error: '分类名称不能为空' });
  }

  const existingIdx = db.categories.findIndex((c) => c.id === category.id);
  if (existingIdx >= 0) {
    db.categories[existingIdx] = category;
  } else {
    category.id = category.id || 'cat_' + Date.now();
    db.categories.push(category);
  }
  db.categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  saveDb();
  res.json({ success: true, categories: db.categories });
});

app.delete('/api/admin/categories/:id', requireAuth, (req: Request, res: Response) => {
  const id = req.params.id;
  db.categories = db.categories.filter((c) => c.id !== id);
  // Reassign links in deleted category or keep them unassigned
  saveDb();
  res.json({ success: true, categories: db.categories });
});

// Links CRUD
app.post('/api/admin/links', requireAuth, (req: Request, res: Response) => {
  const linkData: LinkItem = req.body;
  if (!linkData.title || !linkData.url) {
    return res.status(400).json({ error: '网址标题和 URL 不能为空' });
  }

  const existingIdx = db.links.findIndex((l) => l.id === linkData.id);
  if (existingIdx >= 0) {
    db.links[existingIdx] = { ...db.links[existingIdx], ...linkData };
  } else {
    linkData.id = 'link_' + Date.now();
    linkData.clicks = 0;
    linkData.createdAt = new Date().toISOString();
    db.links.unshift(linkData);
  }
  saveDb();
  res.json({ success: true, links: db.links });
});

app.delete('/api/admin/links/:id', requireAuth, (req: Request, res: Response) => {
  const id = req.params.id;
  db.links = db.links.filter((l) => l.id !== id);
  saveDb();
  res.json({ success: true, links: db.links });
});

// Search Engines CRUD
app.post('/api/admin/search-engines', requireAuth, (req: Request, res: Response) => {
  const engines: SearchEngine[] = req.body.searchEngines;
  if (Array.isArray(engines)) {
    db.searchEngines = engines;
    saveDb();
    return res.json({ success: true, searchEngines: db.searchEngines });
  }
  res.status(400).json({ error: '数据格式有误' });
});

// Site Config Save
app.post('/api/admin/config', requireAuth, (req: Request, res: Response) => {
  const configData: SiteConfig = req.body;
  db.config = { ...db.config, ...configData };
  saveDb();
  res.json({ success: true, config: db.config });
});

// Files CRUD
app.post('/api/admin/files', requireAuth, (req: Request, res: Response) => {
  const fileData: FileItem = req.body;
  if (!fileData.title || !fileData.filePath) {
    return res.status(400).json({ error: '文件名称与路径不能为空' });
  }

  const existingIdx = db.files.findIndex((f) => f.id === fileData.id);
  if (existingIdx >= 0) {
    db.files[existingIdx] = { ...db.files[existingIdx], ...fileData };
  } else {
    fileData.id = 'file_' + Date.now();
    fileData.downloads = 0;
    fileData.uploadedAt = new Date().toISOString();
    db.files.unshift(fileData);
  }
  saveDb();
  res.json({ success: true, files: db.files });
});

app.delete('/api/admin/files/:id', requireAuth, (req: Request, res: Response) => {
  const id = req.params.id;
  const target = db.files.find((f) => f.id === id);
  if (target && !target.isExternalUrl) {
    const localPath = path.join(process.cwd(), target.filePath.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
      } catch (err) {
        console.error('Failed to unlink local file:', err);
      }
    }
  }
  db.files = db.files.filter((f) => f.id !== id);
  saveDb();
  res.json({ success: true, files: db.files });
});

// Upload endpoint for files & images
app.post('/api/upload', requireAuth, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: '未收到上传的文件' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  const formattedSize = formatBytes(req.file.size);
  const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase() || 'FILE';

  res.json({
    success: true,
    fileUrl,
    filename: req.file.originalname,
    fileSize: formattedSize,
    fileType: ext,
  });
});

/* =========================================================
   AUTO URL META FETCH TOOL
   ========================================================= */

app.get('/api/tools/fetch-meta', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: '缺失 url 参数' });
  }

  let formattedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(formattedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Derive favicon url
    const parsedUrl = new URL(formattedUrl);
    let faviconUrl = `${parsedUrl.origin}/favicon.ico`;

    const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
    if (iconMatch && iconMatch[1]) {
      const rawIcon = iconMatch[1];
      if (rawIcon.startsWith('http://') || rawIcon.startsWith('https://')) {
        faviconUrl = rawIcon;
      } else if (rawIcon.startsWith('//')) {
        faviconUrl = parsedUrl.protocol + rawIcon;
      } else if (rawIcon.startsWith('/')) {
        faviconUrl = `${parsedUrl.origin}${rawIcon}`;
      } else {
        faviconUrl = `${parsedUrl.origin}/${rawIcon}`;
      }
    }

    return res.json({
      title: title || parsedUrl.hostname,
      description: description || `访问 ${parsedUrl.hostname}`,
      faviconUrl,
    });
  } catch (err: any) {
    try {
      const parsedUrl = new URL(formattedUrl);
      return res.json({
        title: parsedUrl.hostname,
        description: `访问 ${parsedUrl.hostname}`,
        faviconUrl: `${parsedUrl.origin}/favicon.ico`,
      });
    } catch {
      return res.status(500).json({ error: '解析网页信息失败，请直接手动填写' });
    }
  }
});

/* =========================================================
   BACKUP & RESTORE ENDPOINTS
   ========================================================= */

app.get('/api/admin/backup/export', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=omninav-backup-${Date.now()}.json`);
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/admin/backup/import', requireAuth, (req: Request, res: Response) => {
  const importedData = req.body;
  if (!importedData || !Array.isArray(importedData.categories) || !Array.isArray(importedData.links)) {
    return res.status(400).json({ error: '备份文件格式不符合 OmniNav 数据库要求' });
  }

  db = {
    ...defaultData,
    ...importedData,
  };
  saveDb();
  res.json({ success: true, message: '备份数据恢复成功！' });
});

/* =========================================================
   VITE & STATIC SERVER CONFIGURATION
   ========================================================= */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
