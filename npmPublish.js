const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const nodemailer = require("nodemailer");
const emails = require('./emails');
let tag = 'bate-jira-6.0';
const queryTime = new Date(new Date().getTime() - 1000*60*60*24);
try{
    cp.execSync('export LESSCHARSET=utf-8', {cwd: '.'});
    cp.execSync('set LESSCHARSET=utf-8', {cwd: '.'});
}catch (e) {

}

const comitLog = cp.execSync(`git log --after="${queryTime}" --pretty=format:"%s"`, {cwd: '.'}).toString().split('\n');
const comitFiles = cp.execSync(`git log --after="${queryTime}" --name-only --pretty=format:`, {cwd: '.'}).toString().split('\n');
let version = JSON.parse(fs.readFileSync('./package.json', 'UTF-8')).version;
try {
    const arg = JSON.parse(process.env.npm_config_argv).original.slice(2)[0];
    tag = arg.split('=')[1]
} catch (e) {

}
let gitVersion = '';
try {
    const gitHead = fs.readFileSync('.git/HEAD', 'utf-8').trim();
    gitVersion = gitHead.split('/')[2];
} catch (e) {
    throw ('no git version');
}

const tags = cp.execSync('npm dist-tag ls', {cwd: '.'}).toString().split('\n');
const tagsMap = {};
tags.forEach((item) => {
    if (item) {
        let str = item.replace(' ', '');
        let arr = str.split(':');
        tagsMap[arr[0]] = arr[1];
    }
});

if (tag === 'latest' && gitVersion !== 'master') {
    console.log('\x1B[31m%s\x1B[0m', new Error(`latest 只允许 master 更新`));
    throw ``
}
// if(tagsMap[tag]){
//     console.log('\x1B[31m%s\x1B[0m', new Error(`此tag已存在: ${tag}, \n现有tag如下:\n${Object.keys(tagsMap).join('\n')}`));
//     throw '';
// }

const tagsKeys = Object.keys(tagsMap);
tagsKeys.forEach((item) => {
    if (tagsMap[item] === version) {
        console.log('\x1B[31m%s\x1B[0m', new Error(`tag: ${item} 中已存在该版本: ${version}`));
        throw ``;
    }
});
if (!/^([1-9]\d|[1-9])(\.([1-9]\d|\d)){2}$/.test(version) && tag === 'latest' && gitVersion === 'master') {
    console.log('\x1B[31m%s\x1B[0m', new Error(`master 提交的latest tag 只允许三位版本号，但是当前版本号为: ${version}。 参考https://wiki.chaindown.com/pages/viewpage.action?pageId=19268961`));
    throw '';
}
if (!/[-]b[-]jira/.test(version) && tag !== 'latest' && gitVersion !== 'master') {
    console.log('\x1B[31m%s\x1B[0m', new Error(`测试分支提交的tag需要以bate开头并且有-b和-jira标志，但是当前版本号为: ${version}。 参考https://wiki.chaindown.com/pages/viewpage.action?pageId=19268961`));
    throw ``;
}

cp.exec(`npm publish --tag=${tag}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`执行出错: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    if (tag === 'latest') {
        async function main(email) {
            let transporter = nodemailer.createTransport({
                host: "smtp.exmail.qq.com",
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: 'service1@chainup.com', // generated ethereal user
                    pass: 'S1q2w3e4r' // generated ethereal password
                }
            });

            let info = transporter.sendMail({
                from: 'service1@chainup.com', // sender address
                to: email, // list of receivers
                subject: "私有化BlockChain-ui-privatization 更新", // Subject line
                html: `<h2>版本更新</h2>
            <br/>
            <b>私有化BlockChain-ui-privatization 已更新到 ${version}</b>
            <br/>
            <h3>提交信息</h3>
            ${comitLog.map(item => `<p>${item}</p>`).join('')}
            <h3>更新文件</h3>
            ${comitFiles.map(item => `<p>${item}</p>`).join('')}
            ` // html body
            });

            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        emails.forEach((email) => {
            main(email).catch(console.error);
        });
    }
});
