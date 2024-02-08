layui.define(['jquery'], function (exports) {
    let $ = layui.jquery;
    function Countdown() {}
    Countdown.prototype = {
        /**
         * 验证码倒计时功能模块
         * @param {number} last 传入倒计时以秒为单位
         * @param {Object} node 传入一个按钮节点 - 在此按钮上设置倒计时不可点击
         */
        init: function (last, node) {
            var startDate = this.Conversion();
            var _this = this;
            var endDate = startDate + last;
            var beforeText = node.text();
            var Timer = setInterval(function () {
                startDate = _this.Conversion();
                var allTime = _this.countdown(startDate, endDate);
                if (!allTime) {
                    node.removeClass('disabled');
                    window.clearInterval(Timer);
                    Timer = null;
                    console.log('清楚定时器');
                } else {
                    _this.setNode(allTime, node, beforeText);
                    node.addClass('disabled');
                }
            }, 1000);
        },
        /**
         * 设置节点上的倒计时
         * @param {date}   allTime     时间对象
         * @param {Object} node        需要设置的节点
         * @param {string} defaultText 默认文本提示
         */
        setNode: function (allTime, node, defaultText) {
            var text = '';
            if (allTime.day != '') {
                text += allTime.day + '天';
            }
            if (allTime.hour != '') {
                text += allTime.hour + '时';
            }
            if (allTime.minite != '') {
                text += allTime.minite + '分';
            }
            if (allTime.second != '') {
                text += allTime.second + '秒';
            }
            if (
                allTime.second == '' &&
                allTime.minite == '' &&
                allTime.hour == '' &&
                allTime.day == ''
            ) {
                text = defaultText;
            }
            node.text(text);
        },
        /**
         * 当前时间转换时间戳或者传入一个特定的时间
         * @param {date} date  时间对象
         * @returns            返回时间戳
         */
        Conversion: function (date) {
            var date = date || new Date();
            return new Date(date).getTime() / 1000;
        },
        /**
         * 开始时间与结束时间的差值
         * @param   {date} startDate 开始时间
         * @param   {date} endDate   结束时间
         * @returns {Object}          包含{天,时，分，秒}
         */
        countdown: function (startDate, endDate) {
            var lag = endDate - startDate;
            var second = Math.floor(lag % 60);
            var minite = Math.floor((lag / 60) % 60);
            var hour = Math.floor((lag / 3600) % 24);
            var day = Math.floor(lag / 3600 / 24);
            if (lag < 0) {
                return false;
            }
            // console.log(day + '天' + hour + '时' + minite + '分' + second + '秒');
            return {
                day: day,
                hour: hour,
                minite: minite,
                second: second
            };
        }
    };
    exports('Countdown', new Countdown());
});
