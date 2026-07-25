import { AppDatabase } from '../types';

export const defaultData: AppDatabase = {
  adminPasswordHash: 'admin123', // Default admin password
  config: {
    title: 'M14BEAT导航',
    subtitle: '多端智能识别极速网址导航与文件服务站',
    announcement: '✨ 欢迎使用 M14BEAT 导航！多端智能适配，点击页脚或右上角进行后台管理配置。',
    logoIcon: 'Compass',
    footerText: '© 2026 M14BEAT导航. All rights reserved.',
    defaultSearchEngineId: 'bing',
    customBackgroundUrl: '',
    allowPublicUpload: false,
  },
  categories: [
    { id: 'cat-common', name: '常用推荐', icon: 'Sparkles', order: 1, description: '常用高效网站 navigation' },
    { id: 'cat-tech', name: '开发编程', icon: 'Code', order: 2, description: '代码托管、AI 助手与技术社区' },
    { id: 'cat-design', name: '设计灵感', icon: 'Palette', order: 3, description: 'UI/UX 资源、配色方案与素材库' },
    { id: 'cat-media', name: '影音娱乐', icon: 'Film', order: 4, description: '视频弹幕、音乐与资讯社群' },
    { id: 'cat-tools', name: '实用工具', icon: 'Wrench', order: 5, description: '转换器、格式化与生产力工具' },
    { id: 'cat-files', name: '文件与资源', icon: 'Download', order: 6, description: '实用软件、文档包与离线资源' },
  ],
  searchEngines: [
    { id: 'bing', name: '必应 Bing', url: 'https://cn.bing.com/search?q=%s', icon: 'Search', placeholder: '微软必应搜索...' },
    { id: 'baidu', name: '百度 Baidu', url: 'https://www.baidu.com/s?wd=%s', icon: 'Globe', placeholder: '百度一下...' },
    { id: 'google', name: '谷歌 Google', url: 'https://www.google.com/search?q=%s', icon: 'Search', placeholder: 'Google Search...' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=%s', icon: 'Github', placeholder: '搜索开源仓库...' },
    { id: 'bilibili', name: '哔哩哔哩', url: 'https://search.bilibili.com/all?keyword=%s', icon: 'Tv', placeholder: '搜索 bilibili 视频...' },
  ],
  links: [], // Default navigation links deleted as requested by owner
  files: [], // Default files deleted as requested by owner
};
