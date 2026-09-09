import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Calendar,
  HardDrive,
  Check,
  Copy,
  Terminal,
  ShieldCheck,
  FileCode,
  Edit3,
  Trash2,
  Cpu,
  Layers,
} from 'lucide-react';
import { JarFile } from '../types';
import { formatBytes, formatDate } from '../utils/jarGenerator';
import { JarIcon } from './JarIcon';

interface JarDetailModalProps {
  jar: JarFile | null;
  isAdmin?: boolean;
  onClose: () => void;
  onDownload: (jar: JarFile) => Promise<void>;
  onEdit: (jar: JarFile) => void;
  onDelete: (jar: JarFile) => void;
}

export const JarDetailModal: React.FC<JarDetailModalProps> = ({
  jar,
  isAdmin = false,
  onClose,
  onDownload,
  onEdit,
  onDelete,
}) => {
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [justDownloaded, setJustDownloaded] = useState(false);

  if (!jar) return null;

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      await onDownload(jar);
      setJustDownloaded(true);
      setTimeout(() => setJustDownloaded(false), 2500);
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'sha' | 'cmd') => {
    navigator.clipboard.writeText(text);
    if (type === 'sha') {
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2000);
    } else {
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  };

  const isJar = jar.fileName.toLowerCase().endsWith('.jar');
  const fileExt = (jar.fileExtension || jar.fileName.split('.').pop() || 'file').toUpperCase();
  const runCommand = `java -jar ${jar.fileName}`;

  return (
    <AnimatePresence>
      <div
        id="jar-detail-backdrop"
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="jar-detail-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-black overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 bg-neutral-950/50 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <JarIcon jar={jar} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-neutral-100">{jar.title}</h2>
                  <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {jar.version}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {fileExt}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <FileCode className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-amber-200/90">{jar.fileName}</span>
                </div>
              </div>
            </div>

            <button
              id="btn-close-detail-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Primary Action & Key Specs Banner */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-6 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px] mb-0.5">File Size</span>
                  <div className="flex items-center gap-1.5 font-mono text-neutral-200 font-semibold">
                    <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{formatBytes(jar.fileSizeBytes)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px] mb-0.5">Upload Date</span>
                  <div className="flex items-center gap-1.5 text-neutral-200">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{formatDate(jar.uploadDate)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px] mb-0.5">Target Runtime</span>
                  <div className="flex items-center gap-1.5 text-neutral-200 font-mono">
                    <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{jar.javaVersion || 'Java 17+'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px] mb-0.5">Downloads</span>
                  <span className="text-neutral-200 font-mono">
                    {(jar.downloadCount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Main Download Button */}
              <button
                id="btn-detail-download-jar"
                onClick={handleDownload}
                disabled={downloading}
                className={`flex items-center justify-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer shadow-lg ${
                  justDownloaded
                    ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/20 active:scale-95'
                }`}
              >
                {justDownloaded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Download Started!</span>
                  </>
                ) : downloading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Download {fileExt} File</span>
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Description
              </h4>
              <div className="text-sm text-neutral-200 leading-relaxed bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/60 whitespace-pre-line">
                {jar.description}
              </div>
            </div>

            {/* Execution Snippet for JARs */}
            {isJar && (
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Quick Run Command</span>
                </h4>
                <div className="flex items-center justify-between gap-3 p-3 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-xs text-neutral-200">
                  <span className="truncate text-amber-300/90">{runCommand}</span>
                  <button
                    id="btn-copy-command"
                    onClick={() => copyToClipboard(runCommand, 'cmd')}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-100 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800 transition-colors"
                  >
                    {copiedCommand ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Optional Changelog */}
            {jar.changelog && (
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Version Changelog</span>
                </h4>
                <div className="text-xs font-mono text-neutral-300 leading-relaxed bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/80 whitespace-pre-line max-h-48 overflow-y-auto">
                  {jar.changelog}
                </div>
              </div>
            )}

            {/* Technical Verification (SHA-256 & Main-Class) */}
            <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/60 space-y-2 text-xs">
              {jar.mainClass && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-neutral-500">Main-Class:</span>
                  <span className="font-mono text-neutral-300">{jar.mainClass}</span>
                </div>
              )}
              {jar.sha256Checksum && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-850">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
                    <span>SHA-256 Checksum:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-neutral-400 max-w-[240px] truncate">
                      {jar.sha256Checksum}
                    </span>
                    <button
                      id="btn-copy-sha256"
                      onClick={() => copyToClipboard(jar.sha256Checksum!, 'sha')}
                      className="text-neutral-400 hover:text-neutral-200 p-1 rounded hover:bg-neutral-800"
                      title="Copy SHA-256"
                    >
                      {copiedSha ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-between gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  id="btn-modal-edit-jar"
                  onClick={() => {
                    onClose();
                    onEdit(jar);
                  }}
                  className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-amber-400 bg-neutral-800/80 hover:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-700 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
                <button
                  id="btn-modal-delete-jar"
                  onClick={() => {
                    onClose();
                    onDelete(jar);
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/50 px-3 py-1.5 rounded-lg border border-rose-800/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            ) : (
              <div className="text-[11px] text-neutral-500 font-mono">
                Direct Download Archive • Verified .jar
              </div>
            )}

            <button
              id="btn-close-detail-footer"
              onClick={onClose}
              className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
