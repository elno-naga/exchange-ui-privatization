const sendVerigicationCode = {
  setFundCode: '6', // 设置资金密码
  editFundCode: '7', // 修改资金密码
  forgetFundCode: '35', // 忘记资金密码
  unbindFundCode: '36', // 解绑资金密码
  whitelistChangeSwitchCodeOpen: '37', // 提币白名单开启验证
  whitelistChangeSwitchCodeClose: '40', // 提币白名单关闭验证
  addWithdrawAddress: '11,13', // 添加提现地址 11 - 短信  13 --- 邮箱
  delWithdrawAddress: '12', //  删除提现地址
  c2cSell: '38', //  C2C出售验证
  merchantDeposit: '39', //  商户放币订单验证
  withdraw: '10', // 提现 验证
  turnStraight: '34', // 站内直转 短信验证
  turnStraightEmail: '19', // 站内直转 邮箱验证
};
export default sendVerigicationCode;
