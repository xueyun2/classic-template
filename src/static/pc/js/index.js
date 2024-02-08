layui.use(['request'], function () {
    const request = layui.request;
    request.post('login', { id: 123 }).then((res) => {
        console.log(res);
    });
});
