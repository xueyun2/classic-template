const { src, dest, series, watch, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass')); //scss文件编译成css
const autoprefixer = require('autoprefixer'); //给css自动添加前缀兼容
const htmlmin = require('gulp-htmlmin'); //压缩Html
const uglify = require('gulp-uglify'); //压缩js子支持ES5压缩
const babel = require('gulp-babel'); //ES6转ES5
const cssnano = require('cssnano'); //css压缩
const webserver = require('gulp-webserver'); //本地服务
const mockServer = require('gulp-mock-server'); //Mock数据模拟服务器
const template = require('gulp-art-template4'); //引入静态模板
const gulpif = require('gulp-if'); //gulp条件语句
const sourcemaps = require('gulp-sourcemaps'); //源映射
const postcss = require('gulp-postcss'); //转换css代码
const cleanCSS = require('gulp-clean-css'); //html压缩内置style
const eslint = require('gulp-eslint'); //代码检查
const tailwindcss = require('tailwindcss'); //tailwindcss自动生成对应类名样式
const uncss = require('gulp-uncss'); //清理未使用的css样式
const postcssPxToViewport = require('postcss-px-to-viewport-8-plugin'); //移动端转换px转换vh和vw
const useref = require('gulp-useref'); //自动分析Html中引入的文件进行打包
const config = require('./config'); //用户选项配置
const path = require('path'); //node路径模块
const iconfont = require('gulp-iconfont'); //把svg打包成字体图标
const iconfontCss = require('gulp-iconfont-css'); //自动生成iconfont.css文件
const _ = require('lodash'); //工具函数
const clean = require('gulp-clean'); //文件清理
const changedInPlace = require('gulp-changed-in-place'); //只处理已更改的文件
const replace = require('gulp-replace');
//默认配置
let defaultConfig = {
    input: 'src', //指定入口
    output: 'build', //指定出口
    device: 'mp', //指定移动端目录名称用于处理css文件中的单位换算，其他目录不做特殊处理。
    filter: {
        html: [`!./**/component/**/*.html`],
        css: [`!./**/tailwindcss.css`, `!./**/iconfont.css`]
    },
    iconfontConfig: {
        fontPath: '', //字体相对路径
        path: '', //字体模板路径
        targetPath: '', //iconfont.css输出路径
        buildPath: '' //最终字体打包路径
    },
    //配置HTML压缩
    htmlminConfig: {
        collapseWhitespace: false, //html压缩成一行
        minifyJS: true, //压缩内嵌js无法压缩ES6语法
        minifyCSS: cleanCSS({ compatibility: 'ie8' }), //压缩html中的css
        removeComments: true, //删除html中的注释
        removeEmptyAttributes: true, //删除包空的节点属性
        trimCustomFragments: true, //修剪周围空格
        ignoreCustomFragments: [/\{\{(.+?)\}\}/g], //允许在匹配时忽略某些片段的正则表达式数组（例如<?php ... ?>、{{ ... }}等）
        minifyURLs: true
    },
    tplData: {}, //配置模板全局需数据
    //静态服务配置
    serverConfig: {
        livereload: true, //文件修改自动刷新
        host: 'localhost', //域名前缀
        port: 9900, //端口
        open: '', //要打开的页面，指向打包成功后的文件目录
        proxies: [
            {
                source: '/api',
                target: 'http://localhost:8000/'
            }
        ]
    },
    //mock服务器配置
    mockServerConfig: {
        mockDir: './mock'
    },
    //设置移动端设计稿宽度
    viewportWidth: 375
};
//当前打包模式
const ENV = process.env.NODE_ENV != 'production' ? true : false;
console.log('当前模式', ENV);
const {
    jsInput,
    cssInput,
    staticInput,
    htmlInput,
    input,
    output,
    filter,
    device,
    serverConfig,
    htmlminConfig,
    iconfontConfig,
    svgInput,
    mockServerConfig,
    tplData,
    viewportWidth
} = inputConfig();

//合并配置输出
function inputConfig() {
    const {
        input,
        output,
        serverConfig,
        htmlminConfig,
        filter,
        device,
        iconfontConfig,
        mockServerConfig,
        tplData,
        viewportWidth
    } = _.merge(defaultConfig, config);

    const jsInput = `${input}/**/*.js`;
    const cssInput = `${input}/**/*.{css,scss}`;
    const staticInput = `${input}/**/*.{png,jpg,gif}`;
    const svgInput = `${input}/**/*.svg`;
    const htmlInput = `${input}/**/*.html`;
    return {
        jsInput,
        cssInput,
        staticInput,
        htmlInput,
        input,
        output,
        filter,
        device,
        serverConfig,
        htmlminConfig,
        iconfontConfig,
        svgInput,
        mockServerConfig,
        tplData,
        viewportWidth
    };
}
//监听文件，运行指定任务。
function watchFile() {
    watch(jsInput, jsTask(jsInput, output));
    watch(cssInput, cssTask(cssInput, output));
    watch(staticInput, otherTask(staticInput, output));
    watch(htmlInput, htmlTask(htmlInput, output));
    if (!_.isEmpty(iconfontConfig)) {
        watch(svgInput, iconfontTask);
    }
    watch(`${input}/**/iconfont.css`, iconfontTask);
    watch(`${input}/**/tailwindcss.css`, htmlTask(htmlInput, output));
    watch(`${input}/**/component/**/*.html`, htmlTask(htmlInput, output));
}
//打包过程清理build文件
function cleanTask() {
    return src(`./${output}`, { allowEmpty: true }).pipe(clean());
}
//创建本地服务
function server() {
    return src(output).pipe(webserver(serverConfig));
}
//mock模拟数据服务器
function startMockServer() {
    return src('.').pipe(mockServer(mockServerConfig));
}
//ES6转ES5
function setBabel() {
    return babel({
        presets: ['@babel/env']
    });
}
//压缩js
function setUglify() {
    return uglify({
        output: {
            ascii_only: true //把中文转换成Unicode编码
        }
    });
}
//打包js
function jsTask(path, build) {
    return function javaScript() {
        return src([path, ...filter.js])
            .pipe(
                changedInPlace({
                    firstPass: true
                })
            )
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failAfterError())
            .pipe(gulpif(ENV, sourcemaps.init()))
            .pipe(gulpif(!ENV, setBabel()))
            .pipe(gulpif(!ENV, setUglify()))
            .pipe(gulpif(ENV, sourcemaps.write()))
            .pipe(dest(build));
    };
}
//设置css压缩插件
function cssPostcss() {
    return postcss([tailwindcss(), autoprefixer(), cssnano()]);
}
//处理移动端上的css
function mpCssPostcss() {
    return postcss([
        tailwindcss(),
        postcssPxToViewport({
            viewportWidth: viewportWidth
        }),
        autoprefixer(),
        cssnano()
    ]);
}
//打包css&scss
function cssTask(path, build) {
    return function cssAndScss() {
        return src([path, ...filter.css])
            .pipe(gulpif(ENV, sourcemaps.init()))
            .pipe(gulpif('*.scss', sass({ outputStyle: 'compressed' }).on('error', sass.logError)))
            .pipe(
                changedInPlace({
                    firstPass: true
                })
            )
            .pipe(gulpif(!ENV, gulpif('*.css', uncss({ html: [htmlInput] }))))
            .pipe(gulpif(customPathCondition, mpCssPostcss(), gulpif('*.css', cssPostcss())))
            .pipe(gulpif(ENV, sourcemaps.write()))
            .pipe(dest(build));
    };
}
//打包svg打包为字体图标
function iconfontTask() {
    return src(svgInput)
        .pipe(
            iconfontCss({
                fontName: 'iconfont',
                fontPath: iconfontConfig.fontPath,
                path: iconfontConfig.path,
                targetPath: iconfontConfig.targetPath
            })
        )
        .pipe(
            iconfont({
                fontName: 'iconfont',
                prependUnicode: true,
                normalize: true,
                fontHeight: 1024
            })
        )
        .pipe(dest(iconfontConfig.buildPath));
}
//复制图片字体资源
function otherTask(path, build) {
    if (!path) return (cd) => cd();
    return function static() {
        return src(path, { allowEmpty: true })
            .pipe(
                changedInPlace({
                    firstPass: true
                })
            )
            .pipe(dest(build));
    };
}
//判断当前处理的文件是否在移动端上
function customPathCondition(file) {
    // 检查文件路径中是否包含'mp'且当前分子为移动端上
    const extension = path.extname(file.path);
    const regex = new RegExp('\\\\' + device + '\\\\', 'g');
    return regex.test(file.path) && extension == '.css';
}
//打包HTML
const pathRegex = new RegExp('/' + input + '/', 'g');
function htmlTask(paths, build) {
    return function html() {
        return src([paths, ...filter.html])
            .pipe(
                template(
                    tplData,
                    {
                        extname: '.html' // some art-template options
                    },
                    {
                        ext: '.html'
                    }
                )
            )
            .pipe(
                useref({
                    searchPath: ['.']
                })
            )
            .pipe(gulpif(customPathCondition, mpCssPostcss(), gulpif('*.css', cssPostcss())))
            .pipe(gulpif('*.css', gulpif(!ENV, uncss({ html: [htmlInput] }))))
            .pipe(
                changedInPlace({
                    firstPass: true
                })
            )
            .pipe(gulpif('*.js', setBabel()))
            .pipe(gulpif(!ENV, gulpif('*.js', setUglify())))

            .pipe(gulpif(!ENV, gulpif('*.html', htmlmin(htmlminConfig))))
            .pipe(gulpif('*.html', replace(pathRegex, '/')))
            .pipe(dest(build));
    };
}
//打包上线模式
function bulid() {
    return series(
        cleanTask,
        parallel(
            htmlTask(htmlInput, output),
            jsTask(jsInput, output),
            cssTask(cssInput, output),
            otherTask(staticInput, output),
            gulpif(!_.isEmpty(iconfontConfig), iconfontTask)
        )
    );
}
//开发者模式
function dev() {
    return series(
        parallel(
            htmlTask(htmlInput, output),
            jsTask(jsInput, output),
            cssTask(cssInput, output),
            otherTask(staticInput, output)
        ),
        startMockServer,
        gulpif(!_.isEmpty(iconfontConfig), iconfontTask),
        server,
        watchFile
    );
}
exports.default = ENV ? dev() : bulid();
