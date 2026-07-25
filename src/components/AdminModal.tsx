import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Plus,
  Trash2,
  Edit,
  Save,
  Wrench,
  Globe,
  Layers,
  HardDrive,
  Search,
  Key,
  Download,
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Star,
  ExternalLink,
} from 'lucide-react';
import {
  AppDatabase,
  LinkItem,
  Category,
  FileItem,
  SearchEngine,
  SiteConfig,
} from '../types';
import {
  adminLogin,
  changePassword,
  saveCategory,
  deleteCategory,
  saveLink,
  deleteLink,
  saveSearchEngines,
  saveSiteConfig,
  saveFileItem,
  deleteFileItem,
  uploadFile,
  autoFetchUrlMeta,
  importBackup,
} from '../utils/api';
import { DynamicIcon } from './DynamicIcon';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  siteData: Omit<AppDatabase, 'adminPasswordHash'>;
  onDataRefresh: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  onLoginSuccess,
  siteData,
  onDataRefresh,
}) => {
  // Login form state
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'links' | 'categories' | 'files' | 'search' | 'site' | 'security'
  >('links');

  // Status notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Link Form State (Add / Edit)
  const [editingLink, setEditingLink] = useState<Partial<LinkItem> | null>(null);
  const [autoFetchUrl, setAutoFetchUrl] = useState<string>('');
  const [isFetchingUrl, setIsFetchingUrl] = useState<boolean>(false);

  // Category Form State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // File Form State
  const [editingFile, setEditingFile] = useState<Partial<FileItem> | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);

  // Search Engine Form State
  const [enginesList, setEnginesList] = useState<SearchEngine[]>([]);

  // Site Config Form State
  const [configForm, setConfigForm] = useState<SiteConfig>(siteData.config);

  // Password change state
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  useEffect(() => {
    if (siteData.searchEngines) {
      setEnginesList(siteData.searchEngines);
    }
    if (siteData.config) {
      setConfigForm(siteData.config);
    }
  }, [siteData]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!isOpen) return null;

  /* ================= LOGIN FORM ================= */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await adminLogin(password);
      setPassword('');
      onLoginSuccess();
      showToast('登录成功！欢迎进入后台配置', 'success');
    } catch (err: any) {
      setLoginError(err.message || '登录密码错误');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
          
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white">
            管理员登录验证
          </h2>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1 mb-6">
            默认初始密码：<code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">admin123</code> (后续可在安全设置中修改)
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入后台管理员密码"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                autoFocus
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : '立即解锁后台'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ================= AUTO FETCH URL META ================= */
  const handleAutoFetchUrl = async () => {
    if (!autoFetchUrl.trim()) return;
    setIsFetchingUrl(true);
    try {
      const meta = await autoFetchUrlMeta(autoFetchUrl);
      setEditingLink((prev) => ({
        ...prev,
        title: meta.title || prev?.title || '',
        description: meta.description || prev?.description || '',
        url: autoFetchUrl.startsWith('http') ? autoFetchUrl : 'https://' + autoFetchUrl,
        icon: meta.faviconUrl || prev?.icon || '',
      }));
      showToast('自动抓取网页元信息成功！', 'success');
    } catch (err: any) {
      showToast('抓取信息失败，请尝试手动填写', 'error');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  /* ================= LINK SAVE & DELETE ================= */
  const handleSaveLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink?.title || !editingLink?.url) {
      showToast('标题和 URL 不能为空', 'error');
      return;
    }
    try {
      await saveLink(editingLink);
      setEditingLink(null);
      setAutoFetchUrl('');
      onDataRefresh();
      showToast('网址保存成功！', 'success');
    } catch (err: any) {
      showToast(err.message || '保存网址失败', 'error');
    }
  };

  const handleDeleteLinkItem = async (id: string) => {
    if (!confirm('确定要删除该网址导航吗？')) return;
    try {
      await deleteLink(id);
      onDataRefresh();
      showToast('网址已成功删除', 'success');
    } catch (err: any) {
      showToast('删除失败', 'error');
    }
  };

  /* ================= CATEGORY SAVE & DELETE ================= */
  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      showToast('分类名称不能为空', 'error');
      return;
    }
    try {
      await saveCategory(editingCategory as Category);
      setEditingCategory(null);
      onDataRefresh();
      showToast('分类保存成功！', 'success');
    } catch (err: any) {
      showToast('保存分类失败', 'error');
    }
  };

  const handleDeleteCategoryItem = async (id: string) => {
    if (!confirm('确定要删除该分类吗？其下的网址将归为未分类。')) return;
    try {
      await deleteCategory(id);
      onDataRefresh();
      showToast('分类已成功删除', 'success');
    } catch (err: any) {
      showToast('删除失败', 'error');
    }
  };

  /* ================= FILE ITEM UPLOAD & SAVE ================= */
  const handleFileUploadInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const uploadRes = await uploadFile(file);
      setEditingFile((prev) => ({
        ...prev,
        title: prev?.title || file.name,
        filename: uploadRes.filename,
        filePath: uploadRes.fileUrl,
        fileSize: uploadRes.fileSize,
        fileType: uploadRes.fileType,
        isExternalUrl: false,
      }));
      showToast('物理文件上传成功！', 'success');
    } catch (err: any) {
      showToast('上传失败：' + err.message, 'error');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSaveFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile?.title || !editingFile?.filePath) {
      showToast('文件标题与访问路径不能为空', 'error');
      return;
    }
    try {
      await saveFileItem(editingFile);
      setEditingFile(null);
      onDataRefresh();
      showToast('文件项保存成功！', 'success');
    } catch (err: any) {
      showToast('保存文件失败', 'error');
    }
  };

  const handleDeleteFileItem = async (id: string) => {
    if (!confirm('确定删除该文件吗？')) return;
    try {
      await deleteFileItem(id);
      onDataRefresh();
      showToast('文件已成功删除', 'success');
    } catch (err: any) {
      showToast('删除文件失败', 'error');
    }
  };

  /* ================= SITE CONFIG SAVE ================= */
  const handleSaveSiteConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSiteConfig(configForm);
      onDataRefresh();
      showToast('站点设置已更新！', 'success');
    } catch (err: any) {
      showToast('保存失败', 'error');
    }
  };

  /* ================= PASSWORD CHANGE ================= */
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const msg = await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      showToast(msg, 'success');
    } catch (err: any) {
      showToast(err.message || '修改密码失败', 'error');
    }
  };

  /* ================= BACKUP IMPORT / EXPORT ================= */
  const handleExportBackup = () => {
    window.open('/api/admin/backup/export', '_blank');
  };

  const handleImportBackupInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await importBackup(json);
        onDataRefresh();
        showToast('备份还原成功！', 'success');
      } catch (err: any) {
        showToast('备份格式不正确或解析失败', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                后台管理控制面板
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                适配手机/电脑触控，轻松修改导航分类、网址、资源文件与站点属性
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsive Mobile / Desktop Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'links'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" /> 网址导航管理
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> 分类目录管理
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'files'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-4 h-4" /> 文件资源管理
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'search'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" /> 搜索引擎配置
          </button>
          <button
            onClick={() => setActiveTab('site')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'site'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" /> 站点与外观设置
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" /> 安全密码与备份
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* ================= TAB 1: LINKS MANAGEMENT ================= */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              
              {/* Quick Auto Fetch tool on mobile / bed */}
              <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>手机卧床极速填单：粘贴目标网址，一键自动提取网页标题、图标与描述！</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="url"
                    value={autoFetchUrl}
                    onChange={(e) => setAutoFetchUrl(e.target.value)}
                    placeholder="粘贴如 https://github.com 网址..."
                    className="w-full flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAutoFetchUrl}
                    disabled={isFetchingUrl}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isFetchingUrl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>一键抓取并填充</span>
                  </button>
                </div>
              </div>

              {/* Add / Edit Link Form */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                  <span>{editingLink?.id ? '编辑网址导航' : '新增网址导航'}</span>
                  {editingLink && (
                    <button
                      onClick={() => setEditingLink(null)}
                      className="text-xs text-slate-500 hover:text-slate-700 underline"
                    >
                      清空表单
                    </button>
                  )}
                </h3>

                <form onSubmit={handleSaveLinkSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        网址名称 *
                      </label>
                      <input
                        type="text"
                        value={editingLink?.title || ''}
                        onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                        placeholder="例如：GitHub 开发者社区"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        目标 URL *
                      </label>
                      <input
                        type="url"
                        value={editingLink?.url || ''}
                        onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                        placeholder="例如：https://github.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        所属分类
                      </label>
                      <select
                        value={editingLink?.categoryId || siteData.categories[0]?.id || ''}
                        onChange={(e) => setEditingLink({ ...editingLink, categoryId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {siteData.categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        图标 (Lucide名称 或 favicon网址)
                      </label>
                      <input
                        type="text"
                        value={editingLink?.icon || ''}
                        onChange={(e) => setEditingLink({ ...editingLink, icon: e.target.value })}
                        placeholder="例如：Code / Bot / 或 Favicon URL"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        标签 (多个用逗号隔开)
                      </label>
                      <input
                        type="text"
                        value={editingLink?.tags?.join(', ') || ''}
                        onChange={(e) =>
                          setEditingLink({
                            ...editingLink,
                            tags: e.target.value.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
                          })
                        }
                        placeholder="例如：开发, 开源"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      简介说明
                    </label>
                    <input
                      type="text"
                      value={editingLink?.description || ''}
                      onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                      placeholder="一句话简要说明该网站的用途..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editingLink?.isPinned}
                        onChange={(e) => setEditingLink({ ...editingLink, isPinned: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span>置顶显示在首页推荐中</span>
                    </label>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingLink?.id ? '更新网址' : '保存新增网址'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Links List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  已添加的网址列表 ({siteData.links.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {siteData.links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <DynamicIcon name={link.icon || 'Globe'} className="w-5 h-5 text-indigo-500 shrink-0" size={20} />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1">
                            <span>{link.title}</span>
                            {link.isPinned && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{link.url}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingLink(link)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLinkItem(link.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: CATEGORIES MANAGEMENT ================= */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              
              {/* Category Add/Edit Form */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  {editingCategory?.id ? '编辑分类' : '新增导航分类'}
                </h3>

                <form onSubmit={handleSaveCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        分类名称 *
                      </label>
                      <input
                        type="text"
                        value={editingCategory?.name || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        placeholder="例如：常用推荐"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Lucide 图标名
                      </label>
                      <input
                        type="text"
                        value={editingCategory?.icon || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        placeholder="例如：Sparkles / Code / Palette"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        排序权重 (数值越小越靠前)
                      </label>
                      <input
                        type="number"
                        value={editingCategory?.order ?? 1}
                        onChange={(e) => setEditingCategory({ ...editingCategory, order: parseInt(e.target.value) || 1 })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      分类描述
                    </label>
                    <input
                      type="text"
                      value={editingCategory?.description || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      placeholder="分类补充说明..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
                      >
                        取消
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>保存分类</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Categories Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  所有分类 ({siteData.categories.length})
                </h3>

                <div className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {siteData.categories.map((cat) => (
                    <div key={cat.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <DynamicIcon name={cat.icon} className="w-5 h-5 text-indigo-500" size={20} />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {cat.name} <span className="text-[10px] text-slate-400">(排序: {cat.order})</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{cat.description || '无说明'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategoryItem(cat.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 3: FILES MANAGEMENT ================= */}
          {activeTab === 'files' && (
            <div className="space-y-6">
              
              {/* File Form & Upload */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  {editingFile?.id ? '编辑文件数据' : '上传并发布新文件资源'}
                </h3>

                <form onSubmit={handleSaveFileSubmit} className="space-y-4">
                  
                  {/* File Upload Trigger */}
                  <div className="p-4 border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 rounded-2xl bg-white dark:bg-slate-900 text-center">
                    <input
                      type="file"
                      id="admin-file-input"
                      onChange={handleFileUploadInput}
                      className="hidden"
                    />
                    <label
                      htmlFor="admin-file-input"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        {isUploadingFile ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {isUploadingFile ? '文件上传中，请稍候...' : '点击选择手机/电脑物理文件上传 (最大 100MB)'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        支持 ZIP, APK, PDF, DOC, PNG, JPG, EXE, TXT 等各种格式
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        文件展示标题 *
                      </label>
                      <input
                        type="text"
                        value={editingFile?.title || ''}
                        onChange={(e) => setEditingFile({ ...editingFile, title: e.target.value })}
                        placeholder="例如：2026全平台效率快捷键指南.pdf"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        下载访问路径或云盘链接 *
                      </label>
                      <input
                        type="text"
                        value={editingFile?.filePath || ''}
                        onChange={(e) => setEditingFile({ ...editingFile, filePath: e.target.value })}
                        placeholder="自动填写或输入外链URL"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        大小标识
                      </label>
                      <input
                        type="text"
                        value={editingFile?.fileSize || '1.0 MB'}
                        onChange={(e) => setEditingFile({ ...editingFile, fileSize: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        类型后缀 (如 ZIP, PDF)
                      </label>
                      <input
                        type="text"
                        value={editingFile?.fileType || 'FILE'}
                        onChange={(e) => setEditingFile({ ...editingFile, fileType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        标签 (逗号隔开)
                      </label>
                      <input
                        type="text"
                        value={editingFile?.tags?.join(', ') || ''}
                        onChange={(e) =>
                          setEditingFile({
                            ...editingFile,
                            tags: e.target.value.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
                          })
                        }
                        placeholder="如：文档, 工具"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      说明描述
                    </label>
                    <input
                      type="text"
                      value={editingFile?.description || ''}
                      onChange={(e) => setEditingFile({ ...editingFile, description: e.target.value })}
                      placeholder="关于该文件内容的简要说明..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {editingFile && (
                      <button
                        type="button"
                        onClick={() => setEditingFile(null)}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
                      >
                        清空
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingFile?.id ? '更新文件' : '发布保存'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Files List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  资源下载列表 ({siteData.files.length})
                </h3>

                <div className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {siteData.files.map((file) => (
                    <div key={file.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <HardDrive className="w-5 h-5 text-indigo-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {file.title}{' '}
                            <span className="text-[10px] text-slate-400 font-mono">({file.fileSize})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{file.filePath}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingFile(file)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFileItem(file.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 4: SEARCH ENGINES ================= */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  自定义全网搜索引擎
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  使用 %s 代表搜索关键词 URL 变量，例如：<code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">https://www.baidu.com/s?wd=%s</code>
                </p>

                <div className="space-y-3">
                  {enginesList.map((engine, idx) => (
                    <div key={engine.id || idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={engine.name}
                        onChange={(e) => {
                          const updated = [...enginesList];
                          updated[idx].name = e.target.value;
                          setEnginesList(updated);
                        }}
                        placeholder="引擎名称"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-transparent dark:text-white"
                      />
                      <input
                        type="text"
                        value={engine.url}
                        onChange={(e) => {
                          const updated = [...enginesList];
                          updated[idx].url = e.target.value;
                          setEnginesList(updated);
                        }}
                        placeholder="URL pattern (%s)"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-transparent dark:text-white font-mono sm:col-span-2"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() =>
                      setEnginesList([
                        ...enginesList,
                        { id: 'engine_' + Date.now(), name: '自定义引擎', url: 'https://search.yahoo.com/search?p=%s', icon: 'Search' },
                      ])
                    }
                    className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> 增加搜索引擎
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await saveSearchEngines(enginesList);
                        onDataRefresh();
                        showToast('搜索引擎列表已成功保存！', 'success');
                      } catch {
                        showToast('保存搜索引擎失败', 'error');
                      }
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>保存搜索引擎配置</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: SITE & APPEARANCE CONFIG ================= */}
          {activeTab === 'site' && (
            <div className="space-y-6">
              <form onSubmit={handleSaveSiteConfigSubmit} className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  站点标题与外观模式
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      站点主标题
                    </label>
                    <input
                      type="text"
                      value={configForm.title}
                      onChange={(e) => setConfigForm({ ...configForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      副标题 / 口号
                    </label>
                    <input
                      type="text"
                      value={configForm.subtitle}
                      onChange={(e) => setConfigForm({ ...configForm, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    顶部公告跑马灯消息 (留空则隐藏)
                  </label>
                  <input
                    type="text"
                    value={configForm.announcement || ''}
                    onChange={(e) => setConfigForm({ ...configForm, announcement: e.target.value })}
                    placeholder="顶部公告通告内容..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    自定义壁纸图片 URL (可选)
                  </label>
                  <input
                    type="text"
                    value={configForm.customBackgroundUrl || ''}
                    onChange={(e) => setConfigForm({ ...configForm, customBackgroundUrl: e.target.value })}
                    placeholder="输入高清大图 URL (例如 Unsplash 图片地址)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>保存站点外观配置</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 6: SECURITY & BACKUP ================= */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* Change Password Form */}
              <form onSubmit={handleChangePasswordSubmit} className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" /> 修改管理员登录密码
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      原密码
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      新密码
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={4}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  <span>更新密码</span>
                </button>
              </form>

              {/* Backup & Restore Panel */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-500" /> 数据备份与恢复 (JSON)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  导出所有网址导航、分类目录、搜索引擎与上传文件元数据，可用于随时迁移或恢复全站。
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleExportBackup}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> 导出 JSON 完整备份
                  </button>

                  <label className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> 导入恢复 JSON 备份
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackupInput}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
