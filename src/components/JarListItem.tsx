import React, { useState } from 'react';
import { Download, Calendar, HardDrive, Edit3, Trash2, Check } from 'lucide-react';
import { JarFile } from '../types';
import { formatBytes, formatDate } from '../utils/jarGenerator';
import { JarIcon } from './JarIcon';

interface JarListItemProps {
  jar: JarFile;
  isAdmin?: boolean;
  onOpenDetail: (jar: JarFile) => void;
  onDownload: (jar: JarFile) => Promise<void>;
  onEdit: (jar: JarFile) => void;
  onDelete: (jar: JarFile) => void;
}

export const JarListItem: React.FC<JarListItemProps> = ({
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
      id={`jar-row-${jar.id}`}
      onClick={() => onOpenDetail(jar)}
      className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-neutral-900/40 hover:bg-neutral-900/90 border border-neutral-800/80 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer"
    >
      {/* Left: Icon + Title + Filename + Description */}
      <div className="flex items-start md:items-center gap-3.5 flex-1 min-w-0">
        <JarIcon jar={jar} size="sm" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors text-sm truncate">
              {jar.title}
            </h3>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
              {jar.fileExtension || jar.fileName.split('.').pop() || 'FILE'}
            </span>
            <span className="font-mono text-xs text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/50">
              {jar.fileName}
            </span>
            <span className="font-mono text-[11px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              {jar.version}
            </span>
          </div>
          <p className="text-xs text-neutral-400 truncate mt-1 max-w-2xl">
            {jar.description}
          </p>
        </div>
      </div>

      {/* Right: Metadata + Actions */}
      <div
        className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-neutral-500" />
            <span>{formatBytes(jar.fileSizeBytes)}</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-500 hidden sm:flex">
            <Calendar className="w-3.5 h-3.5 text-neutral-600" />
            <span>{formatDate(jar.uploadDate)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <>
              <button
                id={`btn-edit-row-${jar.id}`}
                onClick={() => onEdit(jar)}
                title="Edit file details"
                className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                id={`btn-delete-row-${jar.id}`}
                onClick={() => onDelete(jar)}
                title="Delete file"
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            id={`btn-download-row-${jar.id}`}
            onClick={handleDownloadClick}
            disabled={downloading}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ml-1 ${
              justDownloaded
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-neutral-800 hover:bg-amber-500 text-neutral-200 hover:text-neutral-950 border border-neutral-700 hover:border-amber-500'
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
                <span>Downloading...</span>
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
