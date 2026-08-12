import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Staff, StatusFilter, PositionFilter, OverallStats, Position, RoleStat } from './types';
import {
  fetchAllStaff,
  updateStaffInstallationStatus,
  addStaff,
  updateStaffInfo,
  deleteStaff,
  bulkInsertStaff,
  resetAllInstallationStatus,
  getSupabaseClient,
  isSupabaseConfigured,
} from './lib/supabase';
import {
  exportAllStaffToExcel,
  exportInstalledStaffToExcel,
  exportNotInstalledStaffToExcel,
  exportStatisticsReportToExcel,
} from './lib/excelUtils';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { ProgressBar } from './components/ProgressBar';
import { PositionStatsTable } from './components/PositionStatsTable';
import { ChartsSection } from './components/ChartsSection';
import { SearchFilter } from './components/SearchFilter';
import { StaffTable } from './components/StaffTable';
import { TeacherRegistrationForm } from './components/TeacherRegistrationForm';
import { PendingList } from './components/PendingList';
import { InstalledList } from './components/InstalledList';
import { ExcelImportModal } from './components/ExcelImportModal';
import { StaffModal } from './components/StaffModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { Toast, ToastMessage } from './components/Toast';
import { RefreshCw, Users, CheckCircle2, XCircle, BarChart2, ShieldCheck, Download, AlertCircle } from 'lucide-react';

