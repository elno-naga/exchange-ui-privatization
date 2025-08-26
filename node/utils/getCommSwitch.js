const fs = require('fs');
const path = require('path');
const dirExists = require('./mkdir');
const hostFilter = require('./host-filter');

const getCommSwitch = async (domainData, host, app, fileBasePath, api, lan, cusSkin) => {
  dirExists(fileBasePath);
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
    if (cusSkin) {
      header.theme = cusSkin.toString() === '1' ? 'Dark' : 'Light';
    }
    const res = await app.ctx.curl(`${urlHost}${apiProxy}/${api}`, {
      dataType: 'json',
      method: 'GET',
      timeout: '30000',
      headers: header,
    });
    if (res.status === 200 && res.data.code.toString() === '0') {
      const intoPath = `${fileBasePath}${domainData.fileName}_allSwitch.json`;
      dirExists(intoPath);
      fs.writeFile(intoPath, JSON.stringify(res.data.data.switchVo, 'utf8'), (error) => {
        if (error) {
          const errorData = {
            domain: domainData.domainName, // 域名
            message: `${api} 保存失败`, // 描述
            error,
          };
          if (!hostFilter.test(domainData.domainName)) {
            app.logger.error(JSON.stringify(errorData));
          }
        }
        const errorData = {
          domain: domainData.domainName, // 域名
          message: `${api} 请求成功`, // 描述
        };
        if (!hostFilter.test(domainData.domainName)) {
          app.logger.error(JSON.stringify(errorData));
        }
      });
    } else {
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
  }
};

module.exports = getCommSwitch;
