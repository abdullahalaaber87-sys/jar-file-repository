import React, { useState } from 'react';
import { Package, Plus, HardDrive, DownloadCloud, Lock, KeyRound, ShieldCheck, Share2, Check } from 'lucide-react';
import { JarFile } from '../types';

interface NavbarProps {
  jars: JarFile[];
  isAdmin: boolean;
  onOpenAddModal: () => void;
  onOpenPasscodeModal: () => void;
  onLockAdmin: () => void;
  onCopyShareLink?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  jars,
  isAdmin,
  onOpenAddModal,
  onOpenPasscodeModal,
  onLockAdmin,
  onCopyShareLink,
}) => {
  const [copied, setCopied] = useState(false);
  const totalDownloads = jars.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  const handleCopyLink = () => {
    if (onCopyShareLink) {
      onCopyShareLink();
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header
      id="app-navbar"
      className="sticky top-0 z-30 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* App Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/5">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-100 flex items-center gap-1.5">
                File Repository
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 tracking-wide uppercase">
                Any Format
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Host, browse & download mods, tools, archives & any files
            </p>
          </div>
        </div>

        {/* Right side stats & action buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick repo counters */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-neutral-400 border border-neutral-800/80 bg-neutral-900/50 px-3 py-1.5 rounded-xl">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-neutral-500" />
              <span>{jars.length}</span>
              <span className="text-neutral-500">files</span>
            </div>
            <div className="w-px h-3.5 bg-neutral-800" />
            <div className="flex items-center gap-1.5">
              <DownloadCloud className="w-3.5 h-3.5 text-neutral-500" />
              <span>{totalDownloads.toLocaleString()}</span>
              <span className="text-neutral-500">downloads</span>
            </div>
          </div>

          {/* Share Link Button */}
          <button
            id="btn-share-repo-link"
            onClick={handleCopyLink}
            title="Copy shareable direct website link"
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-amber-300 px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-amber-500/40 bg-neutral-900/60 hover:bg-neutral-900 transition-all cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Admin Mode Controls */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              {/* Admin Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin</span>
              </div>

              {/* Passcode settings */}
              <button
                id="btn-admin-passcode-settings"
                onClick={onOpenPasscodeModal}
                title="Admin Passcode Settings"
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-neutral-400 hover:text-neutral-200 rounded-lg border border-neutral-800 hover:bg-neutral-900 transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden md:inline">Passcode</span>
              </button>

              {/* Exit Admin Button */}
              <button
                id="btn-lock-admin"
                onClick={onLockAdmin}
                title="Exit Admin Mode (Lock Controls)"
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 rounded-lg border border-rose-900/30 transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Lock</span>
              </button>

              {/* Upload File Button */}
              <button
                id="btn-add-jar-navbar"
                onClick={onOpenAddModal}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 cursor-pointer ml-1"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Upload File</span>
              </button>
            </div>
          ) : (
            /* Visitor View: Discreet Admin Unlock Button */
            <button
              id="btn-open-admin-unlock"
              onClick={onOpenPasscodeModal}
              title="Admin access (passcode required)"
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 px-2.5 py-1.5 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 hover:bg-neutral-900 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
