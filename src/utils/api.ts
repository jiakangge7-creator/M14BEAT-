import { AppDatabase, LinkItem, Category, FileItem, SearchEngine, SiteConfig, UrlMetaData } from '../types';

const TOKEN_KEY = 'omninav_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function fetchSiteData(): Promise<Omit<AppDatabase, 'adminPasswordHash'>> {
  const res = await fetch('/api/data');
  if (!res.ok) {
    throw new Error('获取数据失败');
  }
  return res.json();
}

export async function recordLinkClick(id: string): Promise<void> {
  try {
    await fetch(`/api/links/click/${id}`, { method: 'POST' });
  } catch (err) {
    console.warn('Record click failed:', err);
  }
}

export async function adminLogin(password: string): Promise<string> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '登录失败');
  }
  setAdminToken(data.token);
  return data.token;
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return !!data.valid;
  } catch {
    return false;
  }
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<string> {
  const token = getAdminToken();
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '修改密码失败');
  }
  return data.message;
}

export async function saveCategory(category: Category): Promise<Category[]> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '保存分类失败');
  }
  return data.categories;
}

export async function deleteCategory(id: string): Promise<Category[]> {
  const token = getAdminToken();
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '删除分类失败');
  }
  return data.categories;
}

export async function saveLink(link: Partial<LinkItem>): Promise<LinkItem[]> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(link),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '保存链接失败');
  }
  return data.links;
}

export async function deleteLink(id: string): Promise<LinkItem[]> {
  const token = getAdminToken();
  const res = await fetch(`/api/admin/links/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '删除链接失败');
  }
  return data.links;
}

export async function saveSearchEngines(searchEngines: SearchEngine[]): Promise<SearchEngine[]> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/search-engines', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ searchEngines }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '保存搜索引擎失败');
  }
  return data.searchEngines;
}

export async function saveSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(config),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '保存站点配置失败');
  }
  return data.config;
}

export async function saveFileItem(fileItem: Partial<FileItem>): Promise<FileItem[]> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fileItem),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '保存文件项失败');
  }
  return data.files;
}

export async function deleteFileItem(id: string): Promise<FileItem[]> {
  const token = getAdminToken();
  const res = await fetch(`/api/admin/files/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '删除文件失败');
  }
  return data.files;
}

export async function uploadFile(
  file: File
): Promise<{ fileUrl: string; filename: string; fileSize: string; fileType: string }> {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '上传文件失败');
  }
  return data;
}

export async function autoFetchUrlMeta(url: string): Promise<UrlMetaData> {
  const res = await fetch(`/api/tools/fetch-meta?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '自动提取网页元信息失败');
  }
  return data;
}

export async function importBackup(jsonData: any): Promise<void> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/backup/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jsonData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '导入备份失败');
  }
}
