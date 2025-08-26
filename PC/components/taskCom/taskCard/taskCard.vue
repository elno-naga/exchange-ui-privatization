<template>
  <div class="task-item fill-2-bg fill-5-bd">
    <img :src="showBanner" alt="" class="task-img">
    <div class="task-msg">
      <div class="line-1">
        <div class="task-reward">
          <template v-if="task.rewardAmount">
            <div class="task-rewards-num">{{ task.rewardAmount }} {{ task.rewardCoin }}</div>
            <div class="task-rewards-type fill-3-bg text-1-cl">{{ rewardTypeShow }}</div>
          </template>
        </div>
        <div
            v-if="task.remindTime && taskNewPerson"
            :class="timeClass"
            class="task-time"
        >{{ timeDesc }}: {{ showTime }}
        </div>
      </div>
      <div class="task-title text-1-cl">{{ task.taskName }}</div>
      <div v-if="task.taskInfo && taskNewPerson" class="task-desc text-3-cl">{{ task.taskInfo }}</div>
      <!--      <div class="task-progress" v-if="!taskNewPerson">-->
      <!--        <div class="progress-total">-->
      <!--          <div class="progress-complate main-1-bg" :style="complatePercentStyle"></div>-->
      <!--        </div>-->
      <!--        <div class="progress-desc fill-3-bg">-->
      <!--          <span>{{task.finishedAmount}}</span>/{{task.targetValue}} {{taskTargetUnit}}-->
      <!--        </div>-->
      <!--      </div>-->
      <div class="task-operate">
        <c-button v-if="btnText" :disabled="btnDisable" :class="buttonClass" height="44px" width="180px"
                  @click="cardOpearte">{{ btnText }}
        </c-button>
      </div>
    </div>
  </div>
</template>

<script>
import { formatTime } from 'BlockChain-ui-privatization/utils';
import taskMsg from 'BlockChain-ui-privatization/PC/common-mixin/taskCenter/taskMsg';
import { getCookie } from '@/utils';
import taskItemImgNight from '@/assets/images/taskCenter/task_item_img_night.png';
import taskItemImg from '@/assets/images/taskCenter/task_item_img.png';

