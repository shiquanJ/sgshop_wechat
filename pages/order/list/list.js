const app = getApp()
const fetch = app.fetch

Page({
  data: {
    order: {},
    order_detail: {},
    is_last: true,
    server: app.globalData.server,
    index: 0,
    windowHeigh: '',
  },
  row: 10,

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    var windowH = (wx.getSystemInfoSync().windowHeight ) + "px"
    console.log(windowH)
    this.setData({
      windowHeigh: windowH
    })
    console.log(wx.getStorageSync('user_id'))
    this.loadData({
      last_id: 0,
      row: 10,
      index: this.data.index,
      success: data => {
        this.setData({
          order: data.order_list,
          order_detail:data.detail_list,
        }, () => {
          wx.hideLoading()
        })
      },
      fail: () => {
        this.onLoad()
      }
    })
  },

  onShow: function () {
    if (this.enableRefresh) {
      this.onLoad()
      // 刷新订单后页面滚动至顶部
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      this.enableRefresh = true
    }
  },
  // 是否启用自动刷新
  enableRefresh: false,

  // 上拉刷新
  onPullDownRefresh: function() {
    wx.showLoading({
      title: '加载中...'
    })
    this.loadData({
      last_id: 0,
      row: 10,
      index: this.data.index,
      success: data => {
        this.setData({
          order: data.order_list,
          order_detail:data.detail_list
        }, () => {
          wx.hideLoading()
          wx.stopPullDownRefresh()
        })
      }
    })
  },

  // 下拉触底
  onReachBottom: function() {
    // 下拉到底不再加载数据
    if(this.data.is_last){
      return
    }
    this.loadData({
      last_id: this.last_id,
      row: 10,
      index: this.data.index,
      success: data => {
        var order = this.data.order
        var order_detail = this.data.order_detail
        data.order_list.forEach(item => {
          order.push(item)
        })
        data.detail_list.forEach(item => {
          order_detail.push(item)
        })
        this.setData({
          order,
          order_detail,
        })
      },
      fail: () => {
        this.onReachBottom()
      }
    })
  },

  loadData: function (options) {
    wx.showNavigationBarLoading()
    console.log( wx.getStorageSync('user_id'))
    fetch('/api/orderlist', {
      user_id: wx.getStorageSync('user_id'),
      last_id: options.last_id,
      row: 10,
      index: this.data.index,
    }).then(data => {
      this.last_id = data.last_id
      // 判断是否到底
      console.log(data.detail_list)
      this.setData({ 
        is_last: data.order_list.length < this.row 
      })
      wx.hideNavigationBarLoading()
      options.success(data)
    }, () => {
     this.onLoad()
    })
  },

  detail: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/order/detail/detail?order_id=' + id,
    })
  },

  start: function () {
    wx.navigateTo({
      url: '/pages/list/list'
    })
  },
  selected: function(e){
    var id = e.currentTarget.dataset.id
    this.setData({
      index: id
    })
    this.loadData({
      last_id: 0,
      row: 10,
      index: this.data.index,
      success: data => {
        var order = this.data.order
        var order_detail = this.data.order_detail
        this.setData({
          order : data.order_list,
          order_detail: data.detail_list
        })
      },
      fail: () => {
        this.onReachBottom()
      }
    })
  }
})