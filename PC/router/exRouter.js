import { routerEnv } from '@/utils';

export default [
  // 杠杆交易
  {
    path: `${routerEnv}/margin/:symbol`,
    name: 'margin',
    meta: {
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      activeName: 'marginTrade',
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/newLever/index.vue'),
  },
  {
    path: `${routerEnv}/margin`,
    name: 'margin',
    meta: {
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      activeName: 'marginTrade',
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/newLever/index.vue'),
  },
  // 杠杆交易专业版
  {
    path: `${routerEnv}/proTradeMargin/:symbol`,
    name: 'margin',
    meta: {
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      activeName: 'proTradeMargin',
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/newLever/proTrade.vue'),
  },
  {
    path: `${routerEnv}/proTradeMargin`,
    name: 'margin',
    meta: {
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      activeName: 'proTradeMargin',
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/newLever/proTrade.vue'),
  },
  // 交易中心
  {
    path: `${routerEnv}/trade/:symbol`,
    name: 'trade',
    meta: {
      footNotMrgin: true,
      activeName: 'exTrade',
      hideFooter: 'tradeHideFooter', // 隐藏footer
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/newTrade/index.vue'),
  },
  {
    path: `${routerEnv}/trade`,
    name: 'trade',
    meta: {
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      activeName: 'exTrade',
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/newTrade/index.vue'),
  },
  // 交易中心专业版
  {
    path: `${routerEnv}/proTrade/:symbol`,
    name: 'trade',
    meta: {
      footNotMrgin: true,
      activeName: 'proTrade',
      hideFooter: 'tradeHideFooter', // 隐藏footer
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/newTrade/proTrade.vue'),
  },
  {
    path: `${routerEnv}/proTrade`,
    name: 'trade',
    meta: {
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      activeName: 'proTrade',
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/newTrade/proTrade.vue'),
  },
  // 首页
  // {
  //   path: `${routerEnv}/`,
  //   name: 'home',
  //   meta: {
  //     pageTitle: 'home',
  //     theme: 'homeOther',
  //     navigation: '1',
  //     footNotMrgin: true,
  //     hideFooter: 'false',
  //     H5HideCommonHeader: true, // H5 隐藏公共导航
  //     isCoOpen: true,
  //   },
  //   component: () => import('@/views/home/index.vue'),
  // },
  // 信用卡入金
  {
    path: `${routerEnv}/creditCardPurchase`,
    name: 'creditCardPurchase',
    meta: {
      footNotMrgin: false,
      activeName: 'creditCardPurchase',
      pageTitle: 'select', // header
      isCoOpen: true,
      mustLogin: true,
    },
    component: () => import('@/views/creditCardPurchase/index.vue'),
  },
  // 贩卖所
  {
    path: `${routerEnv}/sale/:symbol`,
    name: 'sale',
    meta: {
      footNotMrgin: true,
      activeName: 'exSale',
      hideFooter: 'tradeHideFooter', // 隐藏footer
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/sale/index.vue'),
  },
  {
    path: `${routerEnv}/sale`,
    name: 'sale',
    meta: {
      footNotMrgin: true,
      hideFooter: 'tradeHideFooter', // 隐藏footer
      activeName: 'exSale',
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/sale/index.vue'),
  },
  {
    path: '*',
    component: () => import('@/views/404/404.vue'),
  },
];
