import { routerEnv } from '@/utils';

export default [
  // 资金管理
  {
    path: `${routerEnv}/assets`,
    name: 'assets',
    component: () => import('@/views/newAssets/index.vue'),
    children: [
      // 资产总览
      {
        path: 'totalAssets',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'totalAssets',
          activeName: 'assets',
          h5NavName: 'totalAssets',
          pageTitle: 'assets',
          showAssetsNav: true,
        },
        component: () => import('@/views/newAssets/totalAssets.vue'),
      },
      // 现货账户
      {
        path: 'exchangeAccount',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'exchangeAccount',
          activeName: 'assets',
          h5NavName: 'exchangeAccount',
          pageTitle: 'assets',
          showAssetsNav: true,
        },
        component: () => import('@/views/newAssets/exchangeAccount.vue'),
      },
      // 充值
      {
        path: 'recharge',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'exchangeAccount',
          activeName: 'assets',
          h5NavName: 'exchangeAccount',
          pageTitle: 'assets',
          showAssetsNav: false,
        },
        component: () => import('@/views/newAssets/recharge.vue'),
      },
      // 提现
      {
        path: 'withdraw',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'exchangeAccount',
          activeName: 'assets',
          h5NavName: 'exchangeAccount',
          pageTitle: 'assets',
          showAssetsNav: false,
        },
        component: () => import('@/views/newAssets/withdraw.vue'),
      },
      // 资金流水
      {
        path: 'flowingWater',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'flowingWater',
          activeName: 'assets',
          h5NavName: 'exchangeAccount',
          pageTitle: 'assets',
          showAssetsNav: false,
        },
        component: () => import('@/views/newAssets/flowingWater.vue'),
      },
      // 地址管理
      {
        path: 'addressMent',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'addressMent',
          activeName: 'assets',
          h5NavName: 'exchangeAccount',
          pageTitle: 'assets',
          showAssetsNav: false,
        },
        component: () => import('@/views/newAssets/addressMent.vue'),
      },
      // 法币账户
      {
        path: 'otcAccount',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'otcAccount',
          activeName: 'assets',
          h5NavName: 'otcAccount',
          pageTitle: 'assets',
          showAssetsNav: true,
        },
        component: () => import('@/views/newAssets/otcAccount.vue'),
      },
      // 法币资金流水
      {
        path: 'otcFlowingWater',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'otcFlowingWater',
          activeName: 'assets',
          h5NavName: 'otcAccount',
          pageTitle: 'assets',
          showAssetsNav: false,
        },
        component: () => import('@/views/newAssets/otcFlowingWater.vue'),
      },
      {
        path: 'innovations',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'innovations',
          activeName: 'assets',
          h5NavName: 'exchangeAccount',
          pageTitle: 'assets',
          showAssetsNav: false,
        },
        component: () => import('@/views/newAssets/innovations.vue'),
      },
      // 合约账户
      {
        path: 'coAccount',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'coAccount',
          activeName: 'assets',
          h5NavName: 'coAccount',
          pageTitle: 'assets',
          showAssetsNav: true,
        },
        component: () => import('@/views/newAssets/coAccount.vue'),
      },
      // 合约资金流水
      {
        path: 'coFlowingWater',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'coFlowingWater',
          activeName: 'assets',
          h5NavName: 'coAccount',
          pageTitle: 'assets',
          showAssetsNav: false,
          hideMenu: true,
        },
        component: () => import('@/views/newAssets/coFlowingWater.vue'),
      },
      // 杠杆账户
      {
        path: 'leverageAccount',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'leverageAccount',
          activeName: 'assets',
          h5NavName: 'leverageAccount',
          pageTitle: 'assets',
          showAssetsNav: true,
        },
        component: () => import('@/views/newAssets/leverageAccount.vue'),
      },
      // 杠杆借贷
      {
        path: 'leverageToLoan',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'leverageAccount',
          activeName: 'assets',
          h5NavName: 'leverageAccount',
          pageTitle: 'assets',
          showAssetsNav: false,
        },
        component: () => import('@/views/newAssets/leverageToLoan.vue'),
      },
      // 杠杆资金流水
      {
        path: 'lerverageFlowingWater',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'lerverageFlowingWater',
          activeName: 'assets',
          h5NavName: 'leverageAccount',
          pageTitle: 'assets',
          showAssetsNav: false,
        },
        component: () => import('@/views/newAssets/lerverageFlowingWater.vue'),
      },
      // 合约资产分析
      {
        path: 'coProfitRecord',
        name: 'assets',
        meta: {
          mustLogin: false,
          navName: 'coProfitRecord',
          activeName: 'assets',
          h5NavName: 'coAccount',
          pageTitle: 'assets',
          showAssetsNav: false,
          hideMenu: true,
        },
        component: () => import('@/views/newAssets/coProfitRecord.vue'),
      },
    ],
  },
];
