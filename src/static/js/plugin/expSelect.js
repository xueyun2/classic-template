layui.define(
    ['jquery', 'myUtils', 'popup', 'laytpl', 'laypage', 'form', 'layer'],
    function (exports) {
        const $ = layui.jquery;
        const Popup = layui.popup;
        const laytpl = layui.laytpl;
        const laypage = layui.laypage;
        const layer = layui.layer;
        const { generateRandomId } = layui.myUtils;
        /**
         * 下拉单选控件
         * @param {object}    elem        - 要渲染的元素，id或者class
         * @param {Boolean}   isSearch    - 是否开启搜索功能
         * @param {Boolean}   isPage      - 是否开启分页功能
         * @param {string}    name        - 表单name名称
         * @param {string}    tips        - 输入框内提示文本
         * @param {string}    verify      - 验证规则，填写layui格式规则
         * @param {string}    verType     - 验证提示类型，填写layui格式规则
         * @param {string}    reqText     - 验证不通过提示
         * @param {Array}     data        - 设置静态数据
         * @param {object}    dataField   - 重新设置列表渲染字段默认{value,id}
         * @param {object}    default     - 设置默认选中状态
         * @param {function}  method      - 方法返回page:当前页码，keyword：搜索关键词，cd：回调函数接收2个参数1：数据列表，参数2：数据总条数
         * @param {function}  onload      - 当前打开选项时执行，方法返回当前点击元素
         * @param {function}  onSelect    - 选中后触发事件，返回当前选中的数据
         * @param {Boolean}   choice      - 开启多选默认：false
         * @param {number}    length      - 多选最大值默认为:3
         * @param {Boolean}   disable     - 是否禁止选择
         * @param {string}    disableTips - 禁用时的提示
         */
        function ExpSelect(setConfig) {
            this.inputRandomId = generateRandomId(10); //input随机ID
            this.popupRandomId = generateRandomId(10); //popup弹窗ID
            this.contentListId = generateRandomId(10); //内容列表ID
            this.popup = null; //弹窗实例
            this.defaultConfig = {
                elem: '',
                isSearch: false,
                isPage: false,
                name: 'expselect',
                tips: '请输入',
                verify: '',
                verType: 'tips',
                reqText: '',
                choice: false,
                length: 3,
                data: { list: [] },
                disable: false,
                disableTips: '',
                dataField: {
                    value: 'value',
                    id: 'id'
                },
                default: [],
                method: false, //function (page, keyword, cd) { }
                onload: false, //function (elem) { }
                onSelect: false //function (data) { }
            };
            this.config = $.extend(this.defaultConfig, setConfig); //合并配置文件
            this.init(); //初始化函数
        }
        ExpSelect.prototype = {
            constructor: ExpSelect,
            choice: [], //多选项
            //初始函数
            init: function () {
                this.render(); //渲染基础节点
                this.open(); //绑定popup弹窗
                this.defaultData(); //初始列表数据
                this.clickSelect(); //给列表绑定点击事件
                this.verify(); //监听表单提交，验证选项
            },
            //初始第一页数据
            defaultData: function () {
                //初始化数据,如果有method方法则从该方法拿取数据。
                if (this.config.method) {
                    this.config.method(1, '', (list, total, limit) => {
                        this.content(list);
                        if (this.config.isPage) {
                            this.page(total, limit); //开启分页
                        }
                    });
                } else {
                    this.content(this.config.data);
                    if (this.config.isPage) {
                        this.page(this.config.data.length, 10); //开启分页
                    }
                }
                //判断是否开启搜索
                if (this.config.isSearch) {
                    this.keyup(); //搜索
                }
            },
            //渲染基础模板
            render: function () {
                let tpl = `
            <div class="rela  border flex align-v-center h-44 border-radius-4 exp-select" id=${this.inputRandomId}>
                <div class="rela select-active p-lr-10 flex align-v-center">
                    <span class="font-14 font-grey-slight">${this.config.tips}</span>
                </div>
                <input class="select-input abso"  name="${this.config.name}" readonly type="text" placeholder="${this.config.tips}" lay-verify="${this.config.verify}" lay-verType="${this.config.verType}" lay-reqText="${this.config.reqText}">
                <i class="iconfont icon-xiajiantou abso font-grey-light darrow"></i>
            </div>`;
                let popupTpl = `
            <div class="xm-select card " id="${this.popupRandomId}">
                <!-- 搜索 -->
                {{# if(d.isSearch) { }}
                <div class="flex align-v-center search border-bottom">
                    <i class="iconfont icon-sousuo font-grey-light"></i>
                    <input type="text" placeholder="请输入搜索关键词" class="flex-1 font-14 select-search">
                </div>
                {{# } }}
                <!-- 内容列表 -->
                <div class="content exp-select-content">
                    <ul id="${this.contentListId}" class="select-list"></ul>
                </div>
                
            </div>`;
                laytpl(popupTpl).render(this.config, function (html) {
                    $('body').append(html);
                });
                $(this.config.elem).html(tpl);
            },
            //打开弹窗
            open: function () {
                this.popup = new Popup({
                    title: this.config.tips,
                    close: true,
                    open: `#${this.inputRandomId}`,
                    content: $(`#${this.popupRandomId}`),
                    beforeOpen: () => {
                        if (this.config.disable) {
                            if (this.config.disableTips) {
                                layer.msg(this.config.disableTips, {
                                    icon: 5,
                                    anim: 6
                                });
                            }
                            return false;
                        }
                        return true;
                    },
                    success: (elem) => {
                        if (this.config.onload) {
                            this.config.onload(elem);
                        }
                        $(`#${this.inputRandomId}`).removeClass('border-error');
                        this.setListActive();
                    }
                });
            },
            /**
             * 渲染列表
             * @param {object} data - 渲染的数据
             */
            content: function (data) {
                let listTpl = `
            {{#  layui.each(d.list, function(index, item){ }}
                <li data-name="{{item["${this.config.dataField.value}"]}}" data-id="{{item["${this.config.dataField.id}"]}}" class="border-bottom select-item flex align-h-between align-v-center p-b-20 p-t-20 font-14">
                    <div>{{item["${this.config.dataField.value}"]}}</div>
                    <i class="layui-icon layui-icon-ok"></i>   
                </li>
            {{#  }); }}
            {{# if(d.list.length==0) { }}
            <div class="null">
                <div>
                    <img src="/static/home/images/shuju.png" alt="暂无数据">
                    <div class="null-title">
                        暂无数据
                    </div>
                </div>
            </div>
            {{# } }}
            `;
                laytpl(listTpl).render(data, (html) => {
                    $(`#${this.contentListId}`).html(html);
                    this.setListActive(); //设置激活状态
                });
            },
            //搜索功能
            search: function () {
                let searchElem = $(`#${this.popupRandomId} .select-search`);
                let text = searchElem.val();
                this.config.method(1, text.trim(), (list, total, limit) => {
                    this.content(list);
                    if (this.config.isPage) {
                        this.page(total, limit); //开启分页
                    }
                });
            },
            //绑定按键事件
            keyup: function () {
                let debouncedSearch = this.debounce(this.search, 500);
                let chineseStart = false;
                $(`#${this.popupRandomId} .select-search`)
                    .on('compositionstart', (event) => {
                        //标记中文输入
                        chineseStart = true;
                    })
                    .on('compositionend', () => {
                        //中文输入结束后执行搜索关闭中文输入标识
                        debouncedSearch();
                        chineseStart = false;
                    })
                    .on('input', (event) => {
                        //监听输入框值，如果为空默认请求一次数据
                        let newValue = event.target.value;

                        if (!newValue) {
                            debouncedSearch();
                            return false;
                        }
                        //如果没有标记中文输入，有值输入在输入框中则进行搜索
                        if (!chineseStart) {
                            debouncedSearch();
                        }
                    });
            },
            //设置列表和选中的输入框值对应激活
            setListActive: function () {
                let list = $(`#${this.contentListId}`);
                let selectId = $(`#${this.inputRandomId}`).find('input').val();
                let selectIdList = selectId.split(',');
                if (this.config.choice) {
                    list.find('li').removeClass('active');
                    $.each(selectIdList, (cindex, citem) => {
                        list.find('li').each((index, item) => {
                            let id = $(item).data('id');
                            if (citem == id) {
                                $(item).addClass('active');
                            }
                        });
                    });
                    return false;
                }
                list.find('li').each((index, item) => {
                    let id = $(item).data('id');

                    $.each(this.config.default, (cindex, citem) => {
                        if (id == citem[this.config.dataField.id]) {
                            $(item)
                                .addClass('active')
                                .siblings()
                                .removeClass('active');
                        }
                    });

                    if (this.config.default.length == 0) {
                        list.find('li').removeClass('active');
                        return false;
                    }
                });
            },
            //验证选项
            verify: function () {
                let parForm = $(`#${this.inputRandomId}`);
                let input = parForm.find('.select-input');
                //监听class的变化, 然后进行边框变色处理, 或者更多的处理
                let MutationObserver =
                    window.MutationObserver ||
                    window.WebKitMutationObserver ||
                    window.MozMutationObserver;
                MutationObserver &&
                    new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.type == 'attributes') {
                                let attr = mutation.attributeName;
                                if (attr === 'class') {
                                    if (
                                        input[0].className.indexOf(
                                            'layui-form-danger'
                                        ) !== -1
                                    ) {
                                        parForm.addClass('border-error');
                                    }
                                }
                            }
                        });
                    }).observe(input[0], { attributes: true });

                // parForm.parents('.layui-form').on('click', 'button[lay-submit]', (e) => {
                //     let verify = form.validate(parForm.find(`input[name="${this.config.name}"]`))
                //     if (!verify) {
                //         parForm.addClass('border-error')
                //         return false
                //     } else {
                //         parForm.removeClass('border-error')
                //     }
                // })
            },
            /**
             * 设置选中状态元素
             */
            setSelectStatus: function () {
                let tpl = `
            {{#  layui.each(d, function(index, item){ }}
                <div class="flex m-r-10 align-v-center border-radius-4 font-12 p-tb-6 p-lr-10  bg-pink font-white" id="select-elem-{{item.${this.config.dataField.id}}}">
                    <span>{{item.${this.config.dataField.value}}}</span> 
                    <i class="iconfont icon-guanbi font-12 font-white cancel-select m-l-6" data-id="{{item.${this.config.dataField.id}}}"></i>
                </div>
            {{#  }); }}
                `;
                //顶层输入框元素
                let inputElem = $(`#${this.inputRandomId}`);
                //设置默认选中
                if (this.config.default.length > 0) {
                    laytpl(tpl).render(this.config.default, (html) => {
                        inputElem.find('.select-active').html(html);
                    });
                    if (this.config.choice) {
                        let val = [];
                        $.each(this.config.default, (index, item) => {
                            val.push(item[this.config.dataField.id]);
                        });
                        this.choice = val;
                        inputElem.find('input').val(val);
                    } else {
                        inputElem
                            .find('input')
                            .val(
                                this.config.default[0][this.config.dataField.id]
                            );
                    }
                }
            },
            //选择
            clickSelect: function () {
                //设置默认选中值
                this.setSelectStatus();
                //顶层输入框元素
                let inputElem = $(`#${this.inputRandomId}`);
                //单选事件
                if (!this.config.choice) {
                    $(`#${this.contentListId}`).on(
                        'click',
                        '.select-item',
                        (e) => {
                            //获取节点数据
                            let { name, id } = $(e.target).data();
                            //改变列表选中状态
                            $(e.target)
                                .addClass('active')
                                .siblings()
                                .removeClass('active');
                            //赋值给隐藏的input值
                            inputElem.find('input').val(id);
                            //改变参数默认选中数据
                            this.config.default = [
                                {
                                    [this.config.dataField.value]: name,
                                    [this.config.dataField.id]: id
                                }
                            ];
                            //渲染到输入框中节点
                            this.setSelectStatus();
                            //关闭弹窗
                            this.popup.hideBox();
                            //选中后执行
                            if (this.config.onSelect) {
                                this.config.onSelect(this.config.default);
                            }
                        }
                    );
                    //绑定取消选中事件
                    inputElem.on('click', '.cancel-select', (e) => {
                        e.stopPropagation();
                        $(e.currentTarget).parent().remove();
                        inputElem
                            .find('.select-active')
                            .html(
                                `<span class="font-14 font-grey-slight">${this.config.tips}</span>`
                            );
                        inputElem.find('input').val('');
                        this.config.default = [];
                        this.setListActive(); //设置激活状态
                    });
                    return false;
                }
                //绑定多选事件
                $(`#${this.contentListId}`).on('click', '.select-item', (e) => {
                    //获取节点数据
                    let { name, id } = $(e.currentTarget).data();
                    //等于多选最大值是不可选择
                    if (
                        this.choice.length == this.config.length &&
                        !$(e.currentTarget).hasClass('active')
                    ) {
                        layer.msg(`最多只能选择${this.config.length}`, {
                            icon: 5,
                            anim: 6
                        });
                        return false;
                    }
                    //选中重复的默认取消选择
                    if (this.choice.indexOf(id) != -1) {
                        this.choice = this.cancelChoice(id, this.choice); //取消多选
                        //关闭弹窗
                        this.popup.hideBox();
                        return false;
                    }
                    //赋值给隐藏的input值
                    this.choice.push(id);
                    inputElem.find('input').val(this.choice);
                    // console.log(inputElem.find('input').val(), '选中的值')
                    //改变列表选中状态
                    $(e.currentTarget).addClass('active');
                    //改变参数默认选中数据
                    this.config.default.push({
                        [this.config.dataField.value]: name,
                        [this.config.dataField.id]: id
                    });
                    //渲染到输入框中节点
                    this.setSelectStatus();
                    //关闭弹窗
                    this.popup.hideBox();
                    //选中后执行
                    if (this.config.onSelect) {
                        this.config.onSelect(this.config.default);
                    }
                });
                //绑定取消选中事件
                inputElem.on('click', '.cancel-select', (e) => {
                    e.stopPropagation();
                    //删除指定ID值
                    let id = $(e.currentTarget).data('id');
                    this.choice = this.cancelChoice(id, this.choice); //取消多选
                });
            },
            /**
             * 取消多选函数
             * @param {number} id - 要取消的ID
             * @param {Arrey}  choiceArr -当前所有选中的ID数组
             */
            cancelChoice: function (id, choiceArr) {
                //顶层输入框元素
                let inputElem = $(`#${this.inputRandomId}`);
                let index = choiceArr.indexOf(id);
                choiceArr.splice(index, 1);
                $.each(this.config.default, (cindex, item) => {
                    if (item[this.config.dataField.id] == id) {
                        this.config.default.splice(cindex, 1);
                        return false;
                    }
                });
                //删除对应ID标签元素
                inputElem.find(`#select-elem-${id}`).remove();
                //当删除玩所有标签时显示提示语
                if (inputElem.find('.select-active').children().length == 0) {
                    inputElem
                        .find('.select-active')
                        .html(
                            `<span class="font-14 font-grey-slight">${this.config.tips}</span>`
                        );
                }
                inputElem.find('input').val(choiceArr);
                this.setListActive(); //设置激活状态
                return choiceArr;
            },
            /**
             * 加载分页
             * @param {nubmer} total - 分页总数
             * @param {nubmer} limit - 每页条数
             */
            page: function (total = 1, limit = 10) {
                let pageTpl = `<div class="flex align-v-center align-h-center m-t-14 select-page">
                            <div class="page-item"></div>
                           </div>`;
                let popupRandomId = $(`#${this.popupRandomId}`);
                if (this.config.isPage) {
                    if (Math.ceil(total / limit) >= 2) {
                        if (popupRandomId.find('.select-page').length != 0) {
                            popupRandomId
                                .find('.select-page')
                                .html('<div class="page-item"></div>');
                        } else {
                            popupRandomId.append(pageTpl);
                        }
                    }
                }
                laypage.render({
                    elem: $(`#${this.popupRandomId} .page-item`),
                    count: total,
                    limit: limit,
                    layut: ['page'],
                    groups: 1,
                    jump: (obj, first) => {
                        //首次不执行
                        if (!first) {
                            this.config.method(
                                obj.curr,
                                '',
                                (list, total, limit) => {
                                    this.content(list);
                                }
                            );
                            console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                            //do something
                        }
                    }
                });
            },
            // 防抖函数
            debounce: function (func, wait) {
                let timeout;
                let context = this;
                let args = arguments;
                return () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        func.apply(context, args);
                    }, wait);
                };
            },
            /**
             * 设置默认值
             * @param {object} data - 要设置的数据对象,字段要和参数配置的数据字段一致。
             */
            setDefault: function (data) {
                if (this.config.choice) {
                    if (!Array.isArray(data)) {
                        console.error('开启多选参数为数组类型');
                        return false;
                    }
                    this.config.default = data;
                } else {
                    this.config.default = [data];
                }
                this.setSelectStatus();
            },
            //清空值
            emptyDefault: function () {
                this.config.default = [];
                $(`#${this.inputRandomId}`)
                    .find('.select-active')
                    .html(
                        `<span class="font-14 font-grey-slight">${this.config.tips}</span>`
                    );
                this.clickSelect();
            }
        };
        exports('expSelect', ExpSelect);
    }
);
