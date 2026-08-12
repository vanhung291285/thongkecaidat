import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { StatusFilter, PositionFilter, Position } from '../types';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  positionFilter: PositionFilter;
  onPositionFilterChange: (pos: PositionFilter) => void;
  resultCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  positionFilter,
  onPositionFilterChange,
  resultCount,
  totalCount,
  onClearFilters,
}) => {
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || positionFilter !== 'all';
  const positions: Position[] = ['Quản lí', 'Giáo viên', 'Nhân viên'];

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search Input Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="🔎 Tìm theo họ tên, mã cán bộ, bộ phận..."
            className="w-full text-sm border border-slate-300 rounded pl-9 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Pill Group */}
        <div className="flex bg-slate-100 rounded p-1 gap-1 items-center">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`text-[10px] px-2.5 py-1 rounded transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 font-medium hover:bg-white/60'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => onStatusFilterChange('installed')}
            className={`text-[10px] px-2.5 py-1 rounded transition-all ${
              statusFilter === 'installed'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-600 font-medium hover:bg-white/60'
            }`}
          >
            🟢 Đã cài
          </button>
          <button
            onClick={() => onStatusFilterChange('not_installed')}
            className={`text-[10px] px-2.5 py-1 rounded transition-all ${
              statusFilter === 'not_installed'
                ? 'bg-rose-600 text-white font-bold shadow-sm'
                : 'text-slate-600 font-medium hover:bg-white/60'
            }`}
          >
            🔴 Chưa cài
          </button>
        </div>

      </div>

      {/* Position Filter Row & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
        {/* Position pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Chức vụ:</span>
          <div className="flex bg-slate-100 rounded p-1 gap-1">
            <button
              onClick={() => onPositionFilterChange('all')}
              className={`text-[10px] px-2 py-0.5 rounded ${
                positionFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-600 font-medium hover:bg-white/60'
              }`}
            >
              Tất cả
            </button>
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => onPositionFilterChange(pos)}
                className={`text-[10px] px-2 py-0.5 rounded ${
                  positionFilter === pos
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 font-medium hover:bg-white/60'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Counter and Clear filter */}
        <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
          <span>
            Hiển thị <strong className="text-slate-800 font-bold">{resultCount}</strong> / {totalCount} cán bộ
          </span>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
