<template>
  <div class="withdraw-card fill-3-bg">
    <div class="has-withdraw">
        <div class="module-title text-1-cl">
          {{$t('rewardsCenter.withdrawn')}}
          <c-v6-tooltip
              class="title-tip"
              trigger="hover"
              :content="$t('rewardsCenter.withdrawnTip')"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6C0 2.68629 2.68629 0 6 0ZM6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1ZM8.31979 4.61538C8.31979 4.01941 8.05923 3.43664 7.60521 3.0635C7.15119 2.69035 6.56719 2.6059 6.00776 2.6059C5.47952 2.6059 4.89752 2.80733 4.55212 3.0635C4.20673 3.31966 3.82773 3.94291 3.77263 4.61538H5.06342C5.06342 4.40298 5.06575 4.20032 5.31029 4.02729C5.55484 3.85426 5.72917 3.81423 6.00776 3.81423C6.28634 3.81423 6.56033 3.90626 6.72395 4.02729C6.88757 4.14832 7.05314 4.35995 6.97727 4.61538C6.9014 4.87082 6.70167 5.10307 6.46154 5.33228C6.30679 5.47999 6.12878 5.63214 5.98109 5.75836L5.98106 5.75839L5.98096 5.75847C5.89953 5.82807 5.82732 5.88978 5.77333 5.93852C5.6214 6.07567 5.53499 6.17118 5.4235 6.446C5.4098 6.47977 5.39695 6.51059 5.38494 6.53938L5.3849 6.53949C5.29922 6.74499 5.25641 6.84767 5.25299 7.18629C5.2525 7.23532 5.25426 7.76876 5.25689 7.86682H6.59425V7.38462C6.59425 6.98095 6.77837 6.65401 6.97727 6.446C7.03727 6.38326 7.08909 6.3266 7.13745 6.27371L7.13746 6.2737C7.24944 6.15126 7.3429 6.04906 7.47646 5.93852C7.66771 5.78023 8.31979 5.21136 8.31979 4.61538ZM5.27453 8.30769V9.70195H6.61647V8.30769H5.27453Z" fill="#606266"/>
            </svg>
          </c-v6-tooltip>
        </div>
        <div class="module-count text-1-cl">
          <span class="main-1-cl">{{hasWithdraw.count}}</span>
          {{hasWithdraw.unit}}
        </div>
    </div>
    <div class="split-line fill-5-bg"/>
    <div class="wait-withdraw">
      <div class="module-title text-1-cl">
        {{$t('rewardsCenter.pendingWithdraw')}}
        <c-v6-tooltip
            class="title-tip"
            trigger="hover"
            :content="$t('rewardsCenter.pendingWithdrawTip')"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6C0 2.68629 2.68629 0 6 0ZM6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1ZM8.31979 4.61538C8.31979 4.01941 8.05923 3.43664 7.60521 3.0635C7.15119 2.69035 6.56719 2.6059 6.00776 2.6059C5.47952 2.6059 4.89752 2.80733 4.55212 3.0635C4.20673 3.31966 3.82773 3.94291 3.77263 4.61538H5.06342C5.06342 4.40298 5.06575 4.20032 5.31029 4.02729C5.55484 3.85426 5.72917 3.81423 6.00776 3.81423C6.28634 3.81423 6.56033 3.90626 6.72395 4.02729C6.88757 4.14832 7.05314 4.35995 6.97727 4.61538C6.9014 4.87082 6.70167 5.10307 6.46154 5.33228C6.30679 5.47999 6.12878 5.63214 5.98109 5.75836L5.98106 5.75839L5.98096 5.75847C5.89953 5.82807 5.82732 5.88978 5.77333 5.93852C5.6214 6.07567 5.53499 6.17118 5.4235 6.446C5.4098 6.47977 5.39695 6.51059 5.38494 6.53938L5.3849 6.53949C5.29922 6.74499 5.25641 6.84767 5.25299 7.18629C5.2525 7.23532 5.25426 7.76876 5.25689 7.86682H6.59425V7.38462C6.59425 6.98095 6.77837 6.65401 6.97727 6.446C7.03727 6.38326 7.08909 6.3266 7.13745 6.27371L7.13746 6.2737C7.24944 6.15126 7.3429 6.04906 7.47646 5.93852C7.66771 5.78023 8.31979 5.21136 8.31979 4.61538ZM5.27453 8.30769V9.70195H6.61647V8.30769H5.27453Z" fill="#606266"/>
          </svg>
        </c-v6-tooltip>
      </div>
      <div class="module-count text-1-cl">
        <span class="main-1-cl">{{waitWithDraw.count}}</span>
        {{waitWithDraw.unit}}
      </div>
      <div v-if="canWithDraw && needToWithdraw > 0" v-html="$t('rewardsCenter.pendingWithdrawNumTip',{count:needToWithdrawShow})" class="withdraw-tip text-2-cl">
      </div>
    </div>
    <div class="withdraw-operate">
      <c-button width="266px" height="46px" paddingW="13px" :disabled="!canWithDrawBtn" @click="withdrawConfirm"
      :className="canWithDrawBtn ? 'btn-blue main-1-bg  text-4-cl' : ' btn-blue fill-7-bg text-2-cl'">
        {{$t('rewardsCenter.withdrawBtn')}}
      </c-button>
    </div>
    <c-dialog-container
      :showFlag="showDialog"
      @close="closeDialog"
    >
      <div class="withdraw-confrim fill-2-bg">
        <div class="title fill-3-bg text-1-cl">{{$t('rewardsCenter.withdrawalToAccount')}}</div>
        <div class="withdraw-msg">
          <div class="withdraw-count text-1-cl"><span class="main-1-cl">{{usdtAmount}}</span>{{coin}}</div>
          <div class="withdraw-tip text-3-cl">{{$t('rewardsCenter.withdrawalAmountEquivalent')}}</div>
        </div>
        <div class="withdraw-list fill-3-bg">
          <div class="list-th text-3-cl">
            <div>{{$t('rewardsCenter.withdrawalCrypto')}}</div>
            <div>{{$t('rewardsCenter.withdrawalAmount')}}</div>
          </div>
          <div class="list-tr text-1-cl" v-for="item in withDrawList" :key="item.symbol">
            <div>{{item.symbol}}</div>
            <div>{{item.count}}</div>
          </div>
        </div>
        <div class="withdraw-operate">
          <c-button class="btn-blue withdraw-confirm-btn main-1-bg text-4-cl" width="378px" height="44px"
                    paddingW="30px" @click="closeDialog('confirm')">
            {{ $t('rewardsCenter.checkedConfirm') }}
          </c-button>
        </div>
      </div>
    </c-dialog-container>
  </div>
