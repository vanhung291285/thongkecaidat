import React from 'react';
import { Staff } from '../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface StaffTableProps {
  staffList: Staff[];
  onToggleStatus: (id: string, isInstalled: boolean) => void;
  onEditStaff: (staff: Staff) => void;
  onDeleteStaff: (id: string, name: string) => void;
  updatingId: string | null;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staffList,
  onToggleStatus,
  onEditStaff,
  onDeleteStaff,
  updatingId,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 pb-2 border-b border-slate-100 gap-2">
        <h3 className="text-sm font-bold text-slate-700 uppercase">
          DANH SÁCH CÁN BỘ, GIÁO VIÊN & NHÂN VIÊN
        </h3>
        <div className="text-xs font-semibold text-slate-500">
          Hiển thị <strong className="text-slate-800">{staffList.length}</strong> bản ghi
        </div>
      </div>

      {staffList.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700 text-sm">Không tìm thấy cán bộ phù hợp</p>
          <p className="text-xs text-slate-400 mt-0.5">Thử thay đổi từ khóa tìm kiếm hoặc chọn lại bộ lọc.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b-2 border-slate-200 font-bold">
                <th className="p-2 w-10 text-center">STT</th>
                <th className="p-2 min-w-[150px]">Họ và tên</th>
                <th className="p-2 min-w-[80px]">Mã CB</th>
                <th className="p-2 min-w-[90px]">Chức vụ</th>
                <th className="p-2 min-w-[120px]">Bộ phận</th>
                <th className="p-2 text-center w-36">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((item, index) => {
                const isUpdating = updatingId === item.id;
                const isInstalled = item.da_cai_dat;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/30 transition-colors ${
                      index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    {/* STT */}
                    <td className="p-2 text-center font-medium text-slate-500">
                      {index + 1}
                    </td>

                    {/* Họ và tên */}
                    <td className="p-2 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {isInstalled && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        )}
                        <span>{item.ho_ten}</span>
                      </div>
                    </td>

                    {/* Mã CB */}
                    <td className="p-2 font-mono text-[11px] text-slate-600">
                      {item.ma_can_bo || '—'}
                    </td>

                    {/* Chức vụ */}
                    <td className="p-2 italic text-slate-700 font-medium">
                      {item.chuc_vu}
                    </td>

                    {/* Bộ phận */}
                    <td className="p-2 text-slate-600">
                      {item.bo_phan}
                    </td>

                    {/* Checkboxes Trạng Thái (Read-only display based on declaration) */}
                    <td className="p-2">
                      <div className="flex justify-around items-center select-none pointer-events-none">
                        <div className={`flex items-center gap-1 ${isInstalled ? 'opacity-100' : 'opacity-40'}`}>
                          <input
                            type="checkbox"
                            checked={isInstalled}
                            readOnly
                            disabled
                            className="accent-green-600 w-3.5 h-3.5 cursor-default"
                          />
                          <span className={`text-[10px] ${isInstalled ? 'text-green-700 font-bold' : 'text-slate-500'}`}>
                            Đã cài
                          </span>
                        </div>

                        <div className={`flex items-center gap-1 ${!isInstalled ? 'opacity-100' : 'opacity-40'}`}>
                          <input
                            type="checkbox"
                            checked={!isInstalled}
                            readOnly
                            disabled
                            className="accent-red-600 w-3.5 h-3.5 cursor-default"
                          />
                          <span className={`text-[10px] ${!isInstalled ? 'text-red-700 font-bold' : 'text-slate-500'}`}>
                            Chưa cài
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer status notice */}
      <div className="mt-3 pt-2 border-t flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-wider gap-1">
        <span className="text-emerald-700">✅ Dữ liệu tự động đồng bộ Supabase</span>
        <span>Hệ thống quản trị nội bộ Suối Lư</span>
      </div>
    </div>
  );
};
