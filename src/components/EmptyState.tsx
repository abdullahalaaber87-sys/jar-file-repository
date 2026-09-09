import React from 'react';
import { PackageSearch, FileQuestion, Plus } from 'lucide-react';

interface EmptyStateProps {
  isSearchEmpty: boolean;
  isAdmin?: boolean;
  searchQuery?: string;
  onClearSearch: () => void;
  onOpenAddModal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearchEmpty,
  isAdmin = false,
  searchQuery,
  onClearSearch,
  onOpenAddModal,
}) => {
  if (isSearchEmpty) {
    return (
      <div
        id="empty-search-state"
        className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-neutral-800/80 bg-neutral-900/30 my-8"
      >
        <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-neutral-400 mb-4">
          <PackageSearch className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-neutral-200 mb-1">
          No files found
        </h3>
        <p className="text-xs text-neutral-400 max-w-sm mb-5 leading-relaxed">
          We couldn&apos;t find any files matching &ldquo;{searchQuery}&rdquo;. Try checking for typos or searching by filename.
        </p>
        <button
          id="btn-clear-search-empty"
          onClick={onClearSearch}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
        >
          Clear Search Query
        </button>
      </div>
    );
  }

  return (
    <div
      id="empty-repository-state"
      className="flex flex-col items-center justify-center p-14 text-center rounded-2xl border border-neutral-800/80 bg-neutral-900/40 my-8"
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
        <FileQuestion className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-neutral-100 mb-1">
        Repository is currently empty
      </h3>
      <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
        {isAdmin
          ? 'There are no files hosted in your repository yet. Click below to upload your first file for visitors to download.'
          : 'There are no files currently available for download. Please check back soon.'}
      </p>
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="btn-add-first-jar"
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload File</span>
          </button>
        </div>
      )}
    </div>
  );
};
