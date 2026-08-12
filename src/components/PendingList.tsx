import React, { useState } from 'react';
import { Staff, PositionFilter } from '../types';
import { XCircle, CheckCircle2, UserX } from 'lucide-react';

interface PendingListProps {
  staffList: Staff[];
  onMarkInstalled: (id: string) => void;
  updatingId: string | null;
}

export const PendingList: React.FC<PendingListProps> = ({
  staffList,
  onMarkInstalled,
  updatingId,
}) => {
  const [filterRole, setFilterRole] = useState<PositionFilter>('all');

  const pendingStaff = staffList.filter((s) => !s.da_cai_dat);
  const filteredList = pendingStaff.filter((s) => {
    if (filterRole === 'all') return true;
    return s.chuc_vu === filterRole;
  });

  return (
    <div className="bg-white rounded-xl border border-rose-200 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="bg-rose-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-800">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-rose-300" />
          <h3 className="text-base font-extrabold uppercase tracking-wide text-white">
            🔴 DANH SÁCH CHƯA CÀI ĐẶT PHẦN MỀM ({pendingStaff.length})
          </h3>
        </div>

        {/* Position Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-rose-950/60 p-1 rounded-lg border border-rose-800">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              filterRole === 'all'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-rose-200 hover:text-white hover:bg-rose-800/60'
            }`}
          >
            Tất cả ({pendingStaff.length})
          </button>
          {(['Quản lí', 'Giáo viên', 'Nhân viên'] as const).map((role) => {
            const count = pendingStaff.filter((s) => s.chuc_vu === role).length;
            return (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterRole === role
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-rose-200 hover:text-white hover:bg-rose-800/60'
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
          <UserX className="w-8 h-8 text-rose-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">
            {pendingStaff.length === 0
              ? 'Tất cả cán bộ, giáo viên và nhân viên đã hoàn thành cài đặt phần mềm! 🎉'
              : 'Không có nhân sự chưa cài đặt trong nhóm chức vụ này.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-rose-50/80 text-rose-900 font-bold border-b border-rose-100 text-xs uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-3">Mã CB</th>
                <th className="py-3 px-3">Chức vụ</th>
                <th className="py-3 px-4">Bộ phận</th>
                <th className="py-3 px-3 text-center">Thao tác nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredList.map((item, index) => (
                <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-2.5 px-3 text-center font-medium text-slate-500 text-xs">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{item.ho_ten}</td>
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-600">{item.ma_can_bo || '—'}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                      {item.chuc_vu}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 text-xs">{item.bo_phan}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onMarkInstalled(item.id)}
                      disabled={updatingId === item.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-sm transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Xác nhận Đã cài đặt
                    </button>
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
