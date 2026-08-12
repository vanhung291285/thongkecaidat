import React, { useState } from 'react';
import { Staff, Position } from '../types';
import { UserCheck, CheckCircle2, XCircle, Building2, Send, Search, Sparkles } from 'lucide-react';

interface TeacherRegistrationFormProps {
  existingStaffList: Staff[];
  onSaveStaff: (data: Omit<Staff, 'id' | 'created_at' | 'updated_at'>, existingId?: string) => Promise<void>;
  onStatusUpdated?: () => void;
}

export const TeacherRegistrationForm: React.FC<TeacherRegistrationFormProps> = ({
  existingStaffList,
  onSaveStaff,
  onStatusUpdated,
}) => {
  const schoolName = 'Trường PTDTBT TH&THCS Suối Lư';

  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [hoTen, setHoTen] = useState<string>('');
  const [maCanBo, setMaCanBo] = useState<string>('');
  const [chucVu, setChucVu] = useState<Position>('Giáo viên');
  const [boPhan, setBoPhan] = useState<string>('Tổ Giáo viên');
  const [daCaiDat, setDaCaiDat] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto fill when choosing from existing staff list
  const handleSelectExistingStaff = (id: string) => {
    setSelectedStaffId(id);
    if (!id) {
      setHoTen('');
      setMaCanBo('');
      setChucVu('Giáo viên');
      setBoPhan('Tổ Giáo viên');
      setDaCaiDat(true);
      return;
    }

    const staff = existingStaffList.find((s) => s.id === id);
    if (staff) {
      setHoTen(staff.ho_ten);
      setMaCanBo(staff.ma_can_bo || '');
      setChucVu(staff.chuc_vu);
      setBoPhan(staff.bo_phan);
      setDaCaiDat(staff.da_cai_dat);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim()) {
      alert('Vui lòng nhập Họ và tên cán bộ/giáo viên.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      await onSaveStaff(
        {
          ho_ten: hoTen.trim(),
          ma_can_bo: maCanBo.trim() || `SL${Math.floor(10 + Math.random() * 90)}`,
          chuc_vu: chucVu,
          bo_phan: boPhan.trim() || 'Tổ Giáo viên',
          da_cai_dat: daCaiDat,
          ngay_cai_dat: daCaiDat ? new Date().toISOString() : null,
        },
        selectedStaffId || undefined
      );

      setSuccessMsg(`✅ Đã gửi thành công! Cán bộ: ${hoTen} - Trạng thái: ${daCaiDat ? 'ĐÃ CÀI ĐẶT' : 'CHƯA CÀI ĐẶT'}`);
      
      // Reset after submission if it was a new record
      if (!selectedStaffId) {
        setHoTen('');
        setMaCanBo('');
        setChucVu('Giáo viên');
        setBoPhan('Tổ Giáo viên');
        setDaCaiDat(true);
      }

      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      alert('Lỗi khi gửi thông tin: ' + (err.message || 'Không thể kết nối'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg border-2 border-blue-600 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm sm:text-base font-extrabold text-blue-900 uppercase tracking-tight">
              Khai Báo Cài Đặt Phần Mềm ATGT
            </h3>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-300 uppercase">
              Dành cho Cán bộ & Giáo viên
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Giáo viên điền thông tin bên dưới để xác nhận trạng thái cài đặt phần mềm An Toàn Giao Thông
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-300">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span>{schoolName}</span>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-md font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Select existing or fill new */}
        {existingStaffList.length > 0 && (
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              🔎 Chọn tên bạn từ danh sách (hoặc nhập thông tin mới bên dưới):
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => handleSelectExistingStaff(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Tôi là người mới (Tự nhập thông tin mới) --</option>
              {existingStaffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.ho_ten} ({staff.chuc_vu} - {staff.bo_phan}) [{staff.da_cai_dat ? '🟢 Đã cài' : '🔴 Chưa cài'}]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Row 2: Basic info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tên Trường */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              1. Tên Trường:
            </label>
            <input
              type="text"
              value={schoolName}
              readOnly
              className="w-full text-xs bg-slate-100 border border-slate-300 rounded px-3 py-2 font-bold text-slate-700 cursor-not-allowed"
            />
          </div>

          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              2. Họ và Tên <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Nhập họ và tên đầy đủ..."
              required
              className="w-full text-xs border border-slate-300 rounded px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Chức vụ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              3. Chức Vụ <span className="text-red-500">*</span>:
            </label>
            <select
              value={chucVu}
              onChange={(e) => setChucVu(e.target.value as Position)}
              className="w-full text-xs border border-slate-300 rounded px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Giáo viên">Giáo viên</option>
              <option value="Quản lí">Quản lí</option>
              <option value="Nhân viên">Nhân viên</option>
            </select>
          </div>

          {/* Bộ phận / Tổ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              4. Bộ Phận / Tổ Chuyên Môn:
            </label>
            <input
              type="text"
              value={boPhan}
              onChange={(e) => setBoPhan(e.target.value)}
              placeholder="Ví dụ: Tổ Toán - Lý..."
              className="w-full text-xs border border-slate-300 rounded px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Row 3: Status selection */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <label className="block text-xs font-bold text-slate-800 uppercase mb-2">
            5. Chọn Trạng Thái Cài Đặt Phần Mềm ATGT <span className="text-red-500">*</span>:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDaCaiDat(true)}
              className={`p-3 rounded-lg border-2 flex items-center justify-between transition-all cursor-pointer ${
                daCaiDat
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-5 h-5 ${daCaiDat ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <p className="text-xs font-bold uppercase">🟢 ĐÃ CÀI ĐẶT</p>
                  <p className="text-[10px] text-slate-500">Đã tải và cài đặt phần mềm thành công trên thiết bị</p>
                </div>
              </div>
              <input
                type="radio"
                name="daCaiDatRadio"
                checked={daCaiDat}
                onChange={() => setDaCaiDat(true)}
                className="w-4 h-4 accent-emerald-600"
              />
            </button>

            <button
              type="button"
              onClick={() => setDaCaiDat(false)}
              className={`p-3 rounded-lg border-2 flex items-center justify-between transition-all cursor-pointer ${
                !daCaiDat
                  ? 'bg-rose-50 border-rose-600 text-rose-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <XCircle className={`w-5 h-5 ${!daCaiDat ? 'text-rose-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <p className="text-xs font-bold uppercase">🔴 CHƯA CÀI ĐẶT</p>
                  <p className="text-[10px] text-slate-500">Chưa cài đặt phần mềm hoặc cần hỗ trợ kĩ thuật</p>
                </div>
              </div>
              <input
                type="radio"
                name="daCaiDatRadio"
                checked={!daCaiDat}
                onChange={() => setDaCaiDat(false)}
                className="w-4 h-4 accent-rose-600"
              />
            </button>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wide rounded shadow transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'ĐANG GỬI...' : 'GỬI XÁC NHẬN CÀI ĐẶT'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
