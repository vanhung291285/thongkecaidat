export type Position = 'Quản lí' | 'Giáo viên' | 'Nhân viên';

export interface Staff {
  id: string;
  ho_ten: string;
  ma_can_bo: string;
  chuc_vu: Position;
  bo_phan: string;
  da_cai_dat: boolean;
  ngay_cai_dat?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type StatusFilter = 'all' | 'installed' | 'not_installed';
export type PositionFilter = 'all' | Position;

export interface RoleStat {
  chuc_vu: Position;
  tong_so: number;
  da_cai_dat: number;
  chua_cai_dat: number;
  ty_le: number; // Percentage float 0-100
}

export interface OverallStats {
  tong_so: number;
  da_cai_dat: number;
  chua_cai_dat: number;
  ty_le: number;
  roleStats: RoleStat[];
}

export interface ImportResult {
  successCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: string[];
}
