"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheConfig = void 0;
exports.cacheConfig = {
    'story': { ttl: 1800, namespace: 'sotry', tags: ['stories'] },
    'story:list': { ttl: 300, namespace: 'story', tags: ['stories', 'lists'] },
    'story:feed': { ttl: 300, namespace: 'story', tags: ['stories', 'feed'] },
    'story:trending': { ttl: 300, namespace: 'story', tags: ['stories', 'trending'] },
    'analytics:story': { ttl: 300, namespace: 'analytics', tags: ['analytics', 'stories'] },
    'analytics:dashboard': { ttl: 300, namespace: 'analytics', tags: ['analytics', 'dashboard'] },
    'analytics:publication': { ttl: 300, namespace: 'analytics', tags: ['analytics', 'publications'] },
};
