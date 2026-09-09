import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UploadCloud,
  FileCode,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Save,
  Layers,
  Server,
  Cpu,
  Wrench,
  BookOpen,
  Network,
  Archive,
  FileText,
  Binary,
  FolderArchive,
  File,
} from 'lucide-react';
import { JarFile } from '../types';
import {
  formatBytes,
  computeFileSHA256,
  inspectJarManifest,
} from '../utils/jarGenerator';

interface AdminManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jar: JarFile, fileBlob?: Blob) => Promise<void>;
  editTarget: JarFile | null;
}

export const AdminManageModal: React.FC<AdminManageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editTarget,
}) => {
  const isEditMode = Boolean(editTarget);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(1048576); // default 1MB for edits
  const [changelog, setChangelog] = useState('');
  const [javaVersion, setJavaVersion] = useState('Java 17+');
  const [mainClass, setMainClass] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [iconCategory, setIconCategory] = useState<string>('tool');
  const [iconMode, setIconMode] = useState<'preset' | 'url' | 'upload'>('preset');

  // Validation & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form when modal opens or target changes
  useEffect(() => {
    if (editTarget) {
      setFileName(editTarget.fileName);
      setTitle(editTarget.title);
      setVersion(editTarget.version);
      setDescription(editTarget.description);
      setFileSizeBytes(editTarget.fileSizeBytes);
      setChangelog(editTarget.changelog || '');
      setJavaVersion(editTarget.javaVersion || 'Java 17+');
      setMainClass(editTarget.mainClass || '');
      setIconUrl(editTarget.iconUrl || '');
      setIconCategory(editTarget.iconCategory || 'tool');
      setIconMode(editTarget.iconUrl ? 'url' : 'preset');
      setSelectedFile(null);
      setErrorMessage(null);
    } else {
      // Reset for new creation
      setFileName('');
      setTitle('');
      setVersion('');
      setDescription('');
      setFileSizeBytes(0);
      setChangelog('');
      setJavaVersion('Java 17+');
      setMainClass('');
      setIconUrl('');
      setIconCategory('tool');
      setIconMode('preset');
      setSelectedFile(null);
      setErrorMessage(null);
    }
  }, [editTarget, isOpen]);

  if (!isOpen) return null;

  // Process selected file (any format allowed)
  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);

    setSelectedFile(file);
    setFileName(file.name);
    setFileSizeBytes(file.size);

    const extMatch = file.name.match(/\.([^.]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';

    // Auto-select category based on file extension
    if (['jar', 'war', 'ear'].includes(ext)) {
      setIconCategory('tool');
    } else if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso'].includes(ext)) {
      setIconCategory('archive');
    } else if (['exe', 'msi', 'apk', 'app', 'deb', 'rpm', 'bin'].includes(ext)) {
      setIconCategory('executable');
    } else if (['pdf', 'doc', 'docx', 'txt', 'md', 'epub'].includes(ext)) {
      setIconCategory('document');
    } else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp4', 'mp3', 'wav'].includes(ext)) {
      setIconCategory('media');
    } else if (['json', 'yml', 'yaml', 'xml', 'cfg', 'properties', 'toml', 'sh', 'py', 'js', 'ts'].includes(ext)) {
      setIconCategory('code');
    } else {
      setIconCategory('other');
    }

    // Auto-derive suggested title and version if empty
    if (!title) {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const cleanTitle = baseName
        .split(/[-_]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      setTitle(cleanTitle);
    }

    if (!version) {
      // Try to find semantic version pattern
      const verMatch = file.name.match(/(\d+\.\d+(\.\d+)?(-[a-zA-Z0-9]+)?)/);
      if (verMatch) {
        setVersion(`v${verMatch[0]}`);
      } else {
        setVersion('v1.0.0');
      }
    }

    // Attempt to inspect MANIFEST.MF if it's a jar/zip archive
    if (ext === 'jar' || ext === 'zip') {
      try {
        const manifest = await inspectJarManifest(file);
        if (manifest.mainClass && !mainClass) {
          setMainClass(manifest.mainClass);
        }
        if (manifest.version && !version) {
          setVersion(manifest.version.startsWith('v') ? manifest.version : `v${manifest.version}`);
        }
        if (manifest.title && !title) {
          setTitle(manifest.title);
        }
      } catch {
        // Non-critical if manifest reading fails
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPEG, WebP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIconUrl(reader.result as string);
      setIconMode('upload');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!isEditMode && !selectedFile && !fileName) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    const cleanFileName = (fileName || selectedFile?.name || '').trim();
    if (!cleanFileName) {
      setErrorMessage('A valid file name is required.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Custom title is required.');
      return;
    }

    if (!version.trim()) {
      setErrorMessage('Version is required (e.g., v1.0.0).');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Description is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      let sha256 = editTarget?.sha256Checksum;
      if (selectedFile) {
        sha256 = await computeFileSHA256(selectedFile);
      } else if (!sha256) {
        sha256 = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }

      const extMatch = cleanFileName.match(/\.([^.]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : 'file';

      const jarData: JarFile = {
        id: editTarget ? editTarget.id : `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        fileName: cleanFileName,
        title: title.trim(),
        version: version.trim(),
        description: description.trim(),
        fileSizeBytes: selectedFile ? selectedFile.size : fileSizeBytes,
        uploadDate: editTarget ? editTarget.uploadDate : new Date().toISOString(),
        downloadCount: editTarget ? editTarget.downloadCount : 0,
        changelog: changelog.trim() || undefined,
        fileExtension: ext,
        javaVersion: ext === 'jar' ? (javaVersion || 'Java 17+') : undefined,
        mainClass: mainClass.trim() || undefined,
        sha256Checksum: sha256,
        iconUrl: iconMode === 'preset' ? undefined : iconUrl || undefined,
        iconCategory: iconCategory as any,
        isCustomUpload: selectedFile ? true : editTarget?.isCustomUpload,
      };

      await onSave(jarData, selectedFile || undefined);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while saving the file.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="admin-manage-backdrop"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="admin-manage-modal"
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl shadow-black overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-100">
                  {isEditMode ? 'Edit File Details' : 'Add New File'}
                </h2>
                <p className="text-xs text-neutral-400">
                  {isEditMode
                    ? 'Update metadata and configuration for this file'
                    : 'Owner repository management — upload any file format for public download'}
                </p>
              </div>
            </div>

            <button
              id="btn-close-admin-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Error banner */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-200 text-xs leading-relaxed animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* File Drop Area (Only needed in Add mode or optional file replacement) */}
            {!isEditMode && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Select File <span className="text-amber-400">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
                    selectedFile
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : isDragging
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-neutral-700/80 hover:border-amber-500/40 bg-neutral-950/50 hover:bg-neutral-950'
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="font-mono text-sm font-semibold text-emerald-300">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-neutral-400 font-mono">
                        {formatBytes(selectedFile.size)} • Ready to host
                      </div>
                      <span className="text-[11px] text-amber-400 hover:underline mt-1">
                        Click or drop to replace file
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-medium text-neutral-200">
                        Click to choose any file or drag & drop here
                      </div>
                      <div className="text-xs text-neutral-400 flex flex-wrap items-center justify-center gap-1.5 font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Any file format supported
                        </span>
                        <span>(.jar, .zip, .exe, .apk, .pdf, media, configs, etc.)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* In Edit mode, show current file badge */}
            {isEditMode && (
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-xs text-neutral-300 font-semibold">{fileName}</span>
                </div>
                <span className="font-mono text-xs text-neutral-500">{formatBytes(fileSizeBytes)}</span>
              </div>
            )}

            {/* Title and Version Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Custom Title <span className="text-amber-400">*</span>
                </label>
                <input
                  id="input-jar-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Velocity High-Performance Proxy"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Version <span className="text-amber-400">*</span>
                </label>
                <input
                  id="input-jar-version"
                  type="text"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. v2.1.0"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Description <span className="text-amber-400">*</span>
              </label>
              <textarea
                id="input-jar-description"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a clear summary of what this .jar file contains and its intended application..."
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 resize-none leading-relaxed"
              />
            </div>

            {/* Optional Icon / Image Setting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-300">
                  Optional Icon / Image
                </label>
                <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setIconMode('preset')}
                    className={`px-2 py-0.5 rounded ${
                      iconMode === 'preset' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400'
                    }`}
                  >
                    Preset Icon
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconMode('url')}
                    className={`px-2 py-0.5 rounded ${
                      iconMode === 'url' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400'
                    }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIconMode('upload');
                      iconInputRef.current?.click();
                    }}
                    className={`px-2 py-0.5 rounded ${
                      iconMode === 'upload' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400'
                    }`}
                  >
                    Upload Image
                  </button>
                </div>
              </div>

              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {iconMode === 'preset' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'archive', label: 'Archive / Zip', icon: Archive },
                    { key: 'executable', label: 'Executable / App', icon: Binary },
                    { key: 'tool', label: 'Tool / Mod', icon: Cpu },
                    { key: 'document', label: 'Document / Text', icon: FileText },
                    { key: 'media', label: 'Media / Asset', icon: ImageIcon },
                    { key: 'code', label: 'Code / Config', icon: FileCode },
                    { key: 'server', label: 'Server Core', icon: Server },
                    { key: 'other', label: 'General File', icon: File },
                  ].map(({ key, label, icon: IconComponent }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setIconCategory(key)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                        iconCategory === key
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                          : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mb-1" />
                      <span className="text-[11px] truncate max-w-full">{label}</span>
                    </button>
                  ))}
                </div>
              )}

              {(iconMode === 'url' || iconMode === 'upload') && (
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={iconUrl}
                      onChange={(e) => setIconUrl(e.target.value)}
                      placeholder="https://example.com/logo.png (or use Upload Image)"
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  {iconUrl && (
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0">
                      <img
                        src={iconUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Advanced / Optional Metadata: Runtime Target, Main-Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800/80">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Target Java Runtime (Optional)
                </label>
                <select
                  value={javaVersion}
                  onChange={(e) => setJavaVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="Java 8+">Java 8+ (Legacy & Universal)</option>
                  <option value="Java 11+">Java 11+ (LTS)</option>
                  <option value="Java 17+">Java 17+ (Modern LTS)</option>
                  <option value="Java 21+">Java 21+ (Current LTS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Main-Class (Optional)
                </label>
                <input
                  type="text"
                  value={mainClass}
                  onChange={(e) => setMainClass(e.target.value)}
                  placeholder="e.g. org.company.Launcher"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {/* Optional Changelog */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Optional Changelog (Release Notes)
              </label>
              <textarea
                rows={3}
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="* Added new command syntax&#10;* Fixed memory leak during execution&#10;* Updated native libraries"
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none leading-relaxed"
              />
            </div>
          </form>

          {/* Footer Controls */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-2 transition-colors"
            >
              Cancel
            </button>

            <button
              id="btn-submit-jar-form"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isEditMode ? 'Update File Details' : 'Add File to Repository'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
