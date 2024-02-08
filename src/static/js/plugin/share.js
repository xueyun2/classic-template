layui.define(['jquery', 'qrcode'], function (exports) {
  const $ = layui.jquery;
  const QRCode = layui.qrcode;
  /**
   * @param {string} url          - 当前URL
   * @param {string} source       - 来源URL
   * @param {string} title        - 当前页面标题
   * @param {string} description  - 页面描述
   * @param {string} image        - 页面图片-默认取网站第一张图
   * @param {string} weiboKey     - 微博key
   */
  function Share(setConfig) {
    const head = $(document.head);
    this.defaultConfig = {
      url: location.href,
      source: location.origin,
      title:
        head.find('[name=title], [name=Title]').attr('content') ||
        document.title,
      description:
        head.find('[name=description], [name=Description]').attr('content') ||
        '',
      image: $('img:first').prop('src') || '',
      weiboKey: ''
    };
    this.config = $.extend(this.defaultConfig, setConfig);
    this.address = {
      //QQ空间
      qzone: `http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${this.config.url}&title=${this.config.title}&desc=${this.config.description}&summary=${this.config.description}&site=${this.config.source}&pics=${this.config.image}`,
      //qq
      qq: `http://connect.qq.com/widget/shareqq/index.html?url=${this.config.url}&title=${this.config.title}&source=${this.config.source}&desc={{DESCRIPTION}}&pics=${this.config.description}`,
      //腾讯空间
      tencent: `http://share.v.t.qq.com/index.php?c=share&a=index&title=${this.config.title}&url=${this.config.url}&pic=${this.config.image}`,
      //微博
      weibo: `https://service.weibo.com/share/share.php?url=${this.config.url}&title=${this.config.title}&pic=${this.config.image}&appkey=${this.config.weiboKey}`
    };
  }
  /**
   * @param {element} ele         - 原生元素
   * @param {number} w            - 宽
   * @param {number} h            - 高
   * @param {string} colorDark    - 颜色
   * @param {string} colorLight   - 背景颜色
   */
  Share.prototype.createQrcode = function (setConfig) {
    let defaulConfig = {
      w: 128,
      h: 128,
      colorDark: '#000',
      colorLight: '#fff'
    };
    let config = $.extend(defaulConfig, setConfig);
    let qrcode = new QRCode(config.ele, {
      text: this.config.url,
      width: config.w,
      height: config.h,
      colorDark: config.colorDark,
      colorLight: config.colorLight,
      correctLevel: QRCode.CorrectLevel.H
    });
  };
  exports('share', Share);
});
