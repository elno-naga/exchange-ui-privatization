import { routerEnv } from '@/utils';

export default [
  {
    path: `${routerEnv}/`,
    name: 'cotrade',
    meta: {
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      pageTitle: 'select', // header
    },
    component: () => import('@/views/contract/index.vue'),
  },
  {
    path: `${routerEnv}/trade/:symbol`,
    name: 'cotrade',
    meta: {
      activeName: 'coTrade',
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      pageTitle: 'select', // header
    },
    component: () => import('@/views/contract/index.vue'),
  },
  {
    path: `${routerEnv}/trade`,
    name: 'cotrade',
    meta: {
      activeName: 'coTrade',
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      pageTitle: 'select', // header
    },
    component: () => import('@/views/contract/index.vue'),
  },
  {
    path: `${routerEnv}/proSwap/:symbol`,
    name: 'cotrade',
    meta: {
      activeName: 'coTrade',
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      pageTitle: 'select', // header
    },
    component: () => import('@/views/contract/index.vue'),
  },
  {
    path: `${routerEnv}/proSwap`,
    name: 'cotrade',
    meta: {
      activeName: 'coTrade',
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      pageTitle: 'select', // header
    },
    component: () => import('@/views/contract/index.vue'),
  },
  {
    path: `${routerEnv}/futuresData`,
    name: 'futuresData',
    meta: {
      activeName: 'coTrade',
      footNotMrgin: true,
      pageTitle: 'select',
    },
    component: () => import('@/views/futuresData/futuresData.vue'),
  },
  {
    path: '*',
    component: () => import('@/views/404/404.vue'),
  },
];
