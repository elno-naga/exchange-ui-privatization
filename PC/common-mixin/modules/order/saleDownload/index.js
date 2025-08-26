import {
  imgMap, getIconPath, downloadFile,
} from '@/utils';

export default {
  name: 'saleDownload',
  props: {
    showFlag: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      imgMap,
      getIconPath,
      isExTrade: true,
      isSade: false,
      timeHorizonVal: 0,
      startTime: '',
      endTime: '',
      hidRevocation: false,
    };
  },
  computed: {
    timeHorizon() {
      return [
        {
          label: this.$t('sale.texta20'),
          value: 0,
        },
        {
          label: this.$t('sale.texta21'),
          value: 1,
        },
        {
          label: this.$t('sale.texta22'),
          value: 2,
        },
        {
          label: this.$t('sale.texta23'),
          value: 3,
        },
        {
          label: this.$t('sale.texta24'),
          value: 4,
        },
      ];
    },
    functionSwitch() {
      return this.$store.state.baseData.functionSwitch;
    },
    isSaleBol() {
      let bol = false;
      if (this.functionSwitch && this.functionSwitch.jpSpotSwitch === 1) {
        bol = true;
      }
      return bol;
    },
    isDisabled() {
      let bol = false;
      if (!this.isExTrade && !this.isSade) {
        bol = true;
      }
      return bol;
    },
  },
  methods: {
    init() {

    },
    setCheckBox(key) {
      this[key] = !this[key];
    },
    setRedio(val) {
      this.timeHorizonVal = val;
    },
    timeSelect(time = []) {
      [this.startTime, this.endTime] = time;
    },
    setClose() {
      setTimeout(() => {
        this.$bus.$emit('openSaleDown', false);
      }, 500);
    },
    handlDownload() {
      if (!this.isExTrade && !this.isSade) {
        return;
      }
      const params = {
        timeType: this.timeHorizonVal,
        cancelType: this.hidRevocation ? 0 : 1,
      };
      const arr = [];
      if (this.isExTrade) {
        arr.push(1);
      }
      if (this.isSade) {
        arr.push(2);
      }
      if (this.timeHorizonVal === 4) {
        params.startTime = this.startTime;
        params.endTime = this.endTime;
      }
      params.type = arr.join();
      this.axios({
        url: 'order/export',
        handles: {
          'Content-Type': 'application/json;charset=UTF-8;charset=UTF-8',
        },
        method: 'GET',
        responseType: 'blob',
        isExport: true,
        params,
      })
        .then((res) => {
          const contentDisposition = decodeURIComponent(
            res.headers['content-disposition'],
          );
          if (
            contentDisposition
            && contentDisposition !== 'null'
            && contentDisposition !== 'undefined'
          ) {
            let fileName = contentDisposition.split('filename=')[1];
            // eslint-disable-next-line prefer-destructuring
            fileName = fileName.split('.')[0];
            this.downloadExcel(res.data, fileName);
          } else {
            this.downloadExcel(res.data, '');
          }
        });
    },
    downloadExcel(res, fileName = '', suffix = '.xls') {
      //  vue下载文件，返回值为 blob 文件流(添加这个属性 responseType: ‘blob‘)，失败后的错误信息处理以及成功处理。
      const that = this;
      const fileReader = new FileReader();
      fileReader.onload = function (event) {
        // try/catch 解决 responseType: ‘blob‘  下载失败，获取不到code问题
        try {
          // 解析成功 {code:x, msg:x}  说明不是文档流，提示错误信息
          const jsonData = JSON.parse(event.target.result);
          if (jsonData.code) {
            that.$bus.$emit('tip', { text: jsonData.msg, type: 'error' });
            return;
          }
        } catch (err) {
          // 解析成对象失败，说明是正常的文件流, 可以下载
          // eslint-disable-next-line no-use-before-define
          downloadFile(res, fileName, suffix);
        }
      };
      fileReader.readAsText(res);
    },
  },
};
