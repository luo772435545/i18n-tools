
const config = {
    filePrefix:'outWareManage', //前缀
    _this:'v', //vue里面的this
    i18n:'$t', //i18n 定义的t
    messageName:'lang_message',
    entry:'./src3',
    output:'./target',
    exclude:['./src/components/setCenter'], //不做国际化文件夹
    langOutput:'./messages_zh.js', //语言导出
    langName:'./messages_zh.js', //语言导出
};

module.exports = config;