</template>

<script>
import {
  nul, // 乘
  division, // 除
} from '@/utils';

export default {
  name: 'c-withdraw-card',
  props: {
    canWithDraw: Boolean, // 是否开启提现
  },
  computed: {
    canWithDrawBtn() {
      const countDisabled = !(this.needToWithdraw > 0);
      const canWithdraw = this.canWithDraw;
      return countDisabled && canWithdraw;
    },
    needToWithdrawShow() {
      const showNum = !Number.isNaN(this.needToWithdraw) ? division(Math.ceil(nul(this.needToWithdraw, 100)), 100).toFixed(2) : this.needToWithdraw;
      return `<span class="text-1-cl">${showNum} ${this.coin}</span>`;
    },
  },
  data() {
    return {
      hasWithdraw: {
        count: 0,
        unit: 'USDT',
      },
      waitWithDraw: {
        count: 0,
        unit: 'USDT',
      },
      needToWithdraw: 0,
      withDrawList: [],
      usdtAmount: 0,
      showDialog: false,
      coin: 'USDT',
    };
  },
  mounted() {
    this.$bus.$on('updateWithdraw', () => {
      this.getMsg();
    });
    this.getMsg();
  },
  methods: {
    getMsg() {
      this.axios({
        url: 'do_withdraw_reward_info',
        method: 'post',
      })
        .then((res) => {
          const {
            coin = 'USDT', totalWithdrawnUsdt = 0, withdrawPendingUsdt = 0, leftWithdrawPendingUsdt,
          } = res.data || {};
          this.coin = coin;
          this.hasWithdraw = {
            count: !Number.isNaN(totalWithdrawnUsdt) ? division(Math.floor(nul(totalWithdrawnUsdt, 100)), 100).toFixed(2) : totalWithdrawnUsdt,
            unit: coin,
          };
          this.waitWithDraw = {
            count: !Number.isNaN(withdrawPendingUsdt) ? division(Math.floor(nul(withdrawPendingUsdt, 100)), 100).toFixed(2) : withdrawPendingUsdt,
            unit: coin,
          };
          this.needToWithdraw = leftWithdrawPendingUsdt;
        });
    },
    getWithdrawMsg() {
      this.axios({
        url: 'user_reward_un_withdraw',
        method: 'post',
      })
        .then((res) => {
          const { usdtAmount, unWithdrawList } = res.data;
          this.withDrawList = unWithdrawList.map(({ coin, unWithdrawAmount }) => ({
            symbol: coin,
            count: unWithdrawAmount,
          }));
          this.usdtAmount = !Number.isNaN(usdtAmount) ? division(Math.floor(nul(usdtAmount, 100)), 100).toFixed(2) : usdtAmount;
          this.showDialog = true;
        });
    },
    closeDialog(type) {
      if (type === 'confirm') {
        this.axios({
          url: 'do_withdraw_reward',
        })
          .then((res) => {
            if (res.code === '0') {
              this.$bus.$emit('tip', { text: this.$t('rewardsCenter.withdrawSuccess'), type: 'success' });
              // 监听提现操作
              this.$bus.$emit('WITHDRAW_SUCCESS');
              this.showDialog = false;
              this.getMsg();
            } else {
              this.showDialog = false;
              this.$bus.$emit('tip', { text: res.msg, type: 'error' });
            }
          });
      } else {
        this.showDialog = false;
      }
    },
    withdrawConfirm() {
      this.getWithdrawMsg();
    },
  },
};
</script>

