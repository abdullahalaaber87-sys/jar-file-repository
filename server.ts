import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Setup directories for uploads and persistent data
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage helper functions
export interface ServerJarFile {
  id: string;
  fileName: string;
  filePath: string;
  title: string;
  description: string;
  version: string;
  fileSizeBytes: number;
  uploadDate: string;
  downloadCount: number;
  iconCategory: string;
  fileExtension?: string;
  javaVersion?: string;
  mainClass?: string;
  sha256Checksum: string;
  changelog?: string;
}

function readCatalog(): ServerJarFile[] {
  try {
    if (!fs.existsSync(CATALOG_FILE)) {
      // Start completely empty - no sample files
      fs.writeFileSync(CATALOG_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading catalog.json:', err);
    return [];
  }
}

function writeCatalog(jars: ServerJarFile[]): void {
  try {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(jars, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing catalog.json:', err);
  }
}

function getStoredPasscode(): string {
  try {
    if (!fs.existsSync(ADMIN_FILE)) {
      const defaultData = { passcode: 'admin123' };
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return 'admin123';
    }
    const raw = fs.readFileSync(ADMIN_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.passcode || 'admin123';
  } catch {
    return 'admin123';
  }
}

function saveStoredPasscode(passcode: string): void {
  try {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify({ passcode }, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving admin passcode:', err);
  }
}

// Admin Authorization Middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const provided = req.headers['x-admin-passcode'];
  const current = getStoredPasscode();

  if (!provided || provided !== current) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin passcode' });
  }
  next();
}

// Multer storage for any file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${uniqueSuffix}-${cleanName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 300 * 1024 * 1024, // Up to 300MB per file
  },
  // Accept ANY file format without restriction
  fileFilter: (_req, _file, cb) => {
    cb(null, true);
  },
});

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Verify passcode
app.post('/api/admin/verify', (req, res) => {
  const { passcode } = req.body;
  const current = getStoredPasscode();
  if (passcode && passcode.trim() === current.trim()) {
    res.json({ success: true, message: 'Passcode verified' });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect passcode' });
  }
});

// Change admin passcode
app.post('/api/admin/change-passcode', (req, res) => {
  const { currentPasscode, newPasscode } = req.body;
  const stored = getStoredPasscode();

  if (!currentPasscode || currentPasscode.trim() !== stored.trim()) {
    return res.status(401).json({ error: 'Current passcode is incorrect' });
  }

  if (!newPasscode || newPasscode.trim().length < 4) {
    return res.status(400).json({ error: 'New passcode must be at least 4 characters long' });
  }

  saveStoredPasscode(newPasscode.trim());
  res.json({ success: true, message: 'Admin passcode updated successfully' });
});

// List all .jar files (Public)
app.get('/api/jars', (_req, res) => {
  const catalog = readCatalog();
  // Strip internal filePath before returning to client
  const clientJars = catalog.map(({ filePath, ...rest }) => rest);
  res.json(clientJars);
});

// Get single .jar details (Public)
app.get('/api/jars/:id', (req, res) => {
  const catalog = readCatalog();
  const jar = catalog.find((j) => j.id === req.params.id);
  if (!jar) {
    return res.status(404).json({ error: 'File not found' });
  }
  const { filePath, ...rest } = jar;
  res.json(rest);
});

// Direct Download .jar file (Public)
app.get('/api/jars/:id/download', (req, res) => {
  const catalog = readCatalog();
  const jar = catalog.find((j) => j.id === req.params.id);
  if (!jar) {
    return res.status(404).send('JAR file not found');
  }

  if (!fs.existsSync(jar.filePath)) {
    return res.status(404).send('Physical file is missing from server storage');
  }

  // Increment download count
  jar.downloadCount = (jar.downloadCount || 0) + 1;
  writeCatalog(catalog);

  // Send physical file as attachment
  res.download(jar.filePath, jar.fileName, (err) => {
    if (err) {
      console.error('Error sending file download:', err);
    }
  });
});

