//config的设置是全局的
layui
    .config({
        base: '/static/js/' //根目录
    })
    .extend({
        api: 'public/api', //全局API
        popup: 'plugin/popup', //弹窗插件
        share: 'plugin/share', //分享插件
        expSelect: 'plugin/expSelect', //下拉多选控件
        Countdown: 'plugin/countdown', //倒计时插件
        layuiWangEditor: 'lib/wangEditor/layuiWangEditor', //富文本编辑器
        request: 'public/request' //请求
    });
//所有项目中都有的效果
layui.use(['jquery'], function () {
    //要执行的全局JS
    const global = {
        init: function () {
            console.log('所222有项目都加载的js1:layui.config11.js2336666');
        }
    };
    global.init();
});
