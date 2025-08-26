// import { _ } from 'core-js';
// import { findNodeProcess } from 'egg-scripts/lib/helper';
import { myStorage, colorMap, getHex } from '@/utils';

export default {
  data: () => ({
    orderLines: new Map(),
    positionLines: new Map(),
    executionLines: new Map(),
    showLimitOrder: myStorage.get('showLimitOrder') || false,
    showPositionOrder: myStorage.get('showPositionOrder') || false,
    showExecutionOrder: myStorage.get('showExecutionOrder') || false,
  }),
  computed: {
    // 是否登录
    isLogin() {
      if (this.$store.state.baseData.isLogin) {
        return this.$store.state.baseData.isLogin;
      }
      return false;
    },
    // 持仓列表
    positionList() {
      return this.$store.state.future.positionListPro;
    },
    positionListInfo() {
      const arr = [];
      if (this.positionList) {
        const keyArr = Object.keys(this.positionList);
        keyArr.forEach((item) => {
          arr.push(`${item}`);
        });
        return arr;
      }
      return 0;
    },
    // 普通委托列表
    currentOrderList() {
      return this.$store.state.future.currentOrderLis || [];
    },
    // 历史委托
    currentHistoryOrderLis() {
      return this.$store.state.future.currentHistoryOrderLis || [];
    },
    // 当前合约ID
    contractId() {
      return this.$store.state.future.contractId;
    },
  },
  watch: {
    isLogin(val) {
      if (!val) {
        this.deleteLines('positionLines');
        this.deleteLines('orderLines');
        this.deleteLines('executionLines');
      }
    },
    showPositionOrder(val) {
      if (val) {
        this.positionLine();
      } else if (this.positionLines) {
        this.deleteLines('positionLines');
      }
    },
    showLimitOrder(val) {
      if (val) {
        this.orderLine();
      } else if (this.orderLines) {
        this.deleteLines('orderLines');
      }
    },
    showExecutionOrder(val) {
      if (val) {
        this.executionLine();
      } else if (this.executionLines) {
        this.deleteLines('executionLines');
      }
    },
    contractId(old, val) {
      if (old && val) {
        this.positionLine();
        this.orderLine();
        this.executionLine();
      }
    },
    positionListInfo(val) {
      if (val) {
        this.positionLine();
      }
    },
    currentOrderList(val) {
      if (val) {
        this.orderLine();
      }
    },
    currentHistoryOrderLis(val) {
      if (val) {
        this.executionLine();
      }
    },
    isCreateWidget(val) {
      if (val) {
        setTimeout(() => {
          this.positionLine();
          this.orderLine();
          this.executionLine();
        });
      }
    },
  },
  methods: {
    // 创建持仓
    positionLine() {
      if (this.positionLines) {
        this.deleteLines('positionLines');
      }
      if (this.positionList && this.showPositionOrder && this.isCreateWidget) {
        const keyArr = Object.keys(this.positionList);
        keyArr.forEach((key) => {
          const item = this.positionList[key];
          if (item.contractId === this.contractId) {
            const data = {
              id: item.positionId,
              price: item.openAvgPrice,
              text: `PNL ${item.unrealizedProfitLoss.value}`,
              quantity: item.positionVolume,
              lineColor: getHex(colorMap[item.sideClass.color]),
              color: getHex(colorMap[item.unrealizedProfitLoss.class]),
            };
            this.line(data, 'positionLines');
          }
        });
      }
    },
    // 创建委托
    orderLine() {
      if (this.orderLines) {
        this.deleteLines('orderLines');
      }

      if (this.currentOrderList.length && this.showLimitOrder && this.isCreateWidget) {
        this.currentOrderList.forEach((item) => {
          const color = item.side === 'BUY' ? getHex(colorMap['rise-1-cl']) : getHex(colorMap['fall-1-cl']);
          const data = {
            id: item.id,
            price: item.price,
            text: `${this.$t('futures.kLine.text6')} ${item.price}`,
            quantity: item.volume,
            lineColor: color,
            color,
          };
          this.line(data, 'orderLines')
            .onCancel(() => {
              this.$bus.$emit('cancelCurrentOrder', JSON.stringify(item));
            });
        });
      }
    },
    executionLine() {
      if (this.executionLines) {
        this.deleteLines('executionLines');
      }
      if (this.currentHistoryOrderLis.length && this.showExecutionOrder && this.isCreateWidget) {
        this.currentHistoryOrderLis.forEach((item, index) => {
          const newDate = new Date().getTime();
          const Day30 = newDate - 2592000000;
          if (item.avgPrice && item.ctime > Day30 && index < 200) {
            const data = {
              id: item.id,
              time: item.ctime / 1000,
              price: item.avgPrice,
              side: item.side,
            };
            this.executionShape(data, 'executionLines');
          }
        });
      }
    },

    line({
      id = 'price', text = 'Price', color = '#eb4d5c', price, quantity, fontColor = getHex(colorMap['text-1-cl']), lineStyle = 2, lineLength = 65, lineColor = '#13b887',
    }, linesType) {
      if (this[linesType].has(id)) this.deleteLine(id);
      const widget = this.widget.chart().createOrderLine()
        .setText(text)
        .setCancelTooltip(this.$t('futures.kLine.text5'))
        .setPrice(price)
        .setQuantity(quantity)
        .onModify((res) => res)
        .setBodyFont('14pt Helvetica')
        .setQuantityFont('14pt Helvetica')
        .setBodyTextColor(fontColor)
        .setBodyBorderColor(color)
        .setBodyBackgroundColor(color)
        .setQuantityBorderColor(lineColor)
        .setQuantityTextColor(fontColor)
        .setQuantityBackgroundColor(getHex(colorMap['fill-2-bg']))
        .setCancelButtonBorderColor(lineColor)
        .setCancelButtonBackgroundColor(getHex(colorMap['fill-2-bg']))
        .setCancelButtonIconColor(fontColor)
        .setExtendLeft(false)
        .setLineLength(lineLength)
        .setLineColor(lineColor)
        .setLineWidth(2)
        .setModifyTooltip(this.$t('futures.kLine.text7'))
        .setLineStyle(lineStyle);

      this[linesType].set(id, widget);

      return widget;
    },
    executionShape({
      id, side = 'buy', time = new Date().getTime(), price,
    }, linesType) {
      if (this[linesType].has(id)) this.deleteLine(id);
      const widget = this.widget.chart().createExecutionShape()
        .setDirection(side.toLowerCase())
        .setArrowSellColor(getHex(colorMap['fall-1-cl']))
        .setArrowBuyColor(getHex(colorMap['rise-1-cl']))
        .setTime(time)
        .setPrice(price)
        .setArrowHeight(12);
      this[linesType].set(id, widget);
      return widget;
    },

    deleteLine(linesType, id) {
      if (id && this[linesType]) {
        this[linesType].get(id).remove();
        this[linesType].delete(id);
      }
    },
    deleteLines(linesType) {
      this[linesType].forEach((value, key) => this.deleteLine(linesType, key));
    },
    checkedOrdeTypeclick(key) {
      this[key] = !this[key];
      myStorage.set(key, this[key]);
    },
  },
};
