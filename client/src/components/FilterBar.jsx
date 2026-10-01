import React from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, Clock, Search, X } from 'lucide-react';

export default function FilterBar({
  search,
  onSearchChange,
  sources = [],
  selectedSource,
  onSourceChange,
  sort,
  onSortChange,
  maxReadTime,
  onMaxReadTimeChange,
  onReset
}) {
  const hasActiveFilters = search || selectedSource || maxReadTime || sort !== 'latest';

  return (
    <div className="bg-[#0F1E36] rounded-xl border border-blue-900/50 p-4 mb-6 shadow-md">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search verified articles, topics, keywords..."
            className="w-full bg-[#0A1628] border border-blue-900/60 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5 bg-[#0A1628] border border-blue-900/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedSource}
              onChange={(e) => onSourceChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#0A1628] text-slate-200">All Sources</option>
              {sources.map((src) => (
                <option key={src.id || src.name} value={src.name} className="bg-[#0A1628] text-slate-200">
                  {src.name} ({src.credibilityScore}%)
                </option>
              ))}
            </select>
          </div>

          {/* Reading Time Filter */}
          <div className="flex items-center gap-1.5 bg-[#0A1628] border border-blue-900/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={maxReadTime}
              onChange={(e) => onMaxReadTimeChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#0A1628] text-slate-200">Any Reading Time</option>
              <option value="3" className="bg-[#0A1628] text-slate-200">≤ 3 min quick read</option>
              <option value="5" className="bg-[#0A1628] text-slate-200">≤ 5 min standard</option>
              <option value="8" className="bg-[#0A1628] text-slate-200">≤ 8 min deep dive</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-[#0A1628] border border-blue-900/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="latest" className="bg-[#0A1628] text-slate-200">Latest First</option>
              <option value="trending" className="bg-[#0A1628] text-slate-200">Most Viewed</option>
              <option value="oldest" className="bg-[#0A1628] text-slate-200">Chronological</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 px-2 py-1.5 rounded hover:bg-blue-950/60 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
