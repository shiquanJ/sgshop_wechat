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
      this.setData(data)
      wx.hideLoading()
    }, () => {
      // 失败
      this.onLoad(options)
    })
    wx.showShareMenu({
      success(res){
      }
    })
  },

  onUnload: function () {
    wx.navigateBack({
      delta: 2
    })
  },
  copy_text: function(){
    wx.setClipboardData({
      data: this.data.receipt_detail+" "+this.data.receipt_name+" "+this.data.receipt_phone,
      success:function(res){
        wx.showToast({
          title: '复制成功',
          icon: 'none',
          mask: 'true'
        })
      }
    })
  },
  onShareAppMessage: function () {
  },

})