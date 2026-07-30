// 小悦工作台 Service Worker - 离线缓存
const CACHE_NAME = 'xiaoyue-workbench-v15';
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/desktop.svg',
  './icons/todo.svg',
  './icons/money.svg',
  './icons/diet.svg',
  './icons/schedule.svg',
  './icons/memory.svg',
  './icons/diary.svg',
  './icons/period.svg',
  './icons/settings.svg'
];

// 安装时缓存核心文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// 离线优先策略：缓存命中直接返回，否则请求并缓存
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // 只缓存同源响应
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // 离线时返回缓存首页
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
