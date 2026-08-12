import React from 'react';
import { Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { OverallStats } from '../types';

interface StatCardsProps {
  stats: OverallStats;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. TỔNG SỐ */}
      <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm flex flex-col justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase">Tổng Số</span>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-3xl font-black text-slate-800">{stats.tong_so}</span>
          <span className="text-xs text-slate-400 font-semibold">Toàn trường</span>
        </div>
      </div>

      {/* 2. ĐÃ CÀI ĐẶT */}
      <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm flex flex-col justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase">Đã Cài Đặt</span>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-3xl font-black text-green-600">{stats.da_cai_dat}</span>
          <span className="text-xs text-green-700 font-semibold">
            {stats.ty_le}% hoàn thành
          </span>
        </div>
      </div>

      {/* 3. CHƯA CÀI ĐẶT */}
      <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm flex flex-col justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase">Chưa Cài Đặt</span>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-3xl font-black text-red-600">{stats.chua_cai_dat}</span>
          <span className="text-xs text-red-500 font-semibold">Cần nhắc nhở</span>
        </div>
      </div>

      {/* 4. TỶ LỆ HOÀN THÀNH */}
      <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm flex flex-col justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase">Tỷ Lệ Hoàn Thành</span>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-3xl font-black text-orange-600">{stats.ty_le}%</span>
          <span className="text-xs text-orange-600 font-semibold">Tự động tính</span>
        </div>
      </div>
    </div>
  );
};
