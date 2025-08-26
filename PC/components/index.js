import NavTab from './V6/navTab';
import Alert from './V5/alert';
import Checkbox from './V6/checkbox';
import Dialog from './V5/dialog';
import dialogContainer from './taskCom/dialogContainer';
import GetCode from './V5/getCode';
import IconButton from './V5/iconButton';
import Tab from './V6/tab';
import Loading from './V5/loading';
import NavMenu from './V5/navMenu';
import OldUpload from './V5/oldUploadFile';
import OtcPayIcon from './V5/otcPayIcon';
import OtcReminder from './V5/otcReminder';
import PageBanner from './V5/pageBanner';
import Pagination from './V5/pagination';
import PaginationNew from './taskCom/paginationNew';
import Redio from './V6/redio';
import Swiper from './V5/swiper';
import v6Table from './V6/v6table';
import TextAreaLine from './V5/textArea_line';
import Tip from './V5/tip';
import VerificationAlert from './V5/verificationAlert';
import Verify from './V5/verify';
import NoticeDialog from './V5/noticeDialog';
import homeDialog from './V5/homeDialog';
import Header from './V5/header';
import Footer from './V6/footer';
import V5Button from './V5/v5Button';
import V5GetCode from './V5/v5GetCode';
import V5Popover from './V5/v5Popover';
import v6Tooltip from './V6/v6ToolTip';
import leftdialog from './V5/leftdialog';
import V5Header from './V5/v5Header';
import v5ButtomTab from './V5/v5ButtomTab';
import v5InputFormulate from './V5/v5InputFormulate';
import v5Step from './V5/v5Step';
import Echart from './V5/echart';
import VerifyDialog from './FundCodeCom/verifyDialog';
import messageBox from './V6/messageBox';
import dialogV6 from './V6/dialog_v6';
import taskCard from './taskCom/taskCard';
import taskBanner from './taskCom/taskBanner';
import taskDayAttendance from './taskCom/taskDayAttendance';
import taskWithdrawCard from './taskCom/taskWithdrawCard';
import taskRewardCard from './taskCom/taskRewardCard';
import selectV6 from './V6/v6Select';
import switchV6 from './V6/v6Switch';
import inputV6 from './V6/v6Input';
import v6skeleton from './V6/v6skeleton';
import autocompleteV6 from './V6/v6Autocomplete';
import inputSelectV6 from './V6/v6InputSelect';
import search from './V6/Search';
import buttonV6 from './V6/v6Button';
import skeleton from './V6/skeleton';
import Card from './V6/Card';
import datePicker from './V6/datePicker';
import RangePicker from './V6/rangePicker';
import PaginationV6 from './V6/v6Pagination';
// eslint-disable-next-line camelcase
import Dialog_V6 from './V6/v6Dialog';
import floatLayer from './V5/floatLayer';
import inputLineVerify from './V6/input_line_verify';
import cSideBar from './agencyCom/sideBar';

import SaasV6navMenu from './SaasV6/navMenu';
import Cpopover from './SaasV6/popover';
import SaasV6Table from './SaasV6/table';
import SaasV6Input from './SaasV6/input';
import SaasV6Dialog from './SaasV6/dialog';
import SaasNavTab from './SaasV6/navTab';

const componentPlugins = {
  dialogV6,
  messageBox,
  v6Tooltip,
  v6Table,
  taskCard,
  taskBanner,
  taskDayAttendance,
  taskWithdrawCard,
  taskRewardCard,
  NavTab,
  Alert,
  Checkbox,
  Dialog,
  dialogContainer,
  GetCode,
  IconButton,
  Tab,
  Loading,
  NavMenu,
  OldUpload,
  OtcPayIcon,
  OtcReminder,
  PageBanner,
  Pagination,
  PaginationNew,
  Redio,
  Swiper,
  TextAreaLine,
  Tip,
  VerificationAlert,
  Verify,
  NoticeDialog,
  homeDialog,
  Header,
  Footer,
  V5Button,
  V5GetCode,
  V5Popover,
  leftdialog,
  V5Header,
  v5ButtomTab,
  v5InputFormulate,
  v5Step,
  Echart,
  VerifyDialog,
  selectV6,
  switchV6,
  inputV6,
  v6skeleton,
  autocompleteV6,
  inputSelectV6,
  search,
  buttonV6,
  skeleton,
  Card,
  datePicker,
  RangePicker,
  PaginationV6,
  floatLayer,
  Dialog_V6,
  inputLineVerify,
  cSideBar,

  Cpopover,
  SaasV6navMenu,
  SaasV6Table,
  SaasV6Input,
  SaasV6Dialog,
  SaasNavTab,
};
const registerPlugins = (Vue, plugins = {}) => {
  const pluginKeys = Object.keys(plugins);
  pluginKeys.forEach((item) => {
    if (item && plugins[item]) {
      Vue.use(plugins[item]);
    }
  });
};
const install = (Vue) => {
  if (install.installed) {
    return;
  }
  install.installed = true;
  registerPlugins(Vue, componentPlugins);
};

install.installed = false;

const BlockChainUI = {
  install,
};

export default BlockChainUI;
