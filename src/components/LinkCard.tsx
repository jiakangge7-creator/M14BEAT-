import React from 'react';
import { ExternalLink, Star, Edit, Trash2, Eye } from 'lucide-react';
import { LinkItem } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface LinkCardProps {
  link: LinkItem;
  onClick: (link: LinkItem) => void;
  isAdmin?: boolean;
  onEdit?: (link: LinkItem) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (link: LinkItem) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  onClick,
  isAdmin = false,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  let hostname = '';
  try {
    hostname = new URL(link.url).hostname.replace('www.', '');
  } catch {
    hostname = link.url;
  }

  // Determine favicon fallback URL if icon isn't explicitly set
  const iconSource = link.icon || `https://${hostname}/favicon.ico`;

  return (
    <div className="group relative bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 flex flex-col justify-between">
      
      {/* Admin Action Menu Floating on top right */}
      {isAdmin && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-1.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          {onTogglePin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(link);
              }}
              className={`p-1 rounded-lg transition-colors ${
                link.isPinned
                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={link.isPinned ? '取消置顶' : '设为置顶'}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(link);
              }}
              className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="编辑该网址"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(link.id);
              }}
              className="p-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="删除该网址"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Clickable Card Container */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          onClick(link);
        }}
        className="block cursor-pointer min-w-0"
      >
        <div className="flex items-start gap-3">
          {/* Icon Box */}
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition-all">
            <DynamicIcon name={iconSource} className="w-6 h-6 text-indigo-600 dark:text-indigo-400" size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 pr-6">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {link.title}
              </h3>
              {link.isPinned && (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" title="置顶推荐" />
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {link.description || '暂无详细说明...'}
            </p>
          </div>
        </div>
      </a>

      {/* Footer Meta & Tags */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        
        {/* Hostname & Clicks */}
        <div className="flex items-center gap-2 truncate">
          <span className="font-mono truncate bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
            {hostname}
          </span>
          {(link.clicks || 0) > 0 && (
            <span className="flex items-center gap-0.5 text-slate-400" title="点击打开总次数">
              <Eye className="w-3 h-3" /> {link.clicks}
            </span>
          )}
        </div>

        {/* Tags */}
        {link.tags && link.tags.length > 0 ? (
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-[10px] font-medium">
              #{link.tags[0]}
            </span>
          </div>
        ) : (
          <ExternalLink className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
        )}
      </div>
    </div>
  );
};
