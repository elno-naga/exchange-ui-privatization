export default {
  state: {
    common: {
      market: 'common/market',
      change_language: 'common/change_language',
      app_download: 'common/app_download',
      public_info: 'common/public_info_v4',
      v4_public: 'common/v4_public',
      v4_market: 'common/v4_market',
      user_info: 'common/user_info',
      index_data: 'common/index',
      common_switch: 'common/switch',
      rate: 'common/rate', // 查询汇率
      optional_symbol: 'common/update_optional_symbol',
      optional_symbols: 'optional/update_symbol', // 更新保存自选币对
      modify_nick_name: 'user/nickname_update',
      reset_password: 'user/password_update',
      sms_code: 'v4/common/smsValidCode',
      bind_email: 'user/email_bind_save_v4',
      email_code: 'v4/common/emailValidCode',
      email_update: 'user/email_update',
      mobile_update: 'user/mobile_update',
      mobile_update_verify: 'user/opt/mobile_bind_save', // 增加极验后修改手机号新接口
      mobile_bind_save: '/user/mobile_bind_save', // 绑定手机
      mobile_bind_save_verify: '/user/opt/mobile_bind_save', // 绑定手机
      toopen_google_authenticator: 'user/toopen_google_authenticator', // 谷歌认证 获取二维码
      google_verify: 'user/google_verify', // 谷歌认证
      auth_realname: 'user/v4/auth_realname', // 实名认证
      close_google_verify: 'user/close_google_verify', // 关闭谷歌认证
      close_mobile_verify: 'user/close_mobile_verify', // 关闭手机认证
      open_mobile_verify: 'user/open_mobile_verify', // 开启手机认证
      login_history: 'security/login_history', // 获取登录历史
      setting_history: 'security/setting_history', // 获取安全设置历史
      update_fee_coin_open: 'user/update_fee_coin_open', // 平台币作为手续费
      // update_fee_coin_open: 'user/sys_conf_trade_fee_coin', // 平台币作为手续费
      invite_info_list: 'return/invite_info_list', // 邀请分红相关信息
      otc_account_list: 'finance/v4/otc_account_list', // 场外账户信息列表
      company_apply: 'otc/company_apply', // 商户申请
      company_release: 'otc/company_release', // 解除认证
      footer: 'cms/footer/list', // 底部
      cmsInfo: 'cms/info',
      footerAndHeader: 'common/footer_and_header', // header 和 footer 自定义模板
      create_open_api: 'openapi/create_open_api', // 添加api
      my_api_list: 'openapi/my_api_list', // api列表
      delete_open_api: 'openapi/delete_open_api', // 删除api
      open_api_one: 'openapi/open_api_one', // 查看api
      update_open_api: 'openapi/update_open_api', // 修改api
      otc_payment_add: 'otc/payment/add', // 新增支付方式
      otc_payment_find: 'otc/payment/find', // 查询用户支付方式
      otc_payment_delete: 'otc/v4/payment/delete', // 删除用户支付方式
      otc_payment_update: 'otc/payment/update', // 修改支付方式
      otc_capital_password_set: 'v4/capital_password/reset', // 设置资金密码
      otc_capital_password_reset: 'v4/capital_password/reset', // 重置资金密码
      otc_payment_open: 'otc/payment/open', // 支付方式开关设置
      otc_person_ads: 'otc/v4/person_ads', // 个人广告信息
      otc_close_wanted: 'otc/close_wanted', // 关闭广告
      otc_person_relationship: 'otc/person_relationship', // 获取黑名单
      otc_search: 'otc/search', // 广告搜索
      otc_ticker: 'v4/otc/ticker', // 场外24小时行情
      otc_minute_line: 'v4/otc/minute_line', // 场外分钟线
      otc_person_home_page: 'otc/person_home_page', // 获取个人主页用户基本信息显示
      otc_user_contacts: 'otc/user_contacts', // 黑白名单修改
      otc_user_contacts_remove: 'otc/user_contacts_remove', // 从黑名单移除
      otc_fee_rate_list: 'finance/otc/fee_rate_list', // 出售广告法币对应手续费
      return_info_list: 'v4/return/return_info_list', // 交易挖矿
      newcoin_project_list: 'newcoinV2/newcoin_project_listV2', // 创新试验区列表
      newcoin_project_detail: 'newcoinV2/newcoin_project_detailV2', // 创新试验区详情
      newcoin_purchase: 'api/newcoin_purchase', // 用户确认申购接口
      agent_data_query: 'agentV2/agent_data_query', // 经纪人系统 返佣记录列表
      agent_data_export: '/agentV2/agent_data_export', // 经纪人系统 导出返佣记录列表
      agent_data_info_export: '/agentV2/agent_data_info_export', // 经纪人系统 导出返佣记录详情
      agent_account_export: '/agentV2/agent_account_export', // 经纪人系统 导出持仓信息
      agent_account_query: 'agentV2/agent_account_query', // 经纪人系统 持币记录列表
      broker_data_list: 'broker/role/rank', // 经纪人系统-页面角色列表
      broker_asset: 'broker/asset', // 经纪人系统-用户的返佣信息
      broker_code: 'broker/head', // 经纪人系统-返佣邀请链接
      agent_data_info_query: 'agentV2/agent_data_info_query',
      get_image_token: '/common/get_image_token',
      financing: 'financing/project/list', // 理财宝列表
      financingDet: 'financing/project/detail', // 理财宝列表详情
      financingList: 'financing/record/list', // 理财宝个人理财记录
      financingListDet: 'financing/record/detail', // 理财宝个人理财记录详情
      order: 'financing/create/order', // 下单接口
      kyc_config: 'kyc/config', // 获取KYC数据
      singPass_verifyAuth: 'kyc/singPass/verifyAuth',
      excc_auth_realname: '/kyc/auth_realname_singapore', // excc人工实名认证
    },
    ordercenter: {
      currentNew: 'order/list/new', // 当前委托
      historyNew: 'order/entrust_history', // 历史委托
      cancelorder: 'order/cancel', // 撤单
      orderDetail: 'trade/list_by_order', // 成交记录详情
      order_list_new: 'order/list/all', // 全部委托订单
    },
    cointran: {
      account_balance: 'finance/account_balance', // 币币交易 交易账户
      order_create: 'order/create', // 币币交易 买卖下单
      orderNew: 'order/list/new', // 当前委托
      orderAll: 'order/list/all', // 历史委托
      order_list_all: 'trade/list', // 历史委托 ，历史成交列表
      trade_export: 'trade/export', // 导出成交历史
      list_by_order: 'trade/list_by_order', // 成交记录详情
    },
    notice: {
      notice_list: 'notice/notice_info_list', // 公告列表
      notice_info: 'notice/notice_info',
    },
    // 消息中心
    mesage: {
      message_count: 'message/v4/get_no_read_message_count', // 未读
      message: 'message/user_message',
      message_status: 'message/message_update_status',
      message_del: 'message/message_del', // 删除
    },
    lever: {
      cancel: 'lever/order/cancel', // 取消订单
      create: 'lever/order/create', // 杠杆下单接口
      all: 'lever/order/history', // 历史委托
      new: 'lever/order/list/new', // 当前委托
      list_by_order: 'lever/trade/list_by_order', // 根据订单号获取成交记录
      list: 'lever/trade/list', // 成交记录-- 废弃
    },
    // 合约交易
    contract: {
      init_take_order: 'init_take_order', // 下单初始化接口
      change_level: 'change_level', // 修改杠杆倍数
      take_order: 'take_order', // 下单买卖
      get_liquidation_rate: 'get_liquidation_rate', // 减仓风险排名
      user_position: 'user_position', // 合约订单列表
      order_list: 'order_list', // 订单列表接口
      transfer_margin: 'transfer_margin', // 追加保证金接口
      cancel_order: 'cancel_order', // 撤单
    },
    // free Stakin
    freeStaking: {
      index: 'increment/index',
      project_list: 'increment/project_list',
      project_detail: '/increment/project_info',
      pos_history: '/increment/my_pos',
      project_apply: '/increment/project/apply',
      financial_management: '/increment/financial_management',
    },
    // 云合约
    futures: {
      // 合约列表
      publicInfo: 'common/public_info',
      // 用户配置信息
      getUserConfig: 'user/get_user_config',
      // 开通合约交易提交
      createCoId: 'user/create_co_id',
      // 提交编辑杠杆
      levelEdit: 'user/level_edit',
      // 编辑提交交易喜好配置
      editUserPageConfig: 'user/edit_user_page_config',
      // 切换合约保证金模式
      marginModelEdit: 'user/margin_model_edit',
      // 提交委托
      orderCreate: 'order/order_create',
      // 前台公共实时信息
      publicMarkertInfo: 'common/public_market_info',
      // 合约资产详情
      accountBalance: 'account/account_balance',
      // 持仓列表
      getPositionList: 'position/get_position_list',
      // 持仓列表 + 资产列表
      getAssetsList: 'position/get_assets_list',
      // 深度图
      depthMap: 'common/depth_map',
      // 调节逐仓仓位保证金 -- 编辑提交
      changePositionMargin: 'position/change_position_margin',
      // 止盈止损列表
      takeProfitStopLoss: 'order/take_profit_stop_loss',
      // 提交止盈止损单
      createTpslOrder: 'order/order_tpsl_create',
      // 撤销止盈止损单
      orderTpslCancel: 'order/order_tpsl_cancel',
      // 当前委托
      currentOrderList: 'order/current_order_list',
      // 条件委托
      triggerOrderList: 'order/trigger_order_list',
      // 历史委托
      historyOrderList: 'order/history_order_list',
      // 取消订单
      orderCancel: 'order/order_cancel',
      // 资金流水
      getTransactionList: 'record/get_transaction_list',
      // 获取阶梯配置
      getLadderInfo: 'common/get_ladder_info',
      // 保险基金余额折线图/历史记录
      riskBalanceList: 'common/risk_balance_list',
      // 资金费率折线图/历史记录
      fundingRateList: 'common/funding_rate_list',
      // 获取保险基金余额
      getRiskAccount: 'common/get_risk_account',
      // 指数价格k线图
      indexPriceKline: 'common/index_price_kline',
      // 指数价格k线图 -- 指数价格组成列表
      indexPriceWeightList: 'common/index_price_weight_list',
      // 标记价格k线图 -- 标记价格组成列表
      tagPriceKline: 'common/tag_price_kline',
      // 领取赠金
      receiveCoupon: 'user/receive_coupon',
      // 盈亏记录
      historyPositionList: 'position/history_position_list',
      // 获取用户委托计数
      getUserOrderCount: 'order/get_user_order_count',
      // 订单查询成交信息
      getTradeInfo: '/order/get_trade_info',
      // 提交止盈止损单（新）
      conditionCreate: 'order/condition_create',
      // 个人中心页面 总资产
      totalAccountBalance: 'finance/features/total_account_balance',
      // 挖矿信息总览
      miningInfo: 'user/mining/info',
      // 合约信息公示
      publicFuturesContractInfo: 'common/public_futures_contract_info',
      contractOptionaSet: 'contract_optional_set', // 行情设置合约自选列表
      contractOptionalList: 'contract_optional_list', // 获取合约自选列表数据
    },
    // 信用卡入金
    creditCardPurchase: {
      get_third_support_fiat: 'get_third_support_fiat', // 获取kv配置的法币及数字货币列表
      get_paycard_rate_list: 'get_paycard_rate_list', // 获取第三方对所选法币及数字货币的汇率列表
      get_paycard_num: 'get_paycard_num', // 选中第三方后 输入法币数量可换取的数字货币数量展示
      payment_submit: 'payment_submit', // 提交表单前准备
    },
    membership: { // 会员等级
      getUserFeeDiscount: '/membership/get_user_fee_discount', // 查询用户当前手续费率
      nextLevelUserSatisfy: '/membership/next_level_user_satisfy', // 下一个等级的条件及当前用户完成状态
      getLeverRateList: '/membership/get_lever_rate_list', // 手续费率-杠杆利率：查询所有开启杠杆币对列表， 查询普通利率，会员利率（不区分登陆）
      getLevelFeeConfigList: '/membership/get_level_fee_config_list', // 手续费率- 查询商户配置的会员等级条件+配置（现货/合约）（不区分登陆）
      getCoinWithdrawFeeList: '/membership/get_coin_withdraw_fee_list', // 手续费率-充值/提现：查询所有开启币种列表 提现手续费 （不区分登陆）
    },
    // 子账户
    subAccount: {
      common_getAllSub: 'sub_user/common/get_all_sub_user', // 获取全部子账户下拉
      subAcc_tableUrl: 'sub_user/account/get_sub_user_list', // 获取子账户表格
      addSub_checkEmail: 'sub_user/account/check_email_exit', // 检查邮箱是否存在
      addSub_editTrade: 'sub_user/account/update_trade_status', // 修改交易状态
      addSub_confirm: 'sub_user/account/create_sub_user', // 确认添加子账户
      addSub_editPwd: 'sub_user/account/update_password', // 确认修改密码
      addSub_editEmail: 'sub_user/account/update_email', // 确认修改邮箱
      addSub_checkDisable: 'sub_user/account/check_disable_account', // 禁用前校验账户是否可以禁用
      addSub_disable: 'sub_user/account/disable_account', // 禁用子账户
      addSub_editRemark: 'sub_user/account/update_remark', // 修改子账户备注
      addSub_freeze: 'sub_user/account/update_status', // 修改子账户备注
      // API管理
      apiMgt_tableList: 'sub_user/openapi/sub_user_api_list', // 获取API管理列表
      apiMgt_addApi: 'openapi/create_open_api', // 添加API
      apiMgt_delApi: 'openapi/delete_open_api', // 删除API
      apiMgt_editApi: 'openapi/update_open_api', // 修改API
      // 登录记录
      login_record: 'sub_user/login_history', // 登录记录
      // 资产 - 充值
      recharge_accountBalance: 'sub_user/property/exchange/finance/balance', // 子账户币币详细资产
      recharge_address: 'sub_user/property/get_charge_address', // 获取充值地址
      recharge_record: 'sub_user/property/deposit_list', // 获取充值记录
      // 资产 - 划转
      sub_lever_accountBalance: 'sub_user/property/lever/finance/balance', // 单个子账户杠杆详细资产
      sub_coinByLever: 'sub_user/property/lever/symbol/balance', // 子账户杠杆 单币种
      sub_allSubTotal: 'sub_user/property/all_sub_total_balance', // 子账户所有资产总览
      transfer_coinToCoin: 'sub_user/property/root_transfer_sub', // 划转母子币币划转
      transfer_SymbolToCoin: 'sub_user/property/lever/finance/transfer', // 子子杠杆币币划转
      transfer_coinRecord: 'sub_user/property/sub_root_transfer_list', // 币币账户划转流水
      transfer_LeverRecord: 'sub_user/property/lever/transfer/list', // 杠杆账户划转流水
      sub_contract_accountBalance: 'sub_user/property/contract/symbol/balance', // 单个子账户合约详细资产
      transfer_contractRecord: 'sub_user/property/contract/transfer_list', // 合约账户划转流水
      transfer_contractToCoin: 'sub_user/property/futures_transfer', // 子子合约币币划转
      allContractCoin: 'root_user/property/contract/symbol/balance', // 母账户获取合约币种
      // 订单管理
      order_coinSymbolUrl: 'sub_user/entrust_search', // 币币/杠杆账户当前委托、历史委托
      order_coinSymbolDetailUrl: 'sub_user/order/trade/list_by_order', // 币币/杠杆账户历史详情
      order_cancelAll: 'sub_user/cancel_all', // 撤销全部订单
      order_cancelOne: 'sub_user/order/cancel', // 撤销单个订单
      order_selContact: 'sub_user/contract/open_contract_list', // 合约下拉列表
      order_tableContact: 'sub_user/order/contract/order_list', // 合约表格数据(历史和当前)
      order_triggerContact: 'sub_user/order/contract/trigger_order_list', // 合约表格数据(计划历史和当前历史)
      order_historyContact: 'sub_user/order/contract/history_trade_list', // 合约表格数据(历史成交)
      order_cancelContact: 'sub_user/order/contract/cancel_all', // 合约撤销
    },
  },
};
