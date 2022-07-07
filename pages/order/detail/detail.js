// pages/order/detail/detail.js
const app = getApp()
const fetch = app.fetch

Page({
  data: {
    server: app.globalData.server,
  },

  onLoad: function (options) {
    var order_id = options.order_id;
    wx.showLoading({
      title: '努力加载中...',
    })
    fetch('/api/getOrderDetailList', {
      order_id:order_id,
      user_id: wx.getStorageSync('user_id')
    }).then(data => {
      console.log(data)
      this.setData(data)
      wx.hideLoading()
    }, () => {
      // 失败
      this.onLoad(options)
    })
  },

  onUnload: function () {
    wx.switchTab({
      url: '/pages/order/list/list',
    })
  },

})