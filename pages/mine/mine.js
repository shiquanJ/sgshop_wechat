// pages/mine/mine.js
const app = getApp()
const imgurl = app.globalData.server
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName:"",
    avatarUrl:"",
    addrNo:"",
    phoneNo:"",
    is_open: false,
    img_url: imgurl,
    windowHeight:''
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
    if(wx.getStorageSync("addrName")){
      that.setData({
        addrNo: wx.getStorageSync("addrName"),
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

    that.setData({
      windowHeight: wx.getSystemInfoSync().windowHeight + "px"
    })
    console.log(wx.getStorageSync("userInfo"));
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
  //我的信息
  myInfo : function(e){
    console.log(wx.getStorageSync("phoneNo"))
    wx.navigateTo({
      url: './userInfo/userInfo',
     })
  },
   goNewAddr : function (e){
    wx.navigateTo({
      url: './addr/addr',
     })
  }
  ,goOrderList : function(){
    wx.switchTab({
      url: '../order/list/list',
    })
  }
  ,unabled : function (){
    this.setData({is_open:true})
  }
  //close_popup
  ,close_popup : function(){
    this.setData({
      is_open:false
    })
  },
})