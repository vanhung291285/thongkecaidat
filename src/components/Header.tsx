import React from 'react';
import { Database, FileSpreadsheet, RefreshCw, ShieldCheck, Radio } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  onOpenImportModal: () => void;
  onExportAll: () => void;
  onExportReport: () => void;
  onOpenConfigModal: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  onOpenImportModal,
  onExportAll,
  onExportReport,
  onOpenConfigModal,
  onRefreshData,
  isRefreshing,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Main Title Banner */}
          <div className="flex flex-col items-start md:items-start">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                Hệ Thống Thống Kê ATGT
              </span>

              {/* Supabase Status Pill */}
              <button
                onClick={onOpenConfigModal}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
                title="Bấm để cấu hình Supabase hoặc lấy SQL khởi tạo"
              >
                <Radio className={`w-3 h-3 ${isConnected ? 'animate-pulse text-emerald-600' : 'text-amber-600'}`} />
                {isConnected ? 'Supabase: Bật' : 'Dữ liệu Nội bộ'}
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-blue-800 uppercase tracking-tight font-sans">
              QUẢN LÝ CÀI ĐẶT PHẦN MỀM ATGT
            </h1>
            <h2 className="text-xs sm:text-sm font-medium text-slate-500 uppercase">
              TRƯỜNG PTDTBT TH&THCS SUỐI LƯ
            </h2>
            <p className="text-xs sm:text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Phát triển ứng dụng bởi: Vũ Văn Hùng
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded border border-slate-300 transition-all disabled:opacity-50 uppercase"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>Làm Mới</span>
            </button>

            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm transition-all border border-blue-700 uppercase"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Nhập Excel</span>
            </button>

            <button
              onClick={onExportReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-sm transition-all border border-emerald-700 uppercase"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Báo Cáo</span>
            </button>

            <button
              onClick={onOpenConfigModal}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-300 transition-all"
              title="Cấu hình CSDL Supabase"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