<style scoped lang="stylus">
    .withdraw-card{
      width:1200px;
      padding:40px 32px;
      box-sizing :border-box;
      border-radius: 10px;
      display :flex;
      flex-direction :row;
      .split-line{
        width:1px;
        height:125px;
        background-color :#D8D8D8;
      }
      .module-title{
        font-size :16px;
        .title-tip{
          margin-left 6px;
        }
      }
      .module-count{
        font-size :16px;
        margin-top :24px;
        span{
          font-size 36px;
          font-weight:bold;
          font-family :PingFangSC-Medium;
        }
      }
      .has-withdraw{
        width:350px;
        padding-right:32px;
        box-sizing :border-box;
      }
      .wait-withdraw{
        width:519px;
        padding-left:63px;
        box-sizing :border-box;
        .withdraw-tip{
          font-size :12px;
          margin-top :17px;
        }
      }
      .withdraw-operate{
        display :flex;
        align-items :center;
        justify-content :flex-end;
        .btn-blue{
          font-size :16px;
          border-radius :4px;
          display:flex;
          flex-direction :row;
          align-items :center;
          justify-content :center;
        }

      }
    }
      .withdraw-confrim{
        display :flex;
        flex-direction :column;
        align-items :center;
        padding-bottom :32px;
        .title{
          width:100%;
          height:60px;
          font-size :16px;
          line-height :60px;
          padding-left :40px;
          box-sizing :border-box ;
          border-radius: 4px 4px 0 0 ;
        }
        .withdraw-msg{
          margin-top :32px;
          display :flex;
          flex-direction :column;
          align-items :center;
          .withdraw-count{
            font-size :16px;
            span{
              font-size :32px;
              margin-right :4px;
            }
          }
          .withdraw-tip{
            font-size :12px;
            margin-top :11px;
          }
        }
        .withdraw-list{
          width:378px;
          box-sizing :border-box;
          padding:16px;
          border-radius :4px;
          margin-top :41px;
          .list-th{
            display :flex;
            flex-direction :row;
            align-items :center;
            div{
              width:50%;
              font-size :12px;
            }
            div:last-child{
              text-align :right
            }
          }
          .list-tr{
            display :flex;
            flex-direction :row;
            align-items :center;
            margin-top :16px;
            div{
              width:50%;
              font-size :14px;
            }
            div:last-child{
              text-align :right
            }
          }
        }
        .withdraw-operate{
          margin-top:32px;
        }
      }
</style>