export default {
  name: 'c-task-card',
  mixins: [taskMsg],
  props: {
    task: Object,
    getRewardSiccess: Function,
    imgDomain: String,
  },
  data() {
    return {
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
    };
  },
  computed: {
    buttonClass() {
      const btnClass = this.btnDisable ? 'fill-7-bg fill-7-cl text-2-cl' : 'main-1-bg text-4-cl';
      return `btn-blue ${btnClass}`;
    },
    timeClass() {
      const greenClass = this.isDarkTheme ? 'time_green_night' : 'time_green';
      const grayClass = this.isDarkTheme ? 'time_gray_night' : 'time_gray';
      const btnClass = this.timeDescState ? `${greenClass} text-1-cl` : `${grayClass} text-2-cl`;
      return `btn-blue ${btnClass}`;
    },
    isDarkTheme() {
      return this.userSkin === '1';
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    showBanner() {
      const banner = this.isDarkTheme ? this.task.nightBanner : this.task.banner;
      const defaultImg = this.isDarkTheme ? taskItemImgNight : taskItemImg;
      return banner || defaultImg;
    },
    taskTargetUnit() {
      return this.task.targetCoin === 'All' ? 'USDT' : (this.task.targetCoin || 'USDT');
    },
    taskNewPerson() {
      return this.task.taskType === 1;
    },
    taskState() {
      return this.task.status;
    },
    rewardTypeShow() {
      return this.isRewardTypeFn[this.task.rewardType].title;
    },
    timeZone() {
      const timeOffset = (new Date()).getTimezoneOffset() / 60;
      const timeOffsetHour = 0 - timeOffset;
      return timeOffsetHour > 0 ? (`+${timeOffsetHour}`) : timeOffsetHour;
    },
    showTime() {
      if (!this.isLogin) {
        return '--';
      }
      return this.task.remindTime ? formatTime(this.task.remindTime) : '--';
    },
    timeDesc() {
      let timeDesc = '';
      switch (this.taskState) {
        case 1:
          timeDesc = this.$t('rewardsCenter.expirationTime');
          break;
        case 0:
          timeDesc = this.$t('rewardsCenter.collectionDeadline');
          break;
        case 2:
          timeDesc = this.$t('rewardsCenter.collectionTime');
          break;
        case 4:
          timeDesc = this.$t('rewardsCenter.expirationTime');
          break;
        case 5:
          timeDesc = this.$t('rewardsCenter.collectionDeadline');
          break;
        default:
          timeDesc = '';
      }
      return timeDesc;
    },
    timeDescState() {
      const stateGreen = ['0', '4'];
      return stateGreen.includes(`${this.taskState}`);
    },
    btnText() {
      let btnText = '';
      switch (this.taskState) {
        case 4:
          btnText = this.$t('rewardsCenter.go');
          break;
        case 0:
          btnText = this.$t('rewardsCenter.getReward');
          break;
        case 2:
          btnText = this.$t('rewardsCenter.rewarded');
          break;
        case 1:
          btnText = this.$t('rewardsCenter.expired');
          break;
        case 5:
          btnText = this.$t('rewardsCenter.rewardExpired');
          break;
        default:
          btnText = undefined;
      }
      return btnText;
    },
    btnDisable() {
      const stateDisableTrue = ['2', '5', '1'];
      return stateDisableTrue.includes(`${this.taskState}`);
    },
    complatePercentStyle() {
      const total = this.task.targetValue;
      const current = this.task.finishedAmount;
      return { width: `${(current / total) * 100}%` };
    },
  },
  methods: {
    cardOpearte() {
      if (!this.isLogin) {
        this.$router.push('/login');
        return;
      }
      if (this.taskState === 0) {
        this.getReward();
      } else {
        const type = this.task.taskCategory;
        const link = this.isTaskCategoryFn[type].routerUrl;
        if (link) {
          window.location.href = link;
        }
      }
    },
    getReward() {
      this.axios({
        url: 'receive_reward',
        params: {
          taskId: this.task.id,
        },
      })
        .then((res) => {
          const { resultType } = res.data;
          if (resultType && resultType.toLocaleString() === 'Success') {
            // 领取成功
            this.$emit('getRewardSiccess', res.data || {});
            // 监听奖励领取
            this.$bus.$emit('REWARD_GAIN', () => {
              this.getMesssageState();
            });
          } else {
            this.$bus.$emit('tip', {
              text: resultType,
              type: 'error',
            });
          }
        });
    },
  },
};
</script>

<style lang="stylus" scoped>
.task-item {
  box-sizing: border-box;
  width: 1200px;
  padding: 24px 36px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  margin-bottom: 24px;

  .task-img {
    width: 304px;
    height: 174px;
  }

  .task-msg {
    margin-left: 32px;
    flex: 1;
    padding-bottom: 80px;
    position: relative;

    .line-1 {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .task-reward {
        display: flex;
        flex-direction: row;

        .task-rewards-num {
          background: #000000;
          color: #FFFFFF;
          padding: 8px;
          border-radius: 2px;
        }

        .task-rewards-type {
          padding: 8px;
          border-radius: 2px;
          margin-left: 8px;
        }
      }

      .task-time {
        padding: 8px 16px;
        color: #000000;
        border-radius: 4px;
        background: linear-gradient(90deg, #D5D7DA 1.3%, rgba(255, 255, 255, 0) 100%);
        cursor: default;
      }

      .time_green_night{
        background: linear-gradient(90deg, rgba(76, 229, 138, 0.9) 0%, rgba(233, 252, 240, 0) 100%);
      }
      .time_green{
        background: linear-gradient(90deg, rgba(76, 229, 138, 0.90) 0%, rgba(233, 252, 240, 0.00) 100%);
      }
      .time_gray_night{
        background: linear-gradient(90deg, #2F2F2F 1.3%, #111111 100%);

      }
      .time_gray{
        background: linear-gradient(90deg, #D5D7DA 0%, rgba(255, 255, 255, 0.00) 100%);
      }
    }

    .task-title {
      font-size: 14px;
      margin-top: 24px;
    }

    .task-desc {
      font-size: 14px;
      line-height 16px;
      margin-top: 16px;
      word-wrap: break-word;
    }

    .task-progress {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 16px;
      margin-top: 16px;

      .progress-total {
        width: 438px;
        height: 8px;
        border-radius: 4px;
        background: #DDDDDD;

        .progress-complate {
          height: 8px;
          border-radius: 4px;
        }
      }

      .progress-desc {
        margin-left: 12px;
        color: #606266;
        font-size: 12px;

        span {
          color: #000000;
        }
      }
    }

    .task-operate {
      margin-top: 12px;
      height: 44px;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }

  .btn-blue {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
}
</style>
