layui.define(['jquery', 'request'], function (exports) {
  const $ = layui.jquery;
  const request = layui.request;
  const api = {
    //关注话题
    rfollow: function (param) {
      return request.post('note/rfollo', param);
    }
  };
  exports('api', api);
});
