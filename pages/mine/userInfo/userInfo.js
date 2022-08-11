// pages/mine/mine.js
const app = getApp()
const imgurl = app.globalData.server
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:"",
    phoneNo: "",
    nickName: "",
  },
  //表单提交
  submit(){
    let that = this;
    let {lock} = that.data;
    if(!lock){
        that.setData({lock:true});
        //数据请求操作
        //请求完成后 开锁
        that.setData({lock:false});
    }
  },
  onReady: function(e) {
    this.mapCtx = wx.createMapContext('myMap')
  },
  onShow:function(){
    //获取收藏地址
    var that=this;
    if(wx.getStorageSync("addrNo")){
      that.setData({
        addrNo: wx.getStorageSync("addrNo"),
      })
    }
    if(wx.getStorageSync("userName")){
      that.setData({
        userName: wx.getStorageSync("userName"),        
      })
    }
    if(wx.getStorageSync("phoneNo")){
      that.setData({
        phoneNo: wx.getStorageSync("phoneNo")        
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    if(wx.getStorageSync("userInfo")){
      var userInfo =wx.getStorageSync("userInfo")
      that.setData({
        nickName: userInfo.nickname,
        avatarUrl: userInfo.avatarurl,
      })
    }
    //获取收藏地址
    if(wx.getStorageSync("addrNo")){
      that.setData({
        addrNo: wx.getStorageSync("addrNo"),
      })
    }
    if(wx.getStorageSync("userName")){
      that.setData({
        userName: wx.getStorageSync("userName"),        
      })
    }
    if(wx.getStorageSync("phoneNo")){
      that.setData({
        phoneNo: wx.getStorageSync("phoneNo")        
      })
    }
  }, 
  //获取手机号，只有企业小程序才能用
  getPhoneNumber (e) {
    this.setData({display:"none"})

    //서버 호출
    var server = app.globalData.server;
    console.log(server)
    wx.request({
      url: server+'/getPhoneNumber',
      data: {
        code: e.detail.code
      },
      success:function(res){
        wx.setStorageSync('phoneNo', res.data.phoneNumber)
        wx.navigateTo({
          url: '../userInfo/userInfo',
         })
      }
    })

  },
  
  showModal : function(e){
    this.setData({display:"block"})
  },
   goNewAddr : function (e){
    wx.navigateTo({
      url: '../common/newAddr/newAddr',
     })
  },
  goCancel : function(){
    this.setData({display:"none"})
  }
})