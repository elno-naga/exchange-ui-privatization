// eslint-disable-next-line import/no-extraneous-dependencies
import * as htmlToImage from 'html-to-image';
import { getIconPath } from '@/utils';

export default {
  name: 'promotionInvite',
  data() {
    return {
      getIconPath,
      contactNum: '',
      codeImg: '',
      imgIndex: 0,
      posterImgData: [],
    };
  },
  methods: {
    async init() {
      const basicData = await this.getData();
      this.contactNum = this.userInfo.userAccount;
      this.codeImg = basicData.inviteQECode;
      // 判断有无上传poster底图，有图查看图，无图展示默认图片数组
      let oneImg = basicData.config ? basicData.config.posterOneImg : '';
      let twoImg = basicData.config ? basicData.config.posterTwoImg : '';

      if (oneImg) {
        if (oneImg.indexOf('http:') !== -1) {
          oneImg = `https:${oneImg.split('http:')[1]}`;
        }
        this.posterImgData.push(oneImg);
      }
      if (twoImg) {
        if (twoImg.indexOf('http:') !== -1) {
          twoImg = `https:${twoImg.split('http:')[1]}`;
        }
        this.posterImgData.push(twoImg);
      }
      if (!this.posterImgData.length) {
        if (
          this.$store.state.baseData.lan === 'zh_CN'
          || this.$store.state.baseData.lan === 'el_GR'
          || this.$store.state.baseData.lan === 'zh_TC'
        ) {
          this.posterImgData = [
            'https://s3.ap-northeast-1.amazonaws.com/chainup-test/zh_share.png',
            'https://s3.ap-northeast-1.amazonaws.com/chainup-test/zh_share2.png',
          ];
        } else {
          this.posterImgData = [
            'https://s3.ap-northeast-1.amazonaws.com/chainup-test/en_share.png',
            'https://s3.ap-northeast-1.amazonaws.com/chainup-test/en_share2.png',
          ];
        }
      }
    },
    // 请求页面基本数据
    getData() {
      return new Promise((resolve) => {
        this.axios({
          url: 'invitation/publicConfig',
          params: {},
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          }
        });
      });
    },
    changeNext(type) {
      if (type === 'left') {
        this.imgIndex = 0;
      } else {
        this.imgIndex = 1;
      }
    },
    downLoadImg() {
      const node = document.getElementById('center-img');
      htmlToImage.toPng(node).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'Poster';
        link.href = dataUrl;
        link.click();
      });
    },
    changeFlag() {
      this.$emit('closeModal');
    },
  },
  computed: {
    // 用户信息
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    publicInfo() {
      const { publicInfo } = this.$store.state.baseData;
      return publicInfo;
    },
    companyName() {
      if (this.publicInfo && this.publicInfo.msg) {
        return this.publicInfo.msg.company_name;
      }
      return '';
    },
  },
};
