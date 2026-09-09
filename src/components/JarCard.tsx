import React, { useState } from 'react';
import { Download, Calendar, HardDrive, Edit3, Trash2, Check } from 'lucide-react';
import { JarFile } from '../types';
import { formatBytes, formatDate } from '../utils/jarGenerator';
import { JarIcon } from './JarIcon';

interface JarCardProps {
  jar: JarFile;
  isAdmin?: boolean;
  onOpenDetail: (jar: JarFile) => void;
  onDownload: (jar: JarFile) => Promise<void>;
  onEdit: (jar: JarFile) => void;
  onDelete: (jar: JarFile) => void;
}

export const JarCard: React.FC<JarCardProps> = ({
  jar,
  isAdmin = false,
  onOpenDetail,
  onDownload,
  onEdit,
  onDelete,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [justDownloaded, setJustDownloaded] = useState(false);

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    try {
      setDownloading(true);
      await onDownload(jar);
      setJustDownloaded(true);
      setTimeout(() => setJustDownloaded(false), 2000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      id={`jar-card-${jar.id}`}
      onClick={() => onOpenDetail(jar)}
      className="group relative flex flex-col justify-between p-5 bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800/80 hover:border-amber-500/40 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5"
    >
      {/* Top row: Icon, Title, and Action buttons */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <JarIcon jar={jar} size="md" />
            <div className="min-w-0">
              <h3 className="font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors text-base line-clamp-1">
                {jar.title}
              </h3>
              {/* Monospace file name with .jar accent */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs text-neutral-400 truncate max-w-[200px]">
                  {jar.fileName}
                </span>
              </div>
            </div>
          </div>

          {/* Edit / Delete quick buttons (Admin only) */}
          {isAdmin && (
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-neutral-950/80 rounded-lg p-1 border border-neutral-800 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id={`btn-edit-card-${jar.id}`}
                onClick={() => onEdit(jar)}
                title="Edit file details"
                className="p-1 text-neutral-400 hover:text-amber-400 rounded transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                id={`btn-delete-card-${jar.id}`}
                onClick={() => onDelete(jar)}
                title="Delete file"
                className="p-1 text-neutral-400 hover:text-rose-400 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
          {jar.description}
        </p>
      </div>

      {/* Card Footer: Metadata badges + Download button */}
      <div className="pt-3 border-t border-neutral-800/80 space-y-3">
        {/* Version & Size tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-200 border border-neutral-700/60 text-[11px]">
              {jar.version}
            </span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
              {jar.fileExtension || jar.fileName.split('.').pop() || 'FILE'}
            </span>
            {jar.javaVersion && (
              <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
                {jar.javaVersion}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-300">
            <HardDrive className="w-3.5 h-3.5 text-neutral-500" />
            <span>{formatBytes(jar.fileSizeBytes)}</span>
          </div>
        </div>

        {/* Upload Date & Download Button */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Calendar className="w-3 h-3 text-neutral-600" />
            <span>{formatDate(jar.uploadDate)}</span>
          </div>

          <button
            id={`btn-download-card-${jar.id}`}
            onClick={handleDownloadClick}
            disabled={downloading}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
              justDownloaded
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-neutral-800 hover:bg-amber-500 text-neutral-200 hover:text-neutral-950 border border-neutral-700/70 hover:border-amber-500'
            }`}
          >
            {justDownloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded</span>
              </>
            ) : downloading ? (
              <>
                <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
