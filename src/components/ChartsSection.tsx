import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { OverallStats } from '../types';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface ChartsSectionProps {
  stats: OverallStats;
}

const COLORS_PIE = ['#10B981', '#F43F5E']; // Emerald green for Installed, Rose red for Pending

export const ChartsSection: React.FC<ChartsSectionProps> = ({ stats }) => {
  const pieData = [
    { name: 'Đã cài đặt', value: stats.da_cai_dat },
    { name: 'Chưa cài đặt', value: stats.chua_cai_dat },
  ];

  const barData = stats.roleStats.map((r) => ({
    name: r.chuc_vu,
    'Tổng số': r.tong_so,
    'Đã cài đặt': r.da_cai_dat,
    'Chưa cài đặt': r.chua_cai_dat,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Chart 1: Donut/Pie Chart */}
      <div className="lg:col-span-5 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase text-slate-700">
              BIỂU ĐỒ TỶ LỆ CÀI ĐẶT
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">Toàn trường</span>
        </div>

        <div className="h-60 w-full relative my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value} cán bộ`, 'Số lượng']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '6px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={32}
                formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center mb-6">
            <span className="text-xl font-black text-slate-800">{stats.ty_le}%</span>
            <span className="text-[9px] uppercase font-bold text-slate-400">Hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Chart 2: Bar Chart by Position */}
      <div className="lg:col-span-7 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold uppercase text-slate-700">
              BIỂU ĐỒ THEO CHỨC VỤ
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">Quản lí • Giáo viên • Nhân viên</span>
        </div>

        <div className="h-60 w-full my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '6px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={32}
                formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
              />
              <Bar dataKey="Tổng số" fill="#94A3B8" radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Đã cài đặt" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Chưa cài đặt" fill="#F43F5E" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
