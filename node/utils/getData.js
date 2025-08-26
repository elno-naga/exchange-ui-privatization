const fs = require('fs');
const path = require('path');
const hostFilter = require('./host-filter');

const formatTime = (dateTime) => {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  function s(t) {
    return t < 10 ? `0${t}` : t;
  }

  return `${year}-${s(month)}-${s(day)} ${s(hours)}:${s(minutes)}:${s(seconds)}`;
};

const getData = async (domainData, host, app, api, lan) => {
  const serverConfigPath = path.join(__dirname, './../../../../serverConfig.json');
  let urlHost = 'http://127.0.0.1';
  let apiProxy = '/fe-ex-api';
  let headersHost = '';
  let ip = '';
  if (fs.existsSync(serverConfigPath)) {
    const jsonData = JSON.parse(fs.readFileSync(serverConfigPath, 'utf8'));
    urlHost = jsonData.curlHost;
    apiProxy = jsonData.proxy;
    ip = app.config.LOCAL_IP;
    headersHost = jsonData.headerHost;
  }
  if (domainData) {
    let header = {
      host: headersHost.length
        ? `${headersHost}.${domainData.fileName}`
        : host,
    };
    if (app.config.env === 'local') {
      urlHost = app.config.devUrlProxy.ex;
      header = {};
    }
    if (lan) {
      header['exchange-language'] = lan;
    }
    if (ip) {
      header['X-Forwarded-For'] = ip;
    }
    header['Content-Type'] = 'application/json';
    const res = await app.ctx.curl(`${urlHost}${apiProxy}/${api}`, {
      dataType: 'json',
      method: 'POST',
      timeout: '30000',
      headers: header,
      data: JSON.stringify({
        uaTime: formatTime(new Date().getTime()),
      }),
    });
    if (!(res.status === 200 && res.data.code.toString() === '0')) {
      const errorData = {
        domain: domainData.domainName, // 域名
        message: res.status === 200 ? `${api}报错 code非0` : `${api}报错 status非200`, // 描述
        key: res.status === 200 ? 'res.data.message' : 'res.status', // key
        data: res.status === 200 ? JSON.stringify(res.data) : res.status, // value
      };
      if (!hostFilter.test(domainData.domainName)) {
        app.logger.error(JSON.stringify(errorData));
      }
    }
    return res;
  }
  return {};
};

module.exports = getData;