// Upload new file (Admin only - any file format allowed)
app.post('/api/jars', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'A valid file is required' });
    }

    const diskPath = req.file.path;
    const fileBuffer = fs.readFileSync(diskPath);

    // Calculate sha256 checksum
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    const checksum = hash.digest('hex');

    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase().replace(/^\./, '') || 'file';

    // Inspect manifest if it's a jar/zip
    let detectedMainClass = '';
    let detectedJavaVersion = '';
    if (ext === 'jar' || ext === 'zip') {
      try {
        const zip = await JSZip.loadAsync(fileBuffer);
        const manifestFile = zip.file('META-INF/MANIFEST.MF');
        if (manifestFile) {
          const content = await manifestFile.async('string');
          const mainMatch = content.match(/Main-Class:\s*([^\r\n]+)/i);
          if (mainMatch) {
            detectedMainClass = mainMatch[1].trim();
          }
          const jdkMatch = content.match(/(?:Build-Jdk-Spec|Build-Jdk):\s*([^\r\n]+)/i);
          if (jdkMatch) {
            detectedJavaVersion = `Java ${jdkMatch[1].trim()}`;
          }
        }
      } catch {
        // Non-standard zip/jar format is fine
      }
    }

    const id = `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const title = req.body.title?.trim() || baseName;
    const description = req.body.description?.trim() || `Uploaded ${originalName} file for public download.`;
    const version = req.body.version?.trim() || 'v1.0.0';

    // Auto-detect category if not provided
    let autoCategory = req.body.iconCategory;
    if (!autoCategory) {
      if (['jar', 'war', 'ear'].includes(ext)) autoCategory = 'tool';
      else if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) autoCategory = 'archive';
      else if (['exe', 'msi', 'apk', 'app', 'deb', 'rpm', 'bin'].includes(ext)) autoCategory = 'executable';
      else if (['pdf', 'doc', 'docx', 'txt', 'md', 'epub'].includes(ext)) autoCategory = 'document';
      else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp4', 'mp3', 'wav'].includes(ext)) autoCategory = 'media';
      else if (['json', 'yml', 'yaml', 'xml', 'cfg', 'properties', 'toml', 'sh', 'py', 'js', 'ts'].includes(ext)) autoCategory = 'code';
      else autoCategory = 'other';
    }

    const changelog = req.body.changelog?.trim() || '';

    const newJar: ServerJarFile = {
      id,
      fileName: originalName,
      filePath: diskPath,
      title,
      description,
      version,
      fileSizeBytes: req.file.size,
      uploadDate: new Date().toISOString(),
      downloadCount: 0,
      iconCategory: autoCategory,
      fileExtension: ext,
      javaVersion: req.body.javaVersion?.trim() || detectedJavaVersion || undefined,
      mainClass: req.body.mainClass?.trim() || detectedMainClass || undefined,
      sha256Checksum: checksum,
      changelog: changelog || undefined,
    };

    const catalog = readCatalog();
    catalog.unshift(newJar);
    writeCatalog(catalog);

    const { filePath, ...clientJar } = newJar;
    res.status(201).json(clientJar);
  } catch (err: any) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: err.message || 'Failed to upload file' });
  }
});

// Update .jar details (Admin only)
app.put('/api/jars/:id', requireAdmin, (req, res) => {
  const catalog = readCatalog();
  const index = catalog.findIndex((j) => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const existing = catalog[index];
  const { title, description, version, iconCategory, changelog, javaVersion, mainClass } = req.body;

  catalog[index] = {
    ...existing,
    title: title !== undefined ? title : existing.title,
    description: description !== undefined ? description : existing.description,
    version: version !== undefined ? version : existing.version,
    iconCategory: iconCategory !== undefined ? iconCategory : existing.iconCategory,
    changelog: changelog !== undefined ? changelog : existing.changelog,
    javaVersion: javaVersion !== undefined ? javaVersion : existing.javaVersion,
    mainClass: mainClass !== undefined ? mainClass : existing.mainClass,
  };

  writeCatalog(catalog);
  const { filePath, ...clientJar } = catalog[index];
  res.json(clientJar);
});

// Delete .jar file (Admin only)
app.delete('/api/jars/:id', requireAdmin, (req, res) => {
  const catalog = readCatalog();
  const target = catalog.find((j) => j.id === req.params.id);
  if (!target) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Delete physical file
  if (fs.existsSync(target.filePath)) {
    try {
      fs.unlinkSync(target.filePath);
    } catch (err) {
      console.error('Failed to unlink file:', err);
    }
  }

  const updated = catalog.filter((j) => j.id !== req.params.id);
  writeCatalog(updated);
  res.json({ success: true, message: 'File deleted' });
});

// ==========================================
// VITE / STATIC MIDDLEWARE
// ==========================================

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
    // Express v4 wildcard route
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
