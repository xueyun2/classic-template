layui.define(['jquery'], function (exports) {
    const $ = layui.jquery;
    let maskIndex = 887;
    /**
     * 默认参数
     * @param {string}  open        - 打开弹窗节点名称
     * @param {string}  title       - 标题
     * @param {Boolean} close       - 显示关闭按钮
     * @param {string}  direction   - 设置方向可选：（l:左,r:右,t:上,b:下）
     * @param {Object}  content     - 必须是一个节点对象
     * @param {Boolean} maskHide    - 是否开启点击黑色遮罩关闭
     * @param {function} beforeOpen - 打开前回调，返回false阻止打开
     * @param {function} beforeClose- 关闭前回调，返回false阻止关闭
     * @param {function} success    - 打开成功回调函数，返回当前点击元素
     * @param {function} closeFunc  - 关闭成功回调函数，无返回值
     * @param {boolean} noScroll    - 是否开启Body，html滚动
     */

    const animateType = {
        //抛物线动画
        parabola: function (timeFraction) {
            return Math.pow(timeFraction, 2);
        }
    };
    const allAnimate = {
        /**
         * @param {function} timing 动画类型函数
         * @param {function} draw   渲染函数，用于渲染节点变化
         * @param {number} duration 设置动画时长毫秒为单位
         */
        animate: function ({ timing, draw, duration }) {
            let start = performance.now();
            requestAnimationFrame(function animate(time) {
                // timeFraction 从 0 增加到 1
                let timeFraction = (time - start) / duration;
                if (timeFraction > 1) timeFraction = 1;
                // 计算当前动画状态
                let progress = timing(timeFraction);
                draw(progress); // 绘制
                if (timeFraction < 1) {
                    requestAnimationFrame(animate);
                }
            });
        },
        /**
         * 底部向上显示
         * @param {string} popupBox 执行动画元素ID
         * @param {Boolean} change  开启或关闭动画切换
         */
        downShow: function (popupBox, change = true) {
            this.animate({
                duration: 250,
                timing: animateType.parabola,
                draw(progress) {
                    let isShow = change ? 100 - 100 * progress : progress * 100;
                    let opacit = change ? progress * 1 : 1 - 1 * progress;
                    $('#' + popupBox).css({
                        display: 'block',
                        width: '100%',
                        bottom: 0,
                        left: 0,
                        transform: 'translate3d(0, ' + isShow + '%, 0)',
                        opacity: opacit
                    });
                }
            });
        },
        /**
         * 左侧向滑动显示
         */
        leftShow: function (popupBox, change = true) {
            this.animate({
                duration: 250,
                timing: animateType.parabola,
                draw(progress) {
                    let isShow = change ? 100 - 100 * progress : progress * 100;
                    let opacit = change ? progress * 1 : 1 - 1 * progress;
                    $('#' + popupBox).css({
                        display: 'block',
                        height: '100%',
                        top: 0,
                        left: 0,
                        transform: 'translate3d(' + -isShow + '%, 0, 0)',
                        opacity: opacit
                    });
                }
            });
        },
        /**
         * 右侧向滑动显示
         */
        rightShow: function (popupBox, change = true) {
            this.animate({
                duration: 250,
                timing: animateType.parabola,
                draw(progress) {
                    let isShow = change ? 100 - 100 * progress : progress * 100;
                    let opacit = change ? progress * 1 : 1 - 1 * progress;
                    $('#' + popupBox).css({
                        display: 'block',
                        height: '100%',
                        top: 0,
                        right: 0,
                        transform: 'translate3d(' + isShow + '%, 0, 0)',
                        opacity: opacit
                    });
                }
            });
        },
        /**
         * 顶部滑入
         * @param {string} popupBox 执行动画元素ID
         * @param {Boolean} change  开启或关闭动画切换
         */
        topShow: function (popupBox, change = true) {
            this.animate({
                duration: 250,
                timing: animateType.parabola,
                draw(progress) {
                    let isShow = change ? 100 - 100 * progress : progress * 100;
                    let opacit = change ? progress * 1 : 1 - 1 * progress;
                    $('#' + popupBox).css({
                        display: 'block',
                        width: '100%',
                        top: 0,
                        left: 0,
                        transform: 'translate3d(0, ' + -isShow + '%, 0)',
                        opacity: opacit
                    });
                }
            });
        }
    };
    /**
     * 函数描述
     * @param {Object} newConfig 必须是一个对象
     */
    function Popup(newConfig) {
        const defaultConfig = {
            open: '',
            title: '',
            close: false,
            direction: 'b',
            content: '',
            maskHide: true,
            noScroll: false,
            beforeOpen: function () {
                return true;
            },
            beforeClose: function () {
                return true;
            },
            success: function () {},
            closeFunc: function () {}
        };
        // if (!newConfig.hasOwnProperty('open')) {
        //     console.error('错误：缺少：open参数')
        //     return false
        // }
        // if (newConfig.open[0] != '.') {
        //     if (newConfig.open[0] != '#') {
        //         console.error('错误：open必须是一个class名或ID名称')
        //         return false
        //     }
        // }
        // if (!newConfig.content instanceof $) {
        //     console.error('错误：content必须是一个jquery节点对象')
        //     return false
        // }
        this.config = $.extend(true, defaultConfig, newConfig); //合并参数
        this.popupContent = this.getUuiD(32); //内容父级ID
        this.popupBox = this.getUuiD(32); //弹窗父级ID
        this.closeBtn = this.getUuiD(32); //关闭ID
        this.cover = this.getUuiD(32); //遮罩ID
        this.init(); //初始化
    }
    Popup.prototype = {
        constructor: Popup,
        //初始化函数
        init: function () {
            this.createNode(); //创建节点
            this.buildEvent(); //初始化事件绑定
        },
        //创建结构
        createNode: function () {
            let { close, title, content } = this.config;
            maskIndex += 1;
            let popupBox =
                'background-color: #fff;padding: 0.7rem;box-sizing: border-box;display: none;position: fixed;';
            let popupHead =
                'display: flex;justify-content: space-between;align-items: center;margin-bottom: .5rem;';
            let popupTitle = 'color: #333;font-size: .9rem;';
            let popupClose = 'color: #999;font-size: .7rem;';
            let popupNode = `<div id="${
                this.popupBox
            }" class="popup-box" style="z-index:${maskIndex + 1};${popupBox}">
                                ${
                                    title != ''
                                        ? `<div class="popup-head" style="${popupHead}">
                                    <div class="popup-title" style="${popupTitle}">${
                                        title || '标题'
                                    }</div>
${
    close
        ? `<span class="popup-close" style="${popupClose}" id=${this.closeBtn}> <i class="iconfont font-24 icon-guanbi"></i> </span>`
        : ''
}
                                </div>`
                                        : ''
                                }
            <div class="popup-content" id="${this.popupContent}">
                                    
                                </div>
                            </div>`;
            let mask = `<div id="${this.cover}" style="z-index:${maskIndex};background: rgba(0,0,0,.5);width: 100%; height: 100%;position: fixed;top: 0;left: 0;" class="mask"></div>`;
            $('body').append(popupNode);
            $('body').append(mask);
            $('#' + this.popupContent).append(content);
            if (content instanceof $) {
                content.show();
                return false;
            }
        },
        //事件绑定
        buildEvent: function () {
            let { open } = this.config;
            let _this = this;
            //打开弹窗
            if (open) {
                $(document).on('click', open, function () {
                    _this.showBox($(this));
                });
            }
        },
        //显示函数
        /**
         * @param {jquery} $this - 接收一个jQuery节点对象
         */
        showBox: function ($this = {}) {
            let {
                direction,
                maskHide,
                success,
                closeFunc,
                close,
                beforeOpen,
                noScroll
            } = this.config;
            if (!beforeOpen($this)) {
                return false;
            }
            let _this = this;
            $('#' + this.cover).fadeIn();
            switch (direction) {
                case 'b':
                    allAnimate.downShow(this.popupBox);
                    break;
                case 'l':
                    allAnimate.leftShow(this.popupBox);
                    break;
                case 'r':
                    allAnimate.rightShow(this.popupBox);
                    break;
                default:
                    allAnimate.topShow(this.popupBox);
                    break;
            }
            success($this);
            //点击黑色遮罩事件
            if (maskHide) {
                $(document).one('click', '#' + _this.cover, function () {
                    _this.hideBox();
                    closeFunc();
                });
            }
            //点击关闭按钮事件
            if (close) {
                $(document).one('click', '#' + _this.closeBtn, function () {
                    _this.hideBox();
                    closeFunc();
                });
            }
            //判断是否关闭body，html滚动
            if (noScroll) {
                $('body,html').css({ overflow: 'hidden' });
            } else {
                $('body,html').css({ overflow: 'initial' });
            }
        },
        //关闭事件
        hideBox: function () {
            let { direction, beforeClose, noScroll } = this.config;
            if (!beforeClose()) {
                return false;
            }
            //关闭时回复body滚动
            if (noScroll) {
                $('body,html').css({ overflow: 'initial' });
            }
            $('#' + this.cover).fadeOut();
            switch (direction) {
                case 'b':
                    allAnimate.downShow(this.popupBox, false);
                    break;
                case 'l':
                    allAnimate.leftShow(this.popupBox, false);
                    break;
                case 'r':
                    allAnimate.rightShow(this.popupBox, false);
                    break;
                default:
                    allAnimate.topShow(this.popupBox, false);
                    break;
            }
        },
        /**
         * 生成一个用不重复的ID
         * @param { Number } randomLength
         */
        getUuiD: function (randomLength) {
            return Number(
                Math.random().toString().substr(2, randomLength) + Date.now()
            ).toString(36);
        },
        /**
         * 重新设置弹窗内容
         * @param {jquery|string} content - jQuery节点对象，或者节点字符串
         */
        setContent: function (content) {
            if (content instanceof $) {
                let cloneContent = content.clone(true);
                $('#' + this.popupContent).html(cloneContent);
                cloneContent.show();
                return false;
            }
            $('#' + this.popupContent).html(content);
        }
    };
    exports('popup', Popup);
});
