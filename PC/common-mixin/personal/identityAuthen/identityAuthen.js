import { getIconPath, imgMap } from '@/utils';
import countryMinix from '../../countryList/countryList';

export default {
  name: 'personal',
  mixins: [countryMinix],
  data() {
    return {
      getIconPath,
      imgMap,
      authList: [],
      kycPhoneFlag: false, // kyc选择国家弹窗
      kycLoading: false,
      country: '', // kyc用户选择的国家
      loading: true,
    };
  },
  methods: {
    init() {
      this.$store.dispatch('getUserInfo');
      this.getAuthList();
    },
    // kyc 弹窗关闭
    kycPhoneClose() {
      // 关闭弹窗
      this.kycPhoneFlag = false;
      // 初始化select内容
      this.country = this.defaultCountryCodeReal
        ? this.defaultCountryCodeReal : this.countryMap[this.defaultCountryCode].code; // 所在地
      this.countryKeyCode = this.defaultCountryCode ? this.defaultCountryCode : ''; // 所在地
    },
    // kyc 弹窗确认
    kycPhoneConfirm() {
      // 中国人 - 认证face++
      if (this.nameVerifiedType === '00' && this.country === '+156') {
        this.axios({
          url: '/kyc/Api/get_Valid_QRcode',
        }).then((data) => {
          this.kycLoading = false;
          if (data.code.toString() === '0') {
            const { openAuto, limitFlag } = data.data;
            if ((openAuto && openAuto.toString() === '0')
              || (limitFlag && limitFlag.toString() === '1')) {
              // if (kycSingaporeOpen && kycSingaporeOpen !== '0') {
              //   this.$store.dispatch('exccKycConfig', {});
              // } else {
              this.$router.push('/personal/idAuth?country=156&countryKeyCode=86');
              // }
            } else {
              this.$router.push('/personal/faceAuth?country=156&countryKeyCode=86');
            }
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
        // 外国人 - 认证
      } else {
        // if (kycSingaporeOpen && kycSingaporeOpen !== '0') {
        //   this.$store.dispatch('exccKycConfig', {});
        // } else {
        const countryNum = this.country.split('+')[1];
        const countryKeyCodeNum = this.countryKeyCode.split('+')[1];
        this.$router.push(`/personal/idAuth?country=${countryNum}&countryKeyCode=${countryKeyCodeNum}`);
        // }
        this.kycLoading = false;
      }
    },
    getAuthList() {
      this.loading = true;
      this.axios({
        url: 'sumsub/getAuthRecord',
      }).then(({ code, data, msg }) => {
        this.loading = false;
        const arr = [];
        if (code.toString() === '0') {
          if (data && data.length) {
            // eslint-disable-next-line array-callback-return
            data.map((item) => {
              arr.push({
                ...item,
                requirementsReference: item.requirementsReference.split(','),
                bol: item.preLevelName,
              });
            });
            // eslint-disable-next-line no-param-reassign
          }
          this.authList = arr;
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    handClick(row) {
      if (row.authConfigName === 'PLATFORM') {
        this.kycPhoneFlag = true;
      } else if (row.authConfigName === 'SUMSUB') {
        this.$router.push(`/personal/IdAuthSumsub/${row.sumsubLevel}`);
      }
    },
    requirementsState(num) {
      switch (num) {
        case 'APPLICANT_DATA':
          return this.$t('sumSubKyc.basicInfo');
        case 'IDENTITY_DOCUMENT':
          return this.$t('sumSubKyc.identityDocument');
        case 'SELFIE':
          return this.$t('sumSubKyc.selfie');
        case 'TWO_SELFIE':
          return this.$t('sumSubKyc.theSecondSelfie');
        case 'PROOF_OF_RESIDENCE':
          return this.$t('sumSubKyc.addressProof');
        case 'TWO_PROOF_OF_RESIDENCE':
          return this.$t('sumSubKyc.secondProofOfAddress');
        case 'PHONE_VERIFICATION':
          return this.$t('sumSubKyc.telVerification');
        case 'EMAIL_VERIFICATION':
          return this.$t('sumSubKyc.mailVerification');
        case 'QUESTIONNAIRE':
          return this.$t('sumSubKyc.questionnaire');
        case 'FACE_RECOGNITION':
          return this.$t('sumSubKyc.faceRecognition');
        case 'REGISTRATION_SUCCESSFUL':
          return this.$t('sumSubKyc.successfully');
        default:
          return this.$t('sumSubKyc.successfully');
      }
    },
    resultState(num) {
      switch (num) {
        case 2:
          return { bol: true, label: this.$t('sumSubKyc.underReview') };
        case 1:
          return { bol: true, label: this.$t('sumSubKyc.authenticated') };
        case 0:
          return { bol: false, label: this.$t('sumSubKyc.startCertification') };
        default:
          return { bol: false, label: this.$t('sumSubKyc.startCertification') };
      }
    },
  },
  computed: {
    // ”00“ face++
    // ”01“羽山kyc
    // “02”简版自动
    // ”10“ 人工
    nameVerifiedType() {
      return this.$store.state.baseData.nameVerifiedType;
    },
  },
  watch: {
    // 默认区号
    defaultCountryCode(v) {
      if (v && this.country === '') {
        this.country = v;
      }
    },
  },
};
