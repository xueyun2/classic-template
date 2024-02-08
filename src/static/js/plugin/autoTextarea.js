layui.define(['jquery', 'layer'], function (exports) {
    const $ = layui.jquery;
    // 统计字数
    function count(TextareaNode, setNode) {
        $(setNode).text(TextareaNode.val().length);
        return TextareaNode.val().length;
    }
    function autoTextarea(opts) {
        let TextareaNode = $(opts.element);
        let miniHeight = TextareaNode.height();
        TextareaNode.css('overflowY', 'hidden');
        TextareaNode.on('focus input', function (e) {
            let height;
            let style = this.style;
            this.style.height = miniHeight + 'px';
            if (this.scrollHeight > miniHeight) {
                if (opts.maxHeight && this.scrollHeight > opts.maxHeight) {
                    height = opts.maxHeight;
                    style.overflowY = 'scroll';
                } else {
                    height = this.scrollHeight;
                    style.overflowY = 'hidden';
                }
                style.height = height + 'px';
            }
            count($(this), opts.count);
        });
    }
    exports('autoTextarea', autoTextarea);
});
