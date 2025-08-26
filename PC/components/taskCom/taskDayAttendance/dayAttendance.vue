<!--任务中心签到组件-->
<template>
  <div class="attendance-window fill-3-bg" v-if="cardList.length > 0">
    <div class="title text-1-cl">{{title}}</div>
    <div class="desc text-2-cl" v-if="desc">{{desc}}</div>
    <div class="day-list">
      <div v-for="(item,index) in cardList" class="day-item" :key="`day_${index}`" :style="item.checked ?  cardActiveBg : cardBg">
        <div class="day-income text-3-cl">{{ cardListDetail[index] ? cardListDetail[index].reward : item.income}}</div>
        <div class="income-unit text-3-cl">{{ cardListDetail[index] ? cardListDetail[index].rewardCoin : item.unit}}</div>
        <div class="income-day" :class="item.checked ? 'text-1-cl' : 'text-3-cl'">{{$t(index > 0 ? 'rewardsCenter.attendanceDay' : 'rewardsCenter.attendanceDayOne',{count:index+1})}}</div>
      </div>
    </div>
    <div class="attendance-opearte">
      <c-button v-if="!isLogin || !attendanceData.isSignIn" className="btn-blue main-1-bg text-4-cl" height="44px"
                paddingW="30px" @click="attendanceToday">
        {{ $t('rewardsCenter.checkedNow') }}
      </c-button>
      <c-button v-else className="btn-blue fill-7-bg text-2-cl" height="44px" paddingW="30px"
                :disabled="true">
        {{ $t('rewardsCenter.checkedIn') }}
      </c-button>
      <slot name="operate"></slot>
    </div>
    <c-verifyCationc-alert
      :showFlag="showJudage"
      :imgMap="imgMap"
      :titleText="$t('rewardsCenter.authCheckTitle')"
      :detaText="$t('rewardsCenter.authCheckDesc')"
      :dataList="showCheckAuthList"
      :buttonText="$t('rewardsCenter.authSetUp')"
      @confirm="alertConfirm"
      @close="alertClose"/>
    <c-dialog-container
      :showFlag="showAttendanceDialog"
      @close="closeDialog"
    >
      <div class="attendance-success fill-2-bg">
        <svg
            v-html="getIconPath('successIcon','main-1-cl')"
            width="132" height="115" viewBox="0 0 132 115" fill="none" xmlns="http://www.w3.org/2000/svg"
        />
        <div class="attendance-title text-1-cl">{{$t('rewardsCenter.checkedSuccess')}}</div>
        <div class="attendance-desc text-1-cl"><span class="main-1-cl">{{attendanceMsg.count}}</span>{{attendanceMsg.unit}}</div>
        <c-button class="btn-blue attendance-confirm main-1-bg text-4-cl" width="378px" height="44px"
                  paddingW="30px" @click="closeDialog">
          {{ $t('rewardsCenter.checkedConfirm') }}
        </c-button>
        <div class="attendance-view main-1-cl" @click="closeDialog('reward')">
          {{ $t('rewardsCenter.viewReward') }}
        </div>
      </div>
    </c-dialog-container>
  </div>
</template>

<script>
import { imgMap, getIconPath } from '@/utils';

