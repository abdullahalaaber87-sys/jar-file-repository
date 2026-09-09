import React from 'react';
import {
  Server,
  Cpu,
  Wrench,
  BookOpen,
  Layers,
  Network,
  FileCode,
  Archive,
  Binary,
  FileText,
  Image as ImageIcon,
  File,
} from 'lucide-react';
import { JarFile } from '../types';

interface JarIconProps {
  jar: JarFile;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const JarIcon: React.FC<JarIconProps> = ({ jar, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-sm',
    md: 'w-11 h-11 rounded-xl text-base',
    lg: 'w-14 h-14 rounded-2xl text-xl',
    xl: 'w-20 h-20 rounded-2xl text-2xl',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  }[size];

  if (jar.iconUrl) {
    return (
      <div
        className={`${sizeClasses} overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0 flex items-center justify-center`}
      >
        <img
          src={jar.iconUrl}
          alt={jar.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Detect category from category field or file extension
  const ext = (jar.fileExtension || jar.fileName.split('.').pop() || '').toLowerCase();
  const cat = jar.iconCategory || (
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso'].includes(ext) ? 'archive' :
    ['exe', 'msi', 'apk', 'app', 'deb', 'bin'].includes(ext) ? 'executable' :
    ['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext) ? 'document' :
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp4', 'mp3', 'wav'].includes(ext) ? 'media' :
    ['json', 'yml', 'yaml', 'xml', 'cfg', 'properties', 'toml', 'sh', 'py'].includes(ext) ? 'code' :
    'tool'
  );

  // Category based styling
  const categoryConfig: Record<
    string,
    { icon: React.ReactNode; bg: string; border: string; text: string }
  > = {
    archive: {
      icon: <Archive className={iconSizes} />,
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
    },
    executable: {
      icon: <Binary className={iconSizes} />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
    },
    document: {
      icon: <FileText className={iconSizes} />,
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      text: 'text-sky-400',
    },
    media: {
      icon: <ImageIcon className={iconSizes} />,
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      text: 'text-pink-400',
    },
    code: {
      icon: <FileCode className={iconSizes} />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
    },
    server: {
      icon: <Server className={iconSizes} />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
    },
    plugin: {
      icon: <Layers className={iconSizes} />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
    },
    tool: {
      icon: <Cpu className={iconSizes} />,
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
    },
    utility: {
      icon: <Wrench className={iconSizes} />,
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
    },
    library: {
      icon: <BookOpen className={iconSizes} />,
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      text: 'text-violet-400',
    },
    network: {
      icon: <Network className={iconSizes} />,
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      text: 'text-sky-400',
    },
    other: {
      icon: <File className={iconSizes} />,
      bg: 'bg-neutral-800/60',
      border: 'border-neutral-700/60',
      text: 'text-neutral-300',
    },
  };

  const config = categoryConfig[cat] || {
    icon: <File className={iconSizes} />,
    bg: 'bg-neutral-800/60',
    border: 'border-neutral-700/60',
    text: 'text-neutral-300',
  };

  return (
    <div
      className={`${sizeClasses} ${config.bg} ${config.border} ${config.text} border shrink-0 flex items-center justify-center font-medium shadow-inner`}
    >
      {config.icon}
    </div>
  );
};
