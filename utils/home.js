import {
  fixRate,
  formatTime,
  fixD,
  getTime,
  getCoinShowName,
  formatTimeFn,
} from './common-method';

import getScript from './getScript';
import colorMap from './colorMap';
import templateConfig from './templateConfig';
import { setCookie, getCookie, removeCookie } from './cookie';

import myStorage from './mystorage';

import browser from './getBrowser';
import { setCoMarket, setDefaultMarket } from './setDefaultMarket';
import getIconPath from './iconPath';

export default {
  setCoMarket,
  setDefaultMarket,
  formatTime,
  getScript,
  getTime,
  myStorage,
  browser,
  colorMap,
  fixD,
  fixRate,
  getCoinShowName,
  templateConfig,
  setCookie,
  getCookie,
  removeCookie,
  getIconPath,
  formatTimeFn,
};