export default {
  name: 'c-day-attendance',
  props: {
    title: String,
    desc: String,
    cardList: {
      default() {
        return [];
      },
      /**
       * {
       *    income:String, // 收益金额
       *    unit:String, //  收益金额单位
       * }
       * */
      type: Array,
    },
    cardListDetail: {
      default() {
        return [];
      },
      /**
       * {
       *    income:String, // 收益金额
       *    unit:String, //  收益金额单位
       * }
       * */
      type: Array,
    },
    needAttendance: Number,
    attendanceData: Object,
  },
  computed: {
    judageList() {
      const { user, phoneEmail } = this.attendanceData.check;
      const list = [];
      if (user) {
        list.push({
          key: 'user',
          text: this.$t('rewardsCenter.auth'),
          flag: false,
        });
      }
      if (phoneEmail) {
        list.push({
          key: 'phoneEmail',
          text: this.$t('rewardsCenter.authPhone'),
          flag: false,
        });
      }
      return list;
    },
    checkFlag() {
      return {
        user: this.authLevel === '1',
        phoneEmail: this.OpenGoogle,
      };
    },
    showCheckAuthList() {
      const checkList = this.judageList;
      const checkedFlag = this.checkFlag;
      return checkList.map((item) => ({
        ...item,
        flag: checkedFlag[item.key],
      }));
    },
    showAuthDialog() {
      const stateList = this.showCheckAuthList.map(({ flag }) => flag);
      return stateList.includes(false);
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    cardBg() {
      return {
        backgroundImage: `url('${this.imgMap.taskCard}')`,
      };
    },
    cardActiveBg() {
      return {
        backgroundImage: `url('${this.imgMap.taskCardActive}')`,
      };
    },
    // 实名认证
    authLevel() {
      let str = '';
      const { userInfo } = this.$store.state.baseData;
      if (userInfo) {
        str = userInfo.authLevel.toString();
      }
      return str;
    },
    // 用户是否开启谷歌
    OpenGoogle() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.googleStatus.toString() === '1') {
        flag = true;
      }
      return flag;
    },
  },
  data() {
    return {
      imgMap,
      getIconPath,
      judage: {
        data: [
          {
            key: 'user',
            text: this.$t('rewardsCenter.auth'),
            flag: true,
          },
          {
            key: 'phoneEmail',
            text: this.$t('rewardsCenter.authPhone'),
            flag: false,
          },
        ], // 数据
        str: this.$t('rewardsCenter.authCheckDesc'), // 文案
        flag: false,
        btnText: this.$t('rewardsCenter.authSetUp'), // 确定按钮
      },
      showJudage: false,
      showAttendanceDialog: false,
      attendanceMsg: {
        count: undefined,
        unit: undefined,
      },
    };
  },
  methods: {
    alertConfirm() {
      const list = this.showCheckAuthList.filter((item) => !item.flag);
      if (list.length === 1 && list[0].key === 'user') {
        this.$router.push('/personal/identityAuthen');
      } else {
        this.$router.push('/personal/userManagement');
      }
    },
    alertClose() {
      this.showJudage = false;
    },
    jumpLogin() {
      this.$router.push('/login');
    },
    attendanceToday() {
      if (this.isLogin) {
        if (this.showAuthDialog) {
          this.showJudage = true;
        } else {
          this.axios({
            url: 'do_daily_sign_in',
            method: 'post',
          })
            .then((res) => {
              if (`${res.code}` === '0') {
                const { rewards, rewardCoin } = res.data;
                this.$set(this.cardList, this.attendanceData.continuous, {
                  ...this.cardList[this.attendanceData.continuous],
                  checked: true,
                });
                this.attendanceMsg = {
                  count: rewards[this.attendanceData.continuous],
                  unit: rewardCoin || this.cardList[this.attendanceData.continuous].unit,
                };
                this.showAttendanceDialog = true;
              } else {
                this.$bus.$emit('tip', { text: res.msg, type: 'error' });
              }
            });
        }
      } else {
        this.jumpLogin();
      }
    },
    closeDialog(type) {
      this.showAttendanceDialog = false;
      this.$emit('attendance', type);
    },
  },
};
</script>

<style scoped lang="stylus">
  .attendance-window{
    width:1200px;
    border-radius: 8px;
    display: flex;
    flex-direction:column;
    justify-content center;
    align-items:center;
    padding:80px 87px;
    box-sizing :border-box;
    .title{
      font-size: 44px;
      font-weight :700;
    }
    .desc{
      font-size :14px;
      margin-top :26px;
    }
    .day-list{
      margin-top:56px;
      display:flex;
      flex-direction :row;
      align-items :center;
      .day-item{
        width:112px;
        height:145px;
        padding:12px;
        box-sizing :border-box;
        background-size :contain;
        position :relative;
        &:not(:last-child){
          margin-right :40px;
        }
        .day-income{
          font-size :32px;
          line-height :38px;
          position :absolute;
          top:12px;
          font-family: PingFangSC-Medium;
        }
        .income-unit{
          font-size :16px;
          margin-top :3px;
          position :absolute;
          top:53px;
        }
        .income-day{
          position :absolute;
          top:112px;
          line-height :16px;
        }
      }
    }
    .attendance-opearte{
      margin-top 40px;
    }
  }
  .attendance-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;

    .attendance-icon {
      width: 132px;
      height: 115px;
    }

    .attendance-title {
      font-size: 16px;
      margin-top: 24px;
    }

    .attendance-desc {
      font-size: 16px;
      margin-top: 24px;

      span {
        font-size: 32px;
        margin-right :8px;
        font-family :PingFangSC-Medium;
      }
    }

    .attendance-confirm {
      margin-top: 33px !important;
    }

    .attendance-view {
      margin-top: 24px;
      font-size: 14px;
      cursor :pointer;
    }
  }
  .btn-blue{
    border-radius: 4px;
    padding: 12px 30px;
    font-size: 16px;
    cursor: pointer;
    display:flex;
    flex-direction :row;
    align-items :center;
    justify-content :center;
  }
</style>
