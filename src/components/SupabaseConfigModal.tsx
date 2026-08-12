import React, { useState } from 'react';
import { X, Database, Copy, Check, Shield, AlertCircle, RotateCcw, Radio } from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  SUPABASE_SQL_SETUP_SCRIPT,
  isSupabaseConfigured,
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
  onResetAllStatus: () => Promise<void>;
  isConnected: boolean;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
  onResetAllStatus,
  isConnected,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [tab, setTab] = useState<'config' | 'sql'>('config');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
    onConfigSaved();
    onClose();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleResetAll = async () => {
    if (
      window.confirm(
        '⚠️ CẢNH BÁO: Bạn có chắc chắn muốn ĐẶT LẠI TRẠNG THÁI tất cả cán bộ về "Chưa cài đặt" không?'
      )
    ) {
      setIsResetting(true);
      try {
        await onResetAllStatus();
        alert('✅ Đã đặt lại trạng thái tất cả cán bộ về Chưa cài đặt!');
      } catch (err: any) {
        alert('Không thể đặt lại trạng thái: ' + err.message);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-600 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base uppercase tracking-wide">
                CẤU HÌNH SUPABASE & CƠ SỞ DỮ LIỆU
              </h3>
              <p className="text-xs text-slate-300">Trường PTDTBT TH&THCS Suối Lư</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 text-xs font-bold">
          <button
            onClick={() => setTab('config')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'config'
                ? 'border-cyan-600 text-cyan-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Thông Số Kết Nối
          </button>
          <button
            onClick={() => setTab('sql')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'sql'
                ? 'border-cyan-600 text-cyan-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Mã SQL Khởi Tạo Bảng staff
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {tab === 'config' ? (
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs font-medium ${
                  isConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">
                    {isConnected
                      ? '🟢 Đã kết nối Supabase Realtime thành công!'
                      : '⚠️ Chưa kết nối Supabase (Đang chạy ở chế độ Dữ liệu Nội bộ)'}
                  </p>
                  <p className="mt-0.5">
                    {isConnected
                      ? 'Mọi thao tác tích chọn trạng thái sẽ đồng bộ tức thì trên tất cả điện thoại và máy tính.'
                      : 'Nhập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY bên dưới để kết nối cơ sở dữ liệu Supabase dùng chung.'}
                  </p>
                </div>
              </div>

              {/* Supabase URL */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
                />
              </div>

              {/* Supabase Anon Key */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
                  VITE_SUPABASE_ANON_KEY
                </label>
                <textarea
                  rows={3}
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400">
                  ⚠️ Lưu ý: Tuyệt đối không nhập Service Role Key vào frontend để đảm bảo bảo mật.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetAll}
                  disabled={isResetting}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  title="Đặt lại trạng thái tất cả cán bộ về Chưa cài đặt"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Đặt lại tất cả về Chưa cài đặt
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-cyan-700 hover:bg-cyan-600 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Lưu & Kết Nối Supabase
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 font-medium">
                  Sao chép đoạn mã SQL dưới đây và dán vào <strong>SQL Editor</strong> trên bảng điều khiển Supabase của bạn để tạo bảng <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">staff</code>:
                </p>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedSql ? 'Đã sao chép!' : 'Sao chép SQL'}
                </button>
              </div>

              <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-72 select-all">
                <pre>{SUPABASE_SQL_SETUP_SCRIPT}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
};
