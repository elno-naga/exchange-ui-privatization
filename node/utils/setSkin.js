const fs = require('fs');
// const dirExists = require('./mkdir');
// const hostFilter = require('./host-filter.js');

const setSkin = async (domainData, app, fileBasePath, skinDataPath) => {
  let res = {};
  try {
    res = await app.ctx.curl(skinDataPath, {
      dataType: 'json',
      method: 'GET',
      timeout: '30000',
    });
    console.log('读取成功');
    // eslint-disable-next-line no-empty
  } catch (err) {
    const errorData = {
      domain: domainData.domainName, // 域名
      message: `${skinDataPath} 读取失败`, // 描述
      err,
    };
    app.logger.error(JSON.stringify(errorData));
  }
  if (res.status === 200 && res.data && Object.keys(res.data).length) {
    fs.writeFile(`${fileBasePath}${domainData.fileName}.json`,
      JSON.stringify(res.data, 'utf8'), (err) => {
        if (err) {
          const errorData = {
            domain: domainData.domainName, // 域名
            message: `${skinDataPath} 保存失败`, // 描述
            err,
          };
          app.logger.error(JSON.stringify(errorData));
        }
      });
    return res.data;
  }
  return null;
};

module.exports = setSkin;
