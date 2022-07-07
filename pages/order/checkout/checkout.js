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
  },

  
  onLoad: function (options) {
    temp_order_id = options.temp_order_id
    console.log('temp_order_id::'+temp_order_id);
    wx.showLoading({
      title: '努力加载中...',
    })
    //获取配送时间
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    var order_hous = new Date((timestamp + 60 * 30)*1000).getHours()
    var order_minutes = new Date((timestamp + 60 * 30)*1000).getMinutes()
    this.setData({
      is_self:options.is_self,
      order_sendtime: order_hous +":" +order_minutes
    })

    //获取临时订单list
    fetch('/api/get_temp_order_list', {
      temp_order_id : temp_order_id,
      user_id: wx.getStorageSync('user_id')
    }).then(data => {
      console.log('tempOrderList::'+JSON.stringify(data.tempOrderList));
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
      wx.hideLoading()
    }, () => {
      this.onLoad(options)
    })
  },

  payment: function(e){
    var outTradeNo = temp_order_id;  //订单号
    console.log(this.data.comment)
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
          user_id: wx.getStorageSync('user_id'),
          user_comment: this.data.comment,
          is_self: this.data.is_self,
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
})