import React, { useState } from 'react';
import { Download, FileText, FileArchive, FileCode, FileImage, File, Search, Plus, Eye, Edit, Trash2, HardDrive, ExternalLink } from 'lucide-react';
import { FileItem } from '../types';

interface FileSectionProps {
  files: FileItem[];
  isAdmin: boolean;
  onDownloadFile: (file: FileItem) => void;
  onAddFileClick?: () => void;
  onEditFile?: (file: FileItem) => void;
  onDeleteFile?: (id: string) => void;
}

export const FileSection: React.FC<FileSectionProps> = ({
  files,
  isAdmin,
  onDownloadFile,
  onAddFileClick,
  onEditFile,
  onDeleteFile,
}) => {
  const [fileSearchTerm, setFileSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract all unique tags
  const allTags = Array.from(new Set(files.flatMap((f) => f.tags || [])));

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      !fileSearchTerm.trim() ||
      f.title.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(fileSearchTerm.toLowerCase())) ||
      f.filename.toLowerCase().includes(fileSearchTerm.toLowerCase());

    const matchesTag = selectedTag === 'all' || (f.tags && f.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const getFileIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('ZIP') || t.includes('RAR') || t.includes('7Z') || t.includes('TAR')) {
      return <FileArchive className="w-6 h-6 text-amber-500" />;
    }
    if (t.includes('PDF') || t.includes('DOC') || t.includes('TXT')) {
      return <FileText className="w-6 h-6 text-blue-500" />;
    }
    if (t.includes('PNG') || t.includes('JPG') || t.includes('GIF') || t.includes('WEBP')) {
      return <FileImage className="w-6 h-6 text-emerald-500" />;
    }
    if (t.includes('JS') || t.includes('TS') || t.includes('PY') || t.includes('HTML') || t.includes('JSON')) {
      return <FileCode className="w-6 h-6 text-purple-500" />;
    }
    return <File className="w-6 h-6 text-indigo-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Banner / Title Area */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-3">
            <HardDrive className="w-3.5 h-3.5" /> 资源文件仓库
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            云端离线与实用软件文件下载中心
          </h2>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            便捷下载离线安装包、格式化模板、技术文档与多媒体打包资源。支持在线预览与双重镜像通道。
          </p>
        </div>
        
        <HardDrive className="absolute -right-8 -bottom-8 w-64 h-64 text-white/10 pointer-events-none rotate-12" />
      </div>

      {/* Control bar: Search + Tags Filter + Admin Add File button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={fileSearchTerm}
            onChange={(e) => setFileSearchTerm(e.target.value)}
            placeholder="搜索文件名、工具或文档说明..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Tags filter & Add File button */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              selectedTag === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            全部类型
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              #{tag}
            </button>
          ))}

          {/* Admin Add File Button */}
          {isAdmin && onAddFileClick && (
            <button
              onClick={onAddFileClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all shrink-0 ml-2"
            >
              <Plus className="w-4 h-4" /> 上传/添加新文件
            </button>
          )}
        </div>
      </div>

      {/* File Items Grid */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-16 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <HardDrive className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            暂未找到匹配的文件资源
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            建议更换关键词重试{isAdmin ? '，或在右侧点击上传新文件' : ''}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Header: Icon + Title + Size */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-700/80 p-2.5 flex items-center justify-center shrink-0">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {file.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {file.fileType}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {file.fileSize}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEditFile && (
                        <button
                          onClick={() => onEditFile(file)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="编辑文件"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteFile && (
                        <button
                          onClick={() => onDeleteFile(file.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="删除文件"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 my-2 leading-relaxed">
                  {file.description || '暂无说明文件...'}
                </p>
              </div>

              {/* Footer info & Download Trigger */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3 text-slate-400" /> {file.downloads || 0} 次下载
                  </span>
                  <span>
                    {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ''}
                  </span>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => onDownloadFile(file)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载文件</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
