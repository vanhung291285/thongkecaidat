import React, { useState } from 'react';
import { Staff, PositionFilter } from '../types';
import { CheckCircle2, Calendar, UserCheck } from 'lucide-react';

interface InstalledListProps {
  staffList: Staff[];
}

export const InstalledList: React.FC<InstalledListProps> = ({ staffList }) => {
  const [filterRole, setFilterRole] = useState<PositionFilter>('all');

  const installedStaff = staffList.filter((s) => s.da_cai_dat);
  const filteredList = installedStaff.filter((s) => {
    if (filterRole === 'all') return true;
    return s.chuc_vu === filterRole;
  });

  const formatDateVN = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${mins}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="bg-emerald-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <h3 className="text-base font-extrabold uppercase tracking-wide text-white">
            🟢 DANH SÁCH ĐÃ CÀI ĐẶT PHẦN MỀM ({installedStaff.length})
          </h3>
        </div>

        {/* Position Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-emerald-950/60 p-1 rounded-lg border border-emerald-800">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              filterRole === 'all'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
            }`}
          >
            Tất cả ({installedStaff.length})
          </button>
          {(['Quản lí', 'Giáo viên', 'Nhân viên'] as const).map((role) => {
            const count = installedStaff.filter((s) => s.chuc_vu === role).length;
            return (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterRole === role
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
                }`}
              >
                {role} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <UserCheck className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">
            {installedStaff.length === 0
              ? 'Chưa có cán bộ nào hoàn thành cài đặt phần mềm.'
              : 'Không có nhân sự đã cài đặt trong nhóm chức vụ này.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-emerald-50/80 text-emerald-900 font-bold border-b border-emerald-100 text-xs uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-3">Mã CB</th>
                <th className="py-3 px-3">Chức vụ</th>
                <th className="py-3 px-4">Bộ phận</th>
                <th className="py-3 px-4 text-emerald-800 font-extrabold">Ngày cài đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredList.map((item, index) => (
                <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-2.5 px-3 text-center font-medium text-slate-500 text-xs">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{item.ho_ten}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-600">{item.ma_can_bo || '—'}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.chuc_vu}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 text-xs">{item.bo_phan}</td>
                  <td className="py-2.5 px-4 font-mono text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    {formatDateVN(item.ngay_cai_dat)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
