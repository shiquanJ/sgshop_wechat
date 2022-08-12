const app = getApp()
const fetch = app.fetch
const server = app.globalData.server
var temp_order_id = '' //임시 오더 번호

Page({
  data: {
    tempOrderList:{},
    total_cnt: '',
    total_price: '',
    comment: '',
    server:server,
    is_self:false,
    addr_id: '',
    receipt_name: '',
    gender: '',
    receipt_phone: '',
    receipt_detail: '',
    order_sendtime: '',

    addrList:"",  //收货地址
    is_open:false, //收货地址popup
    express: false, //快递
  },

  
  onLoad: function (options) {
    temp_order_id = options.temp_order_id
    wx.showLoading({
      title: '加载中...',
    })
    //false是外卖
    this.setData({
        is_self:options.is_self,
        order_sendtime: options.order_sendtime
     })

    //获取临时订单list
    fetch('/api/get_temp_order_list', {
      temp_order_id : temp_order_id,
      user_id: wx.getStorageSync('user_id'),
      is_self: this.data.is_self
    }).then(data => {
      this.setData({
        tempOrderList:data.tempOrderList,
        total_cnt: data.total_cnt,
        total_price: data.total_price,
        addr_id: data.addr_id,
        receipt_name: data.receipt_name,
        gender: data.gender,
        receipt_phone: data.receipt_phone,
        receipt_detail: data.receipt_detail,
      })
      //价格少于150，得加配送费
      if(Number(this.data.total_price) <= 150){
        this.setData({
          express: true,
          total_price: Number(this.data.total_price) + 10,
        })
      }
      wx.hideLoading()
    }, () => {
      this.onLoad(options)
    })
  },
  onShow: function(){
    let flag = wx.getStorageSync('is_reFresh');
    if(flag == '0' ){
      wx.removeStorageSync('is_reFresh')
      this.getAddrList();
    }
  },
  getAddrList: function (e){
    fetch('/api/addrList', {
      user_id : wx.getStorageSync('user_id'),
    }, 'POST').then(res => {
      console.log(res.addrList)
      if(res.addrList){
        this.setData({
          addrList: res.addrList,
          is_open: true
        })
      }
    })
  },
  setDefaultAddr: function(e){
    var addr_id = e.currentTarget.dataset.id;
    fetch('/api/getAddrInfo', {
      user_id : wx.getStorageSync('user_id'),
      addr_id : addr_id,

    }, 'POST').then(data => {
      this.setData({
        addr_id: data.addr_id,
        receipt_name: data.receipt_name,
        gender: data.gender,
        receipt_phone: data.receipt_phone,
        receipt_detail: data.receipt_detail,
      })
      this.close_popup()
    })
  },
  //close_popup
  close_popup : function(){
    this.setData({
      is_open:false
    })
  },
  payment: function(e){
    var outTradeNo = temp_order_id;  //订单号

    //先付款，然后生成订单
    wx.showToast({
      title: '支付成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        //生成订单
        fetch('/api/save_order_info',{
          temp_order_id:outTradeNo,
          total_cnt: this.data.total_cnt,
          total_price: this.data.total_price,
          order_sendtime : this.data.order_sendtime,
          user_id: wx.getStorageSync('user_id'),
          user_comment: this.data.comment,
          is_self: this.data.is_self,
          addr_id: this.data.addr_id,
        },'POST').then(res =>{
          if(res.order_id != null && res.order_id != ''){
            wx.navigateTo({
              url: '/pages/order/detail/detail?order_id=' + res.order_id,
            })
          }
        })
      }
    })
    
    //outTradeNo = Math.floor((Math.random() * 1000) + 1) + "1371" + new Date().getTime(); 
    
    //需要企业或个体工商户认证的小程序ID
    /* wx.cloud.callFunction({
      name: "pay",
      data:{
        outTradeNo:outTradeNo,
        totalFee:this.data.total_price,
      },
      success: res => {
        const payment = res.result.payment
        console.log(payment)
        wx.requestPayment({
          ...payment,
          success (res) {
            console.log('pay success', res)
            wx.showLoading({
              title: '付款成功',
            })
          },
          fail (err) {
            console.error('pay fail', err)
          }
        })
      },
      fail: console.error,
    }) */
  },
  pay: function () {
    var id = this.data.id;
    wx.showLoading({
      title: '正在支付...',
    })
    fetch('food/order', {
      id,
      comment: this.data.comment
    }, 'POST').then(data => {
      return fetch('/api/pay', {
        id
      }, 'POST')
    }).then(data => {
      wx.hideLoading()
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          wx.navigateTo({
            url: '/pages/order/detail/detail?order_id=' + id,
          })
        }
      })
    }).catch(() => {
      // 支付失败
      this.pay()
    })
  },

  comment: function (e) {
    this.data.comment = e.detail.value;
  }
  ,setNewAddr: function(e){
    console.log('123')
    wx.navigateTo({
      url: '../../mine/newAddr/newAddr?is_self='+this.data.is_self,
    })
  },
})