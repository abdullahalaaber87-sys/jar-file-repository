import { JarFile } from '../types';
import { INITIAL_JAR_FILES } from '../data/sampleJars';
import { saveJarBlob, deleteJarBlob } from './idb';

const STORAGE_KEY = 'jar_repository_catalog_v1';

export function getStoredJars(): JarFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial sample jars
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_JAR_FILES));
      return INITIAL_JAR_FILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      // Guarantee only files ending in .jar are kept
      return parsed.filter((item: JarFile) => item.fileName && item.fileName.toLowerCase().endsWith('.jar'));
    }
    return INITIAL_JAR_FILES;
  } catch (err) {
    console.error('Error reading JAR catalog from storage:', err);
    return INITIAL_JAR_FILES;
  }
}

export function saveJarsToStorage(jars: JarFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jars));
  } catch (err) {
    console.error('Error saving JAR catalog to storage:', err);
  }
}

export async function addJarToCatalog(
  jar: JarFile,
  fileBlob?: Blob
): Promise<JarFile[]> {
  if (fileBlob) {
    await saveJarBlob(jar.id, fileBlob);
  }
  const current = getStoredJars();
  const updated = [jar, ...current];
  saveJarsToStorage(updated);
  return updated;
}

export function updateJarInCatalog(updatedJar: JarFile): JarFile[] {
  const current = getStoredJars();
  const updated = current.map((item) => (item.id === updatedJar.id ? updatedJar : item));
  saveJarsToStorage(updated);
  return updated;
}

export async function deleteJarFromCatalog(id: string): Promise<JarFile[]> {
  await deleteJarBlob(id);
  const current = getStoredJars();
  const updated = current.filter((item) => item.id !== id);
  saveJarsToStorage(updated);
  return updated;
}

export function recordDownloadInCatalog(id: string): JarFile[] {
  const current = getStoredJars();
  const updated = current.map((item) => {
    if (item.id === id) {
      return { ...item, downloadCount: (item.downloadCount || 0) + 1 };
    }
    return item;
  });
  saveJarsToStorage(updated);
  return updated;
}
