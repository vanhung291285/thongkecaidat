import * as XLSX from 'xlsx';
import { Staff, Position, OverallStats, ImportResult } from '../types';

export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      'Họ và tên': 'Nguyễn Văn An',
      'Mã cán bộ': 'CB099',
      'Chức vụ': 'Giáo viên',
      'Bộ phận': 'Tổ Toán - KHTN',
    },
    {
      'Họ và tên': 'Trần Thị Bích',
      'Mã cán bộ': 'CB100',
      'Chức vụ': 'Quản lí',
      'Bộ phận': 'Ban Giám Hiệu',
    },
    {
      'Họ và tên': 'Lê Hoàng Nam',
      'Mã cán bộ': 'CB101',
      'Chức vụ': 'Nhân viên',
      'Bộ phận': 'Văn phòng',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Họ và tên
    { wch: 15 }, // Mã cán bộ
    { wch: 15 }, // Chức vụ
    { wch: 25 }, // Bộ phận
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Sach_Mau');
  XLSX.writeFile(workbook, 'Mau_Danh_Sach_Nhan_Su_Suoi_Lu.xlsx');
}

export function parseExcelFileForImport(
  file: File,
  existingStaff: Staff[]
): Promise<{ validItems: Omit<Staff, 'id' | 'created_at' | 'updated_at'>[]; importResult: ImportResult }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!jsonData || jsonData.length === 0) {
          resolve({
            validItems: [],
            importResult: {
              successCount: 0,
              duplicateCount: 0,
              errorCount: 1,
              errors: ['Tệp Excel không có dữ liệu hoặc định dạng không hợp lệ.'],
            },
          });
          return;
        }

        const validItems: Omit<Staff, 'id' | 'created_at' | 'updated_at'>[] = [];
        const errors: string[] = [];
        let duplicateCount = 0;
        let errorCount = 0;

        const existingCodes = new Set(
          existingStaff.map((s) => s.ma_can_bo.trim().toLowerCase()).filter(Boolean)
        );
        const existingNames = new Set(
          existingStaff.map((s) => s.ho_ten.trim().toLowerCase()).filter(Boolean)
        );

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // Accounting for 1-based index and header row

          // Detect columns with flexible key names
          const hoTenKey = Object.keys(row).find((k) =>
            k.toLowerCase().includes('họ') || k.toLowerCase().includes('ten') || k.toLowerCase().includes('tên')
          );
          const maCbKey = Object.keys(row).find((k) =>
            k.toLowerCase().includes('mã') || k.toLowerCase().includes('ma') || k.toLowerCase().includes('cb')
          );
          const chucVuKey = Object.keys(row).find((k) =>
            k.toLowerCase().includes('chức') || k.toLowerCase().includes('chuc')
          );
          const boPhanKey = Object.keys(row).find((k) =>
            k.toLowerCase().includes('bộ') || k.toLowerCase().includes('bo') || k.toLowerCase().includes('tổ')
          );

          const rawHoTen = String(row[hoTenKey || 'Họ và tên'] || '').trim();
          const rawMaCb = String(row[maCbKey || 'Mã cán bộ'] || '').trim();
          const rawChucVu = String(row[chucVuKey || 'Chức vụ'] || '').trim();
          const rawBoPhan = String(row[boPhanKey || 'Bộ phận'] || '').trim();

          if (!rawHoTen) {
            errorCount++;
            errors.push(`Dòng ${rowNum}: Thiếu Họ và tên.`);
            return;
          }

          // Check duplicate
          const lowerMaCb = rawMaCb.toLowerCase();
          const lowerHoTen = rawHoTen.toLowerCase();

          if (lowerMaCb && existingCodes.has(lowerMaCb)) {
            duplicateCount++;
            errors.push(`Dòng ${rowNum}: Trùng mã cán bộ "${rawMaCb}" (${rawHoTen}).`);
            return;
          }

          if (!lowerMaCb && existingNames.has(lowerHoTen)) {
            duplicateCount++;
            errors.push(`Dòng ${rowNum}: Trùng họ tên "${rawHoTen}".`);
            return;
          }

          // Normalize Chức vụ (must strictly be 'Quản lí' | 'Giáo viên' | 'Nhân viên')
          let normalizedChucVu: Position = 'Giáo viên';
          const lowerChucVu = rawChucVu.toLowerCase();

          if (lowerChucVu.includes('quản') || lowerChucVu.includes('quan') || lowerChucVu.includes('lãnh')) {
            normalizedChucVu = 'Quản lí';
          } else if (lowerChucVu.includes('nhân') || lowerChucVu.includes('nhan') || lowerChucVu.includes('văn')) {
            normalizedChucVu = 'Nhân viên';
          } else {
            normalizedChucVu = 'Giáo viên';
          }

          const finalMaCb = rawMaCb || `CB${Math.floor(100 + Math.random() * 900)}`;

          validItems.push({
            ho_ten: rawHoTen,
            ma_can_bo: finalMaCb,
            chuc_vu: normalizedChucVu,
            bo_phan: rawBoPhan || 'Chưa phân loại',
            da_cai_dat: false,
            ngay_cai_dat: null,
          });

          if (lowerMaCb) existingCodes.add(lowerMaCb);
          existingNames.add(lowerHoTen);
        });

        resolve({
          validItems,
          importResult: {
            successCount: validItems.length,
            duplicateCount,
            errorCount,
            errors,
          },
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

// Export All Staff
export function exportAllStaffToExcel(staffList: Staff[]) {
  const exportData = staffList.map((item, idx) => ({
    'STT': idx + 1,
    'Họ và tên': item.ho_ten,
    'Mã cán bộ': item.ma_can_bo,
    'Chức vụ': item.chuc_vu,
    'Bộ phận': item.bo_phan,
    'Trạng thái': item.da_cai_dat ? 'Đã cài đặt' : 'Chưa cài đặt',
    'Ngày cài đặt': item.ngay_cai_dat ? formatDateVN(item.ngay_cai_dat) : '—',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Toan_Bo_Nhan_Su');
  XLSX.writeFile(workbook, `Danh_Sach_Toan_Bo_Nhan_Su_ATGT_Suoi_Lu_${getTodaySuffix()}.xlsx`);
}

// Export Installed Staff
export function exportInstalledStaffToExcel(staffList: Staff[]) {
  const installedList = staffList.filter((s) => s.da_cai_dat);
  const exportData = installedList.map((item, idx) => ({
    'STT': idx + 1,
    'Họ và tên': item.ho_ten,
    'Mã cán bộ': item.ma_can_bo,
    'Chức vụ': item.chuc_vu,
    'Bộ phận': item.bo_phan,
    'Ngày cài đặt': item.ngay_cai_dat ? formatDateVN(item.ngay_cai_dat) : '—',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Da_Cai_Dat');
  XLSX.writeFile(workbook, `Danh_Sach_Da_Cai_Dat_ATGT_Suoi_Lu_${getTodaySuffix()}.xlsx`);
}

// Export Not Installed Staff
export function exportNotInstalledStaffToExcel(staffList: Staff[]) {
  const pendingList = staffList.filter((s) => !s.da_cai_dat);
  const exportData = pendingList.map((item, idx) => ({
    'STT': idx + 1,
    'Họ và tên': item.ho_ten,
    'Mã cán bộ': item.ma_can_bo,
    'Chức vụ': item.chuc_vu,
    'Bộ phận': item.bo_phan,
    'Trạng thái': 'Chưa cài đặt',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Chua_Cai_Dat');
  XLSX.writeFile(workbook, `Danh_Sach_Chua_Cai_Dat_ATGT_Suoi_Lu_${getTodaySuffix()}.xlsx`);
}

// Export Full Statistics Report
export function exportStatisticsReportToExcel(stats: OverallStats, staffList: Staff[]) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary Stats Table
  const summarySheetData = [
    { 'Chỉ số': 'TỔNG SỐ CÁN BỘ', 'Giá trị': stats.tong_so },
    { 'Chỉ số': 'ĐÃ CÀI ĐẶT PHẦN MỀM', 'Giá trị': stats.da_cai_dat },
    { 'Chỉ số': 'CHƯA CÀI ĐẶT PHẦN MỀM', 'Giá trị': stats.chua_cai_dat },
    { 'Chỉ số': 'TỶ LỆ HOÀN THÀNH', 'Giá trị': `${stats.ty_le}%` },
    {},
    { 'Chỉ số': 'THỐNG KÊ CHI TIẾT THEO CHỨC VỤ', 'Giá trị': '' },
  ];

  const roleRows: any[] = stats.roleStats.map((r) => ({
    'Chức vụ': r.chuc_vu,
    'Tổng số': r.tong_so,
    'Đã cài đặt': r.da_cai_dat,
    'Chưa cài đặt': r.chua_cai_dat,
    'Tỷ lệ hoàn thành': `${r.ty_le}%`,
  }));

  roleRows.push({
    'Chức vụ': 'TỔNG CỘNG',
    'Tổng số': stats.tong_so,
    'Đã cài đặt': stats.da_cai_dat,
    'Chưa cài đặt': stats.chua_cai_dat,
    'Tỷ lệ hoàn thành': `${stats.ty_le}%`,
  });

  const wsSummary = XLSX.utils.json_to_sheet(summarySheetData);
  XLSX.utils.sheet_add_json(wsSummary, roleRows, { origin: 'A8' });
  wsSummary['!cols'] = [
    { wch: 28 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Bao_Cao_Thong_Ke');

  // Sheet 2: All staff list details
  const allData = staffList.map((item, idx) => ({
    'STT': idx + 1,
    'Họ và tên': item.ho_ten,
    'Mã cán bộ': item.ma_can_bo,
    'Chức vụ': item.chuc_vu,
    'Bộ phận': item.bo_phan,
    'Đã cài đặt': item.da_cai_dat ? 'Có' : 'Chưa',
    'Ngày cài đặt': item.ngay_cai_dat ? formatDateVN(item.ngay_cai_dat) : '',
  }));
  const wsDetail = XLSX.utils.json_to_sheet(allData);
  XLSX.utils.book_append_sheet(workbook, wsDetail, 'Chi_Tiet_Nhan_Su');

  XLSX.writeFile(workbook, `Bao_Cao_Thong_Ke_ATGT_Suoi_Lu_${getTodaySuffix()}.xlsx`);
}

function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
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
}

function getTodaySuffix(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}${month}${year}`;
}
