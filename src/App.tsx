/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { JarFile, SortOption, ViewMode, ToastMessage } from './types';
import {
  fetchJars,
  uploadJar,
  updateJar,
  deleteJar,
  triggerJarDownload,
} from './utils/api';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { JarCard } from './components/JarCard';
import { JarListItem } from './components/JarListItem';
import { JarDetailModal } from './components/JarDetailModal';
import { AdminManageModal } from './components/AdminManageModal';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EmptyState } from './components/EmptyState';
import { ToastContainer } from './components/Toast';
import { Terminal, ArrowDown } from 'lucide-react';
import {
  getIsAdminActive,
  setIsAdminActive,
  getActiveAdminPasscode,
} from './utils/adminAuth';

export default function App() {
  // State
  const [jars, setJars] = useState<JarFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Modals
  const [selectedJarForDetail, setSelectedJarForDetail] = useState<JarFile | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [jarToEdit, setJarToEdit] = useState<JarFile | null>(null);
  const [jarToDelete, setJarToDelete] = useState<JarFile | null>(null);

  // Private Admin Mode (no accounts/sign-in, passcode only)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => getIsAdminActive());

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A) to toggle admin passcode modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsPasscodeModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch real catalog from server on mount
  const refreshCatalog = async () => {
    try {
      setIsLoadingCatalog(true);
      const list = await fetchJars();
      setJars(list);
    } catch (err) {
      console.error('Failed to load jars:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  // Filter & Sort Logic
  const filteredAndSortedJars = useMemo(() => {
    // Strictly ensure only .jar files are presented
    let result = jars.filter((jar) => jar.fileName && jar.fileName.toLowerCase().endsWith('.jar'));

    // Category Filter
    if (activeCategory !== 'all') {
      result = result.filter((jar) => jar.iconCategory === activeCategory);
    }

    // Search Query (title or fileName)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (jar) =>
          jar.title.toLowerCase().includes(q) ||
          jar.fileName.toLowerCase().includes(q) ||
          jar.description.toLowerCase().includes(q)
      );
    }

    // Sort Logic
    return [...result].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'oldest':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'downloads':
          return (b.downloadCount || 0) - (a.downloadCount || 0);
        case 'size-desc':
          return b.fileSizeBytes - a.fileSizeBytes;
        case 'size-asc':
          return a.fileSizeBytes - b.fileSizeBytes;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [jars, searchQuery, sortOption, activeCategory]);

  // Handlers
  const handleDownload = (jar: JarFile) => {
    try {
      triggerJarDownload(jar.id, jar.fileName);

      // Optimistically increment download count
      setJars((prev) =>
        prev.map((j) => (j.id === jar.id ? { ...j, downloadCount: (j.downloadCount || 0) + 1 } : j))
      );

      if (selectedJarForDetail && selectedJarForDetail.id === jar.id) {
        setSelectedJarForDetail((prev) =>
          prev ? { ...prev, downloadCount: (prev.downloadCount || 0) + 1 } : null
        );
      }

      addToast(
        'success',
        'Download Started',
        `Downloading "${jar.fileName}" (${(jar.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)`
      );
    } catch (err: unknown) {
      console.error('Download error:', err);
      addToast(
        'error',
        'Download Failed',
        err instanceof Error ? err.message : 'Could not download the requested .jar file.'
      );
    }
  };

  const handleUnlockAdmin = () => {
    setIsAdmin(true);
    setIsAdminActive(true);
    addToast('success', 'Admin Controls Unlocked', 'You can now add, edit, and delete .jar files.');
  };

  const handleLockAdmin = () => {
    setIsAdmin(false);
    setIsAdminActive(false);
    addToast('info', 'Admin Locked', 'Management controls are now hidden from visitors.');
  };

  const handlePasscodeChanged = () => {
    addToast('success', 'Passcode Updated', 'Your new private passcode has been saved.');
  };

  const handleSaveJar = async (jar: JarFile, fileBlob?: Blob) => {
    if (!isAdmin) {
      setIsPasscodeModalOpen(true);
      return;
    }
    const passcode = getActiveAdminPasscode();
    try {
      if (jarToEdit) {
        // Edit existing metadata
        const updated = await updateJar(
          jar.id,
          {
            title: jar.title,
            description: jar.description,
            version: jar.version,
            iconCategory: jar.iconCategory,
            changelog: jar.changelog,
            javaVersion: jar.javaVersion,
            mainClass: jar.mainClass,
          },
          passcode
        );

        setJars((prev) => prev.map((j) => (j.id === jar.id ? updated : j)));
        if (selectedJarForDetail && selectedJarForDetail.id === jar.id) {
          setSelectedJarForDetail(updated);
        }
        addToast('success', 'File Updated', `Updated details for "${jar.title}"`);
      } else {
        // Upload new real .jar file to server
        if (!fileBlob) {
          throw new Error('Please select a .jar file to upload.');
        }
        const created = await uploadJar(
          fileBlob as File,
          {
            title: jar.title,
            description: jar.description,
            version: jar.version,
            iconCategory: jar.iconCategory,
            javaVersion: jar.javaVersion,
            mainClass: jar.mainClass,
            changelog: jar.changelog,
          },
          passcode
        );

        setJars((prev) => [created, ...prev]);
        addToast('success', '.JAR File Uploaded', `"${jar.fileName}" is now live and downloadable by all visitors.`);
      }
      setIsManageModalOpen(false);
      setJarToEdit(null);
    } catch (err: unknown) {
      console.error('Save error:', err);
      addToast(
        'error',
        'Save Failed',
        err instanceof Error ? err.message : 'Could not save the .jar file to server.'
      );
    }
  };

  const handleDeleteJar = async (id: string) => {
    if (!isAdmin) {
      setIsPasscodeModalOpen(true);
      return;
    }
    const passcode = getActiveAdminPasscode();
    try {
      const target = jars.find((j) => j.id === id);
      await deleteJar(id, passcode);
      setJars((prev) => prev.filter((j) => j.id !== id));
      if (selectedJarForDetail && selectedJarForDetail.id === id) {
        setSelectedJarForDetail(null);
      }
      addToast('info', 'File Deleted', `Removed "${target?.fileName || 'file'}" from server storage.`);
    } catch (err: unknown) {
      console.error('Delete error:', err);
      addToast('error', 'Delete Failed', 'Could not delete the file from the server.');
    }
  };

  const openAddModal = () => {
    if (!isAdmin) {
      setIsPasscodeModalOpen(true);
      return;
    }
    setJarToEdit(null);
    setIsManageModalOpen(true);
  };

  const openEditModal = (jar: JarFile) => {
    if (!isAdmin) {
      setIsPasscodeModalOpen(true);
      return;
    }
    setJarToEdit(jar);
    setIsManageModalOpen(true);
  };

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    addToast('success', 'Link Copied', 'Direct website link copied to clipboard. Send it to anyone!');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar
        jars={jars}
        isAdmin={isAdmin}
        onOpenAddModal={openAddModal}
        onOpenPasscodeModal={() => setIsPasscodeModalOpen(true)}
        onLockAdmin={handleLockAdmin}
        onCopyShareLink={handleCopyShareLink}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Hero Notice Banner */}
        <section
          id="repo-header-banner"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-900/60 border border-neutral-800/80 p-6 sm:p-7 shadow-xl shadow-black/20"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium">
                <Terminal className="w-3.5 h-3.5" />
                <span>File Distribution & Direct Host</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
                Direct File Repository
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                A clean, fast repository for hosting, indexing, and downloading mods, archives, executables, and any custom files. Anyone can browse and download; the owner can manage and upload any file format.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {isAdmin ? (
                <button
                  id="btn-hero-add-jar"
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
                >
                  <span>Upload File</span>
                </button>
              ) : (
                <button
                  id="btn-hero-browse-archives"
                  onClick={() => {
                    document.getElementById('jar-files-display-container')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-neutral-700 transition-all cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4 text-amber-400" />
                  <span>Browse Repository Files</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Category Pills & Quick Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All .JAR Files' },
            { id: 'server', label: 'Servers' },
            { id: 'plugin', label: 'Plugins' },
            { id: 'tool', label: 'Profilers & Tools' },
            { id: 'library', label: 'Libraries' },
            { id: 'network', label: 'Network & Proxies' },
            { id: 'utility', label: 'CLI Utilities' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search, Filter & View Mode Controls */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalMatches={filteredAndSortedJars.length}
          totalFiles={jars.length}
        />

        {/* File Cards Section */}
        <section id="jar-files-display-container">
          {isLoadingCatalog ? (
            <div className="flex flex-col items-center justify-center p-12 text-neutral-400 gap-3">
              <span className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Loading repository...</span>
            </div>
          ) : filteredAndSortedJars.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredAndSortedJars.map((jar) => (
                  <JarCard
                    key={jar.id}
                    jar={jar}
                    isAdmin={isAdmin}
                    onOpenDetail={setSelectedJarForDetail}
                    onDownload={handleDownload}
                    onEdit={openEditModal}
                    onDelete={setJarToDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredAndSortedJars.map((jar) => (
                  <JarListItem
                    key={jar.id}
                    jar={jar}
                    isAdmin={isAdmin}
                    onOpenDetail={setSelectedJarForDetail}
                    onDownload={handleDownload}
                    onEdit={openEditModal}
                    onDelete={setJarToDelete}
                  />
                ))}
              </div>
            )
          ) : (
            <EmptyState
              isSearchEmpty={Boolean(searchQuery.trim()) || activeCategory !== 'all'}
              isAdmin={isAdmin}
              searchQuery={searchQuery}
              onClearSearch={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              onOpenAddModal={openAddModal}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/60 py-6 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Public File Repository</span>
            <span>•</span>
            <span className="font-mono text-neutral-400">Direct File Distribution & Hosting</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-neutral-500">
            {isAdmin ? (
              <span className="text-amber-400 font-mono flex items-center gap-1">
                Admin controls active
              </span>
            ) : (
              <span>Visitor view</span>
            )}
            <span>•</span>
            <button
              id="btn-footer-admin-toggle"
              onClick={() => setIsPasscodeModalOpen(true)}
              className="text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              {isAdmin ? 'Admin Settings' : 'Admin Passcode'}
            </button>
          </div>
        </div>
      </footer>

      {/* Detailed File Page (Modal) */}
      <JarDetailModal
        jar={selectedJarForDetail}
        isAdmin={isAdmin}
        onClose={() => setSelectedJarForDetail(null)}
        onDownload={handleDownload}
        onEdit={openEditModal}
        onDelete={setJarToDelete}
      />

      {/* Admin Passcode Modal (Unlock / Change Passcode) */}
      <AdminPasscodeModal
        isOpen={isPasscodeModalOpen}
        isAdmin={isAdmin}
        onClose={() => setIsPasscodeModalOpen(false)}
        onUnlockSuccess={handleUnlockAdmin}
        onLock={handleLockAdmin}
        onPasscodeChanged={handlePasscodeChanged}
      />

      {/* Admin / Local Management Modal (Add or Edit) */}
      <AdminManageModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setJarToEdit(null);
        }}
        onSave={handleSaveJar}
        editTarget={jarToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        jar={jarToDelete}
        onClose={() => setJarToDelete(null)}
        onConfirm={handleDeleteJar}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
