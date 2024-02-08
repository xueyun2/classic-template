layui.define(['jquery'], function (exports) {
  const $ = layui.jquery;
  const myUtils = {
    //获取当前页面参数
    getUrlParams: function () {
      let url = window.location.href;
      // 通过 ? 分割获取后面的参数字符串
      let urlStr = url.split('?')[1];
      if (!urlStr) return {};
      // 创建空对象存储参数
      let obj = {};
      // 再通过 & 将每一个参数单独分割出来
      let paramsArr = urlStr.split('&');
      for (let i = 0, len = paramsArr.length; i < len; i++) {
        // 再通过 = 将每一个参数分割为 key:value 的形式
        let arr = paramsArr[i].split('=');
        obj[arr[0]] = decodeURI(arr[1]);
      }
      return obj;
    },
    /**
     * 监听layui窗口变化自动居中窗口
     * @param {string} className - 类名或ID名
     * @param {function} unobserve - resizeObserver.unobserve($('.custom-popup')[0]) 关闭窗口后关闭监听，接收原生DOM元素
     * @param {function} observe - resizeObserver.observe($('.custom-popup')[0]) 打开时启动监听，接收原生DOM元素
     */
    centerPopup: function (className) {
      let resizeObserver = new ResizeObserver((entries) => {
        let elementHeight = entries[0].contentRect.height;
        let winHieght = window.innerHeight;
        $(className).css({ top: +(winHieght - elementHeight) / 2 - 20 + 'px' });
      });
      return resizeObserver;
    },
    /**
     * 设置本地存储
     * @param {string} key - 存储名称
     * @param {string} value - 存储值
     */
    lsSetItem: function (key, value) {
      return localStorage.setItem(key, value);
    },
    /**
     * 获取本地存储值
     * @param {string} key - 要读取的key名称
     */
    lsGetItem: function (key) {
      return localStorage.getItem(key);
    },
    /**
     * 删除本地存储值
     * @param {string} key - 要删除的key名称
     */
    lsRemoveItem: function (key) {
      return localStorage.removeItem(key);
    },
    //获取用户信息
    getUserInfo: function () {
      return JSON.parse(this.lsGetItem('USER_INFO'));
    },
    /**
     * 生成随机ID
     * @param {nubmer} length - 随机长度
     */
    generateRandomId: function (length) {
      let result = '';
      let characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let charactersLength = characters.length;

      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }

      return result;
    },
    /**
     * 用于制作上拉加载函数
     * @param {string} elem - 要监听该元素的滚动事件
     * @param {functon} cd  - 当前滚动条触底时执行回调函数
     */
    scroll: function (elem, cd) {
      $(elem).on('scroll', function () {
        const scrollTop = $(this).scrollTop();
        if ($(this)[0].scrollHeight - $(this)[0].offsetHeight == scrollTop) {
          cd();
        }
      });
    }
  };
  exports('myUtils', myUtils);
});
