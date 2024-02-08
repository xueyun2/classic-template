module.exports = {
    input: 'src',
    output: 'build',
    device: 'mp', //指定移动端目录名称
    //过滤文件
    filter: {
        js: ['!src/static/pc/js/login/login.js']
    },
    //配置打包字体图标
    iconfontConfig: {
        fontPath: '../font/', //字体相对路径
        path: './src/static/css/iconfont.css', //字体模板路径
        targetPath: '../../static/css/iconfont.css', //iconfont.css输出路径
        buildPath: 'build/static/font' //最终字体打包路径
    },
    //配置本地服务
    serverConfig: {
        open: '/view/pc/index.html'
    },
    //配置模板全局变量
    tplData: {}
};
