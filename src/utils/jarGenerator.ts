import JSZip from 'jszip';
import { JarFile } from '../types';
import { getJarBlob } from './idb';

/**
 * Format bytes into human-readable size string (e.g., "14.2 MB", "450 KB")
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format ISO date string into friendly readable string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Download a file to the user's computer.
 * Handles server-stored files, custom client uploads, and sample archives.
 */
export async function downloadJarFile(jar: JarFile): Promise<void> {
  // First attempt direct backend download for server-stored files
  try {
    const res = await fetch(`/api/jars/${jar.id}/download`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = jar.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return;
    }
  } catch {
    // Fallback to IndexedDB / client blob
  }

  let blob: Blob | null = null;

  // Check if we have an uploaded binary in IndexedDB
  if (jar.isCustomUpload) {
    blob = await getJarBlob(jar.id);
  }

  // If no blob was found, generate appropriate archive or content
  if (!blob) {
    if (jar.fileName.toLowerCase().endsWith('.jar')) {
      blob = await generateSampleJarBlob(jar);
    } else {
      blob = new Blob(
        [
          `File: ${jar.fileName}\r\n` +
          `Title: ${jar.title}\r\n` +
          `Version: ${jar.version}\r\n` +
          `Uploaded: ${jar.uploadDate}\r\n\r\n` +
          `Description:\r\n${jar.description}\r\n`
        ],
        { type: 'application/octet-stream' }
      );
    }
  }

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = jar.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Clean up URL reference
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Generates a valid .jar file archive with real MANIFEST.MF and metadata
 */
export async function generateSampleJarBlob(jar: JarFile): Promise<Blob> {
  const zip = new JSZip();

  // Create standard Java JAR manifest
  const manifestLines = [
    'Manifest-Version: 1.0',
    `Created-By: JAR File Repository (${jar.version})`,
    `Implementation-Title: ${jar.title}`,
    `Implementation-Version: ${jar.version}`,
    `Implementation-Vendor: JAR Repository User`,
    jar.mainClass ? `Main-Class: ${jar.mainClass}` : 'Main-Class: org.repository.Application',
    'Build-Jdk-Spec: 17',
    '',
  ];

  zip.file('META-INF/MANIFEST.MF', manifestLines.join('\r\n'));

  // Add a repository README descriptor inside the jar
  const readmeContent = `# ${jar.title}
Version: ${jar.version}
File Name: ${jar.fileName}
Java Target: ${jar.javaVersion || 'Java 17+'}
Created: ${jar.uploadDate}

Description:
${jar.description}

Changelog:
${jar.changelog || 'Initial release.'}
`;
  zip.file('META-INF/REPOSITORY_INFO.txt', readmeContent);

  // Add dummy compiled-like Java stub package
  zip.file(
    'org/repository/Application.class',
    new Uint8Array([0xca, 0xfe, 0xba, 0xbe, 0x00, 0x00, 0x00, 0x3d, 0x00, 0x05, 0x01, 0x00, 0x07, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e])
  );

  const content = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/java-archive',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return content;
}

/**
 * Generate a SHA-256 hex string for a file
 */
export async function computeFileSHA256(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('SHA-256 calculation error:', err);
    return 'sha256-' + Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Try to inspect an uploaded .jar (ZIP archive) to extract manifest info
 */
export async function inspectJarManifest(
  file: File
): Promise<{ mainClass?: string; version?: string; title?: string }> {
  try {
    const zip = await JSZip.loadAsync(file);
    const manifestFile = zip.file('META-INF/MANIFEST.MF');
    if (!manifestFile) return {};

    const manifestText = await manifestFile.async('text');
    const result: { mainClass?: string; version?: string; title?: string } = {};

    const lines = manifestText.split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith('Main-Class:')) {
        result.mainClass = line.replace('Main-Class:', '').trim();
      } else if (line.startsWith('Implementation-Version:')) {
        result.version = line.replace('Implementation-Version:', '').trim();
      } else if (line.startsWith('Implementation-Title:')) {
        result.title = line.replace('Implementation-Title:', '').trim();
      }
    }

    return result;
  } catch {
    return {};
  }
}
