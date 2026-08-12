import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Check } from 'lucide-react';
import { Staff, Position } from '../types';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: Staff | null;
  onSaveStaff: (data: Omit<Staff, 'id' | 'created_at' | 'updated_at'>, id?: string) => Promise<void>;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  staffToEdit,
  onSaveStaff,
}) => {
  const [hoTen, setHoTen] = useState('');
  const [maCanBo, setMaCanBo] = useState('');
  const [chucVu, setChucVu] = useState<Position>('Giáo viên');
  const [boPhan, setBoPhan] = useState('');
  const [daCaiDat, setDaCaiDat] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (staffToEdit) {
      setHoTen(staffToEdit.ho_ten || '');
      setMaCanBo(staffToEdit.ma_can_bo || '');
      setChucVu(staffToEdit.chuc_vu || 'Giáo viên');
      setBoPhan(staffToEdit.bo_phan || '');
      setDaCaiDat(staffToEdit.da_cai_dat || false);
    } else {
      setHoTen('');
      setMaCanBo('');
      setChucVu('Giáo viên');
      setBoPhan('Tổ Giáo Viên');
      setDaCaiDat(false);
    }
    setErrorMsg('');
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên cán bộ');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      await onSaveStaff(
        {
          ho_ten: hoTen.trim(),
          ma_can_bo: maCanBo.trim() || `CB${Math.floor(100 + Math.random() * 900)}`,
          chuc_vu: chucVu,
          bo_phan: boPhan.trim() || 'Khác',
          da_cai_dat: daCaiDat,
          ngay_cai_dat: daCaiDat ? new Date().toISOString() : null,
        },
        staffToEdit ? staffToEdit.id : undefined
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi khi lưu thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base uppercase tracking-wide">
                {staffToEdit ? 'SỬA THÔNG TIN NHÂN SỰ' : 'THÊM MỚI NHÂN SỰ'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Họ và tên */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Mã cán bộ */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
              Mã cán bộ (Tùy chọn)
            </label>
            <input
              type="text"
              value={maCanBo}
              onChange={(e) => setMaCanBo(e.target.value)}
              placeholder="Ví dụ: CB001, GV012"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
            />
          </div>

          {/* Chức vụ */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
              Chức vụ <span className="text-rose-500">*</span>
            </label>
            <select
              value={chucVu}
              onChange={(e) => setChucVu(e.target.value as Position)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="Quản lí">Quản lí</option>
              <option value="Giáo viên">Giáo viên</option>
              <option value="Nhân viên">Nhân viên</option>
            </select>
          </div>

          {/* Bộ phận / Tổ chuyên môn */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
              Bộ phận / Tổ chuyên môn
            </label>
            <input
              type="text"
              value={boPhan}
              onChange={(e) => setBoPhan(e.target.value)}
              placeholder="Ví dụ: Ban Giám Hiệu, Tổ Toán, Văn phòng..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Trạng thái cài đặt */}
          <div className="pt-2">
            <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
              Trạng thái cài đặt phần mềm ATGT
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDaCaiDat(true)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-xs transition-all ${
                  daCaiDat
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Check className={`w-4 h-4 ${daCaiDat ? 'opacity-100' : 'opacity-0'}`} />
                🟢 Đã cài đặt
              </button>

              <button
                type="button"
                onClick={() => setDaCaiDat(false)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-xs transition-all ${
                  !daCaiDat
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Check className={`w-4 h-4 ${!daCaiDat ? 'opacity-100' : 'opacity-0'}`} />
                🔴 Chưa cài đặt
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Đang lưu...' : staffToEdit ? 'Lưu Thay Đổi' : 'Thêm Nhân Sự'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
