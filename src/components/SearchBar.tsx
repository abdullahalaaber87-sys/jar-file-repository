import React from 'react';
import { Search, X, LayoutGrid, List, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { SortOption, ViewMode } from '../types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalMatches: number;
  totalFiles: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalMatches,
  totalFiles,
}) => {
  return (
    <div id="search-filter-section" className="space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Instant Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="jar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search files by title, filename, or extension (e.g. jar, zip, exe, pdf)..."
            className="w-full pl-10 pr-10 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all font-sans"
          />
          {searchQuery && (
            <button
              id="btn-clear-search"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-200 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls: Sort and View Mode */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Selector */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-500 hidden sm:inline">Sort:</span>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest" className="bg-neutral-900 text-neutral-200">
                  Newest Uploaded
                </option>
                <option value="oldest" className="bg-neutral-900 text-neutral-200">
                  Oldest Uploaded
                </option>
                <option value="downloads" className="bg-neutral-900 text-neutral-200">
                  Most Downloads
                </option>
                <option value="size-desc" className="bg-neutral-900 text-neutral-200">
                  Largest Size
                </option>
                <option value="size-asc" className="bg-neutral-900 text-neutral-200">
                  Smallest Size
                </option>
                <option value="title-asc" className="bg-neutral-900 text-neutral-200">
                  Title (A - Z)
                </option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-0.5">
            <button
              id="view-mode-grid"
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber-500/20 text-amber-400 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-list"
              onClick={() => onViewModeChange('list')}
              title="List View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-amber-500/20 text-amber-400 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Result Counter & Active Filter Badge */}
      <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-neutral-200">{totalMatches}</strong> of{' '}
            <strong className="text-neutral-200">{totalFiles}</strong> {totalFiles === 1 ? 'file' : 'files'}
          </span>
          {searchQuery && (
            <span className="px-2 py-0.5 bg-neutral-800 rounded text-neutral-300 font-mono text-[11px]">
              Query: &quot;{searchQuery}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
          <SlidersHorizontal className="w-3 h-3" />
          <span>Instant Index Active</span>
        </div>
      </div>
    </div>
  );
};
