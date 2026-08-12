import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Staff } from '../types';
import { INITIAL_SUOI_LU_STAFF } from './initialData';

const LOCAL_STORAGE_STAFF_KEY = 'suoilu_atgt_staff_v2';
const SUPABASE_CONFIG_KEY = 'suoilu_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function isValidUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey && isValidUrl(parsed.url)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved Supabase config:', e);
  }

  return { url: envUrl, anonKey: envKey };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
}

let cachedClient: SupabaseClient | null = null;
let currentConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey || !isValidUrl(config.url)) {
    return null;
  }

  const key = `${config.url}_${config.anonKey}`;
  if (!cachedClient || currentConfigKey !== key) {
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } },
      });
      currentConfigKey = key;
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      return null;
    }
  }
  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  const config = getStoredSupabaseConfig();
  return Boolean(config.url && config.anonKey && isValidUrl(config.url));
}

// Local Storage Fallback helpers
export function getLocalStaff(): Staff[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_STAFF_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading local staff:', e);
  }
  // Default to empty array as requested
  const defaultStaff: Staff[] = [];
  localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(defaultStaff));
  return defaultStaff;
}

export function saveLocalStaff(staff: Staff[]): void {
  localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(staff));
}

// Fetch staff from Supabase (or fallback to Local Storage)
export async function fetchAllStaff(): Promise<{ data: Staff[]; isConnected: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: getLocalStaff(), isConnected: false };
  }

  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch error, using local fallback:', error.message);
      return { data: getLocalStaff(), isConnected: false, error: error.message };
    }

    if (!data || data.length === 0) {
      saveLocalStaff([]);
      return { data: [], isConnected: true };
    }

    // Standardize positions if any discrepancies exist
    const sanitizedData = (data || []).map((item: any) => ({
      id: String(item.id),
      ho_ten: item.ho_ten || '',
      ma_can_bo: item.ma_can_bo || '',
      chuc_vu: sanitizePosition(item.chuc_vu),
      bo_phan: item.bo_phan || 'Khác',
      da_cai_dat: Boolean(item.da_cai_dat),
      ngay_cai_dat: item.ngay_cai_dat || null,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    }));

    // Sync to local storage backup
    saveLocalStaff(sanitizedData);
    return { data: sanitizedData, isConnected: true };
  } catch (err: any) {
    console.error('Failed to fetch from Supabase:', err);
    return { data: getLocalStaff(), isConnected: false, error: err?.message || 'Lỗi kết nối Supabase' };
  }
}

function sanitizePosition(pos: string): 'Quản lí' | 'Giáo viên' | 'Nhân viên' {
  if (!pos) return 'Giáo viên';
  const lower = pos.toLowerCase();
  if (lower.includes('quản') || lower.includes('quan')) return 'Quản lí';
  if (lower.includes('nhân') || lower.includes('nhan')) return 'Nhân viên';
  return 'Giáo viên';
}