export default function App() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all');

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'main' | 'pending' | 'installed' | 'charts'>('main');

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      type,
      message,
    });
  }, []);

  // Fetch all staff data
  const loadData = useCallback(async (showSpin = false) => {
    if (showSpin) setIsRefreshing(true);
    try {
      const res = await fetchAllStaff();
      setStaffList(res.data || []);
      setIsConnected(res.isConnected);
    } catch (err: any) {
      showToast('❌ Không thể tải dữ liệu: ' + (err?.message || 'Lỗi mạng'), 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up Supabase Realtime Subscription
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) return;

    console.log('⚡ Registering Supabase Realtime subscription for "staff" table...');
    const channel = supabase
      .channel('public:staff_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff' },
        (payload) => {
          console.log('🔔 Realtime change received:', payload);
          // Refetch data when changes occur on another device
          loadData();
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            if (updated && updated.ho_ten) {
              const statusText = updated.da_cai_dat ? 'Đã cài đặt' : 'Chưa cài đặt';
              showToast(`🔔 ${updated.ho_ten} vừa cập nhật: ${statusText}`, 'info');
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Supabase Realtime Status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, showToast]);

  // Periodic polling every 6s when connected, so all browsers & devices remain perfectly in sync
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      loadData(false);
    }, 6000);
    return () => clearInterval(interval);
  }, [isConnected, loadData]);

  // Calculate Overall Statistics dynamically
  const stats: OverallStats = useMemo(() => {
    const tong_so = staffList.length;
    const da_cai_dat = staffList.filter((s) => s.da_cai_dat).length;
    const chua_cai_dat = tong_so - da_cai_dat;
    const ty_le = tong_so > 0 ? parseFloat(((da_cai_dat / tong_so) * 100).toFixed(1)) : 0;

    const roles: Position[] = ['Quản lí', 'Giáo viên', 'Nhân viên'];
    const roleStats: RoleStat[] = roles.map((role) => {
      const roleStaff = staffList.filter((s) => s.chuc_vu === role);
      const totalRole = roleStaff.length;
      const installedRole = roleStaff.filter((s) => s.da_cai_dat).length;
      const pendingRole = totalRole - installedRole;
      const pct = totalRole > 0 ? parseFloat(((installedRole / totalRole) * 100).toFixed(1)) : 0;

      return {
        chuc_vu: role,
        tong_so: totalRole,
        da_cai_dat: installedRole,
        chua_cai_dat: pendingRole,
        ty_le: pct,
      };
    });

    return {
      tong_so,
      da_cai_dat,
      chua_cai_dat,
      ty_le,
      roleStats,
    };
  }, [staffList]);

  // Filter staff list according to search term & filter selections
  const filteredStaff = useMemo(() => {
    return staffList.filter((item) => {
      // Search term filter (match name or staff ID)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchName = item.ho_ten.toLowerCase().includes(term);
        const matchCode = item.ma_can_bo.toLowerCase().includes(term);
        const matchDept = item.bo_phan.toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchDept) return false;
      }

      // Status filter
      if (statusFilter === 'installed' && !item.da_cai_dat) return false;
      if (statusFilter === 'not_installed' && item.da_cai_dat) return false;

      // Position filter
      if (positionFilter !== 'all' && item.chuc_vu !== positionFilter) return false;

      return true;
    });
  }, [staffList, searchTerm, statusFilter, positionFilter]);

  // Handle status toggle (exclusive radio button behavior)
  const handleToggleStatus = async (id: string, isInstalled: boolean) => {
    setUpdatingId(id);

    // Optimistic UI update
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              da_cai_dat: isInstalled,
              ngay_cai_dat: isInstalled ? new Date().toISOString() : null,
            }
          : s
      )
    );

    const result = await updateStaffInstallationStatus(id, isInstalled);
    setUpdatingId(null);

    if (result.success) {
      showToast('✅ Đã cập nhật trạng thái thành công!', 'success');
    } else {
      showToast('❌ ' + (result.error || 'Không thể cập nhật dữ liệu. Vui lòng thử lại.'), 'error');
      // Revert on error
      loadData();
    }
  };

  // Add / Edit Staff handler
  const handleSaveStaff = async (
    data: Omit<Staff, 'id' | 'created_at' | 'updated_at'>,
    id?: string
  ) => {
    if (id) {
      const res = await updateStaffInfo(id, data);
      if (res.success) {
        showToast('✅ Đã cập nhật thông tin nhân sự!', 'success');
        loadData();
      } else {
        throw new Error(res.error || 'Lỗi cập nhật nhân sự');
      }
    } else {
      const res = await addStaff(data);
      if (res.success) {
        showToast('✅ Đã thêm nhân sự mới thành công!', 'success');
        loadData();
      } else {
        throw new Error(res.error || 'Lỗi thêm nhân sự');
      }
    }
  };

  // Delete staff with required confirmation
  const handleDeleteStaff = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người này không?\n\nCán bộ: ${name}`)) {
      const res = await deleteStaff(id);
      if (res.success) {
        showToast(`✅ Đã xóa cán bộ ${name}`, 'success');
        setStaffList((prev) => prev.filter((s) => s.id !== id));
      } else {
        showToast('❌ Không thể xóa: ' + (res.error || 'Lỗi hệ thống'), 'error');
      }
    }
  };

  // Excel Import handler
  const handleExcelImport = async (
    items: Omit<Staff, 'id' | 'created_at' | 'updated_at'>[]
  ) => {
    const res = await bulkInsertStaff(items);
    if (res.success) {
      showToast(`✅ Đã nhập thành công ${res.insertedCount} nhân sự từ Excel!`, 'success');
      loadData();
    } else {
      throw new Error(res.error || 'Lỗi nhập file Excel');
    }
  };

  // Bulk Reset handler
  const handleResetAllStatus = async () => {
    const res = await resetAllInstallationStatus();
    if (res.success) {
      showToast('✅ Đã đặt lại trạng thái tất cả cán bộ về Chưa cài đặt!', 'success');
      loadData();
    } else {
      throw new Error(res.error || 'Lỗi đặt lại trạng thái');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased">
      
      {/* Header Banner */}
      <Header
        isConnected={isConnected}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportAll={() => exportAllStaffToExcel(staffList)}
        onExportReport={() => exportStatisticsReportToExcel(stats, staffList)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onRefreshData={() => loadData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Connection Notice Banner when not connected to Cloud Supabase */}
      {!isConnected && (
        <div className="bg-amber-600 text-white px-4 py-2.5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-200" />
            <span>
              <strong>LƯU Ý KẾT NỐI:</strong> Trình duyệt này chưa cấu hình kết nối Supabase Cloud. Dữ liệu khai báo hiện chỉ lưu trên máy này. Bấm vào nút bên phải để nhập thông số kết nối dùng chung cho tất cả các máy.
            </span>
          </div>
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-3 py-1.5 bg-white text-amber-900 font-extrabold rounded shadow hover:bg-amber-100 transition-colors uppercase shrink-0 text-[11px]"
          >
            ⚙️ Cấu Hình Supabase Ngay
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        
        {/* Loading Overlay */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-600 space-y-3">
            <RefreshCw className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="font-bold text-base">Đang tải dữ liệu cài đặt phần mềm ATGT...</p>
            <p className="text-xs text-slate-400">Trường PTDTBT TH&THCS Suối Lư</p>
          </div>
        ) : (
          <>
            {/* SECTION VI: 4 Ô THỐNG KÊ LỚN */}
            <StatCards stats={stats} />

            {/* SECTION XVIII: THANH TIẾN ĐỘ CÀI ĐẶT */}
            <ProgressBar
              installedCount={stats.da_cai_dat}
              totalCount={stats.tong_so}
              percentage={stats.ty_le}
            />

            {/* Navigation Tab Bar for different views */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('main')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                    activeTab === 'main'
                      ? 'bg-blue-800 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Trang Chủ & Danh Sách</span>
                </button>

                <button
                  onClick={() => setActiveTab('pending')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                    activeTab === 'pending'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white text-red-600 hover:bg-red-50 border border-slate-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Chưa Cài ({stats.chua_cai_dat})</span>
                </button>

                <button
                  onClick={() => setActiveTab('installed')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                    activeTab === 'installed'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-white text-green-600 hover:bg-green-50 border border-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã Cài ({stats.da_cai_dat})</span>
                </button>

                <button
                  onClick={() => setActiveTab('charts')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                    activeTab === 'charts'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-blue-600 hover:bg-blue-50 border border-slate-200'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Biểu Đồ</span>
                </button>
              </div>

              {/* Quick Export Dropdown */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportAllStaffToExcel(staffList)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded border border-slate-300 transition-colors uppercase"
                  title="Xuất danh sách toàn bộ cán bộ"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: MAIN / HOME VIEW */}
            {activeTab === 'main' && (
              <div className="space-y-4">
                
                {/* SECTION: KHAI BÁO CÀI ĐẶT DÀNH CHO GIÁO VIÊN */}
                <TeacherRegistrationForm
                  existingStaffList={staffList}
                  onSaveStaff={handleSaveStaff}
                  onStatusUpdated={loadData}
                />

                {/* SECTION VII: THỐNG KÊ THEO CHỨC VỤ (Quản lí - Giáo viên - Nhân viên) */}
                <PositionStatsTable stats={stats} />

                {/* SECTION XVII: BIỂU ĐỒ THỐNG KÊ */}
                <ChartsSection stats={stats} />

                {/* SECTION XIII & XIV: TÌM KIẾM & BỘ LỌC */}
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  positionFilter={positionFilter}
                  onPositionFilterChange={setPositionFilter}
                  resultCount={filteredStaff.length}
                  totalCount={staffList.length}
                  onClearFilters={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPositionFilter('all');
                  }}
                />

                {/* SECTION VIII, IX, X: BẢNG DANH SÁCH NHÂN SỰ VÀ CHECKBOX */}
                <StaffTable
                  staffList={filteredStaff}
                  onToggleStatus={handleToggleStatus}
                  onEditStaff={(staff) => {
                    setStaffToEdit(staff);
                    setIsStaffModalOpen(true);
                  }}
                  onDeleteStaff={handleDeleteStaff}
                  updatingId={updatingId}
                />
              </div>
            )}

            {/* TAB CONTENT: CHƯA CÀI ĐẶT */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                <PendingList
                  staffList={staffList}
                  onMarkInstalled={(id) => handleToggleStatus(id, true)}
                  updatingId={updatingId}
                />
              </div>
            )}

            {/* TAB CONTENT: ĐÃ CÀI ĐẶT */}
            {activeTab === 'installed' && (
              <div className="space-y-4">
                <InstalledList staffList={staffList} />
              </div>
            )}

            {/* TAB CONTENT: BIỂU ĐỒ */}
            {activeTab === 'charts' && (
              <div className="space-y-4">
                <ChartsSection stats={stats} />
                <PositionStatsTable stats={stats} />
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-12 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-200">
            HỆ THỐNG QUẢN LÝ THỐNG KÊ CÀI ĐẶT PHẦN MỀM ATGT
          </p>
          <p className="text-emerald-400 font-semibold">
            TRƯỜNG PTDTBT TH&THCS SUỐI LƯ
          </p>
          <p className="text-slate-500 pt-2">
            Hỗ trợ Supabase Realtime • Tự động tính toán số liệu • Tương thích Máy tính & Điện thoại
          </p>
        </div>
      </footer>

      {/* MODALS */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingStaff={staffList}
        onImportComplete={handleExcelImport}
      />

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setStaffToEdit(null);
        }}
        staffToEdit={staffToEdit}
        onSaveStaff={handleSaveStaff}
      />

      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigSaved={() => loadData(true)}
        onResetAllStatus={handleResetAllStatus}
        isConnected={isConnected}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

    </div>
  );
}
