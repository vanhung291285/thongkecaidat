import React from 'react';
import { OverallStats } from '../types';
import { Layers } from 'lucide-react';

interface PositionStatsTableProps {
  stats: OverallStats;
}

export const PositionStatsTable: React.FC<PositionStatsTableProps> = ({ stats }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <h3 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2 flex justify-between items-center uppercase">
        <span>THỐNG KÊ THEO CHỨC VỤ</span>
        <span className="text-[10px] text-slate-400 font-normal normal-case">
          Tỷ lệ: {stats.ty_le}%
        </span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-bold">
              <th className="p-2 border">Chức vụ</th>
              <th className="p-2 border text-center">Tổng số</th>
              <th className="p-2 border text-center text-green-700">Đã cài</th>
              <th className="p-2 border text-center text-red-600">Chưa cài</th>
              <th className="p-2 border text-right text-blue-700">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.roleStats.map((r) => (
              <tr key={r.chuc_vu} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-2 border font-semibold text-slate-800">{r.chuc_vu}</td>
                <td className="p-2 border text-center font-medium">{r.tong_so}</td>
                <td className="p-2 border text-center text-green-600 font-bold">{r.da_cai_dat}</td>
                <td className="p-2 border text-center text-red-500 font-bold">{r.chua_cai_dat}</td>
                <td className="p-2 border text-right font-extrabold text-blue-600">{r.ty_le}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold text-slate-900">
              <td className="p-2 border">TỔNG CỘNG</td>
              <td className="p-2 border text-center">{stats.tong_so}</td>
              <td className="p-2 border text-center text-green-600">{stats.da_cai_dat}</td>
              <td className="p-2 border text-center text-red-500">{stats.chua_cai_dat}</td>
              <td className="p-2 border text-right text-blue-700">{stats.ty_le}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