async function seedInitialSupabaseData(supabase: SupabaseClient): Promise<Staff[]> {
  try {
    const seedPayload = INITIAL_SUOI_LU_STAFF.map((s) => ({
      ho_ten: s.ho_ten,
      ma_can_bo: s.ma_can_bo,
      chuc_vu: s.chuc_vu,
      bo_phan: s.bo_phan,
      da_cai_dat: s.da_cai_dat,
      ngay_cai_dat: s.ngay_cai_dat,
    }));

    const { data, error } = await supabase.from('staff').insert(seedPayload).select('*');
    if (error) {
      console.error('Error seeding data:', error);
      return [];
    }
    return (data || []).map((item: any) => ({
      id: String(item.id),
      ho_ten: item.ho_ten,
      ma_can_bo: item.ma_can_bo,
      chuc_vu: item.chuc_vu,
      bo_phan: item.bo_phan,
      da_cai_dat: item.da_cai_dat,
      ngay_cai_dat: item.ngay_cai_dat,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  } catch (e) {
    console.error('Seed exception:', e);
    return [];
  }
}

// Update single staff status
export async function updateStaffInstallationStatus(
  id: string,
  daCaiDat: boolean
): Promise<{ success: boolean; staff?: Staff; error?: string }> {
  const ngayCaiDat = daCaiDat ? new Date().toISOString() : null;
  const updatedAt = new Date().toISOString();

  const supabase = getSupabaseClient();
  if (!supabase) {
    // Local storage fallback
    const local = getLocalStaff();
    const index = local.findIndex((s) => s.id === id);
    if (index !== -1) {
      local[index].da_cai_dat = daCaiDat;
      local[index].ngay_cai_dat = ngayCaiDat;
      local[index].updated_at = updatedAt;
      saveLocalStaff(local);
      return { success: true, staff: local[index] };
    }
    return { success: false, error: 'Không tìm thấy cán bộ' };
  }

  try {
    const { data, error } = await supabase
      .from('staff')
      .update({
        da_cai_dat: daCaiDat,
        ngay_cai_dat: ngayCaiDat,
        updated_at: updatedAt,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      // Fallback update locally if network fails
      const local = getLocalStaff();
      const idx = local.findIndex((s) => s.id === id);
      if (idx !== -1) {
        local[idx].da_cai_dat = daCaiDat;
        local[idx].ngay_cai_dat = ngayCaiDat;
        saveLocalStaff(local);
      }
      return { success: false, error: error.message };
    }

    const updatedStaff: Staff = {
      id: String(data.id),
      ho_ten: data.ho_ten,
      ma_can_bo: data.ma_can_bo,
      chuc_vu: sanitizePosition(data.chuc_vu),
      bo_phan: data.bo_phan,
      da_cai_dat: Boolean(data.da_cai_dat),
      ngay_cai_dat: data.ngay_cai_dat,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, staff: updatedStaff };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi cập nhật Supabase' };
  }
}

// Add new staff
export async function addStaff(
  staffData: Omit<Staff, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; staff?: Staff; error?: string }> {
  const supabase = getSupabaseClient();
  const payload = {
    ho_ten: staffData.ho_ten.trim(),
    ma_can_bo: staffData.ma_can_bo.trim(),
    chuc_vu: staffData.chuc_vu,
    bo_phan: staffData.bo_phan.trim(),
    da_cai_dat: Boolean(staffData.da_cai_dat),
    ngay_cai_dat: staffData.da_cai_dat ? new Date().toISOString() : null,
  };

  if (!supabase) {
    const local = getLocalStaff();
    const newStaff: Staff = {
      ...payload,
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    local.push(newStaff);
    saveLocalStaff(local);
    return { success: true, staff: newStaff };
  }

  try {
    const { data, error } = await supabase.from('staff').insert(payload).select('*').single();

    if (error) {
      return { success: false, error: error.message };
    }

    const createdStaff: Staff = {
      id: String(data.id),
      ho_ten: data.ho_ten,
      ma_can_bo: data.ma_can_bo,
      chuc_vu: sanitizePosition(data.chuc_vu),
      bo_phan: data.bo_phan,
      da_cai_dat: Boolean(data.da_cai_dat),
      ngay_cai_dat: data.ngay_cai_dat,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, staff: createdStaff };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi thêm mới nhân sự' };
  }
}

// Edit existing staff
export async function updateStaffInfo(
  id: string,
  staffData: Partial<Omit<Staff, 'id'>>
): Promise<{ success: boolean; staff?: Staff; error?: string }> {
  const supabase = getSupabaseClient();
  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (staffData.ho_ten !== undefined) payload.ho_ten = staffData.ho_ten.trim();
  if (staffData.ma_can_bo !== undefined) payload.ma_can_bo = staffData.ma_can_bo.trim();
  if (staffData.chuc_vu !== undefined) payload.chuc_vu = staffData.chuc_vu;
  if (staffData.bo_phan !== undefined) payload.bo_phan = staffData.bo_phan.trim();
  if (staffData.da_cai_dat !== undefined) {
    payload.da_cai_dat = staffData.da_cai_dat;
    payload.ngay_cai_dat = staffData.da_cai_dat ? new Date().toISOString() : null;
  }

  if (!supabase) {
    const local = getLocalStaff();
    const idx = local.findIndex((s) => s.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...payload };
      saveLocalStaff(local);
      return { success: true, staff: local[idx] };
    }
    return { success: false, error: 'Không tìm thấy cán bộ' };
  }

  try {
    const { data, error } = await supabase.from('staff').update(payload).eq('id', id).select('*').single();

    if (error) {
      return { success: false, error: error.message };
    }

    const updated: Staff = {
      id: String(data.id),
      ho_ten: data.ho_ten,
      ma_can_bo: data.ma_can_bo,
      chuc_vu: sanitizePosition(data.chuc_vu),
      bo_phan: data.bo_phan,
      da_cai_dat: Boolean(data.da_cai_dat),
      ngay_cai_dat: data.ngay_cai_dat,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, staff: updated };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi cập nhật nhân sự' };
  }
}

// Delete staff
export async function deleteStaff(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const local = getLocalStaff().filter((s) => s.id !== id);
    saveLocalStaff(local);
    return { success: true };
  }

  try {
    const { error } = await supabase.from('staff').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi xóa nhân sự' };
  }
}

// Bulk insert for Excel Import
export async function bulkInsertStaff(
  items: Omit<Staff, 'id' | 'created_at' | 'updated_at'>[]
): Promise<{ success: boolean; insertedCount: number; error?: string }> {
  const supabase = getSupabaseClient();

  const formattedItems = items.map((s) => ({
    ho_ten: s.ho_ten.trim(),
    ma_can_bo: s.ma_can_bo.trim(),
    chuc_vu: sanitizePosition(s.chuc_vu),
    bo_phan: s.bo_phan.trim(),
    da_cai_dat: Boolean(s.da_cai_dat),
    ngay_cai_dat: s.da_cai_dat ? new Date().toISOString() : null,
  }));

  if (!supabase) {
    const local = getLocalStaff();
    const newEntries: Staff[] = formattedItems.map((item) => ({
      ...item,
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    const combined = [...local, ...newEntries];
    saveLocalStaff(combined);
    return { success: true, insertedCount: newEntries.length };
  }

  try {
    const { data, error } = await supabase.from('staff').insert(formattedItems).select('*');

    if (error) {
      return { success: false, insertedCount: 0, error: error.message };
    }

    return { success: true, insertedCount: data ? data.length : formattedItems.length };
  } catch (err: any) {
    return { success: false, insertedCount: 0, error: err?.message || 'Lỗi nhập dữ liệu Excel' };
  }
}

// Bulk Reset all installation status to false
export async function resetAllInstallationStatus(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const local = getLocalStaff().map((s) => ({
      ...s,
      da_cai_dat: false,
      ngay_cai_dat: null,
      updated_at: new Date().toISOString(),
    }));
    saveLocalStaff(local);
    return { success: true };
  }

  try {
    const { error } = await supabase.from('staff').update({
      da_cai_dat: false,
      ngay_cai_dat: null,
      updated_at: new Date().toISOString(),
    }).neq('id', '00000000-0000-0000-0000-000000000000'); // target all rows

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi đặt lại trạng thái' };
  }
}

// SQL string for Supabase Table setup
export const SUPABASE_SQL_SETUP_SCRIPT = `-- SQL script tạo bảng staff cho TRƯỜNG PTDTBT TH&THCS SUỐI LƯ
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ho_ten TEXT NOT NULL,
  ma_can_bo TEXT UNIQUE,
  chuc_vu TEXT NOT NULL CHECK (chuc_vu IN ('Quản lí', 'Giáo viên', 'Nhân viên')),
  bo_phan TEXT NOT NULL,
  da_cai_dat BOOLEAN NOT NULL DEFAULT false,
  ngay_cai_dat TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách truy cập công khai (Cho phép xem, thêm, sửa, xóa)
DROP POLICY IF EXISTS "Allow public read staff" ON public.staff;
CREATE POLICY "Allow public read staff" ON public.staff FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert staff" ON public.staff;
CREATE POLICY "Allow public insert staff" ON public.staff FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update staff" ON public.staff;
CREATE POLICY "Allow public update staff" ON public.staff FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete staff" ON public.staff;
CREATE POLICY "Allow public delete staff" ON public.staff FOR DELETE USING (true);

-- Bật tính năng Supabase Realtime cho bảng staff
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
`;
