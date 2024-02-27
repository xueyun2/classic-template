# 打包传统前端项目文件

## 环境安装

> 如果出现Downloading [https://github.com/Medium/phantomjs/releases/download/v2.1.1/phantomjs-2.1.》 1-windows.zip](https://github.com/Medium/phantomjs/releases/download/v2.1.1/phantomjs-2.1.1-windows.zip)
> 自行下载保存到该目录： C:\Users\Administrator\AppData\Local\Temp\phantomjs\phantomjs-2.1.1-windows.zip
> 出现`pnpm` 无法识别为命令错误时：`set-ExecutionPolicy RemoteSigned`在命令行中运行命令后，输入A后，回车

1. 安装node环境
<https://nodejs.org/en>
2. 安装pnpm包管理

```shell
npm install -g pnpm
# 安装gulp打包工具
pnpm add gulp-cli -g
# 安装环境依赖
pnpm add cross-env -g
# 到项目目录下运行以下命令安装所需依赖
pnpm i
# 运行命令打开项目
pnpm dev
# 打包项目
pnpm build
```

## 目录结构

```shell
build            # 最终打包目录 
src              # 入口
├─static         # 静态资源
│  ├─css         # pc，mp共用css
│  ├─icon        # 图标，svg目录
│  ├─img         # 网络图片资源
│  ├─js          # 项目pc，mp共用js
│  ├─mp          # mp独有css，js
│  │  ├─css
│  │  └─js
│  └─pc          # pc独有css，js
│      ├─css   
│      └─js
└─view           # 分pc，mp目录存放html
    ├─mp
    └─pc
```

## 默认配置

```javascript
文件：config.js
```

> 在打包移动端已375设计稿为基准，转换移动端单位为vw

```js
{
    input: 'src', //指定入口
    output: 'build', //指定出口
    device: 'mp', //指定移动端目录名称用于处理css文件中的单位换算，其他目录不做特殊处理。
    //配置文件过滤{js:[],css:[],html:[]}
    filter: {
        html: [`!./**/component/**/*.html`],
        css: [`!./**/tailwindcss.css`, `!./**/iconfont.css`]
    },
    //配置字体打包路径
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
    //配置模板全局需数据
    tplData: {}, 
    //静态服务配置
    serverConfig: {
        livereload: true, //文件修改自动刷新
        host: 'localhost', //域名前缀
        port: 9900, //端口
        open: '', //要打开的页面，指向打包成功后的文件目录
        //配置代理
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
    //移动端设计稿尺寸
    viewportWidth:375
}
```

## 插件使用

## art-template模板

> 详细文档：<https://aui.github.io/art-template/docs/syntax.html>

### 子模板

```html
<!-- 引入模板 -->
{{include "./component/globalStyle.html"}}
<!-- 模板传入变量,一般已对象形式传入 -->
{{include "./component/globalStyle.html" data}}
<!-- 子模板使用父模板传入的变量值 -->
{{ $data.name }}
```

### 条件语句

```html
<!-- 三目运算 -->
{{$data.page==$value.name?'nav-active':''}}
<!-- 条件语句 -->
{{if v1}} ... {{else if v2}} ... {{/if}}
{{if value}} ... {{/if}}
```

### 变量

``` html
<!-- 变量 -->
{{ set nav = '声明了nav变量'}}
<!-- 使用变量 -->
{{nav}}
```

### 循环

```html
<!-- 循环$index索引，$value循环值 -->
{{each target}}
    {{$index}} {{$value}}
{{/each}}
```

## 打包node_modules

引入`npm`下载的包打包成一个文件。

### 语法

```html
<!--build:类型:js,css  最终打包路径:/static/js/lib/lib.all.js -->
<!-- build:js /static/js/lib/lib.all.js -->
引入node_modules包文件
<!-- endbuild -->
```

```html
<!-- build:js /static/js/lib/lib.all.js -->
<script src="/node_modules/layui/dist/layui.js"></script>
<script src="/node_modules/md5/dist/md5.min.js"></script>
<script src="/node_modules/js-cookie/dist/js.cookie.min.js"></script>
<script src="/node_modules/axios/dist/axios.min.js"></script>
<!-- endbuild -->
```

## css库tailwindcss.css

### 使用文档

<https://www.tailwindcss.cn/>

## mock服务器配置

>详细文档：<https://www.npmjs.com/package/gulp-mock-server>

### mock目录

```shell
├─mock                # 静态数据文件
│  ├─login.js         # 已js文件的方式配置，可以使用参数
│  ├─login.json       # 如果不需要然和参数则直接创建一个json已名字为接口即可：/login
```

```javascript
//文件： login.js
//最终接口：login?id=123
module.exports = {
    params: { id: 123 },
    response: './login/login.json'
};
//可以配置不同参数返回不同的json数据
module.exports = [{
    params: { id: 123 },
    response: './login/login.json'
},
{
    params: { id: 666 },
    response: './login/login2.json'
}];
```

```javascript
    request.post('login', { id: 123 }).then((res) => {
        console.log(res);
    });
```
