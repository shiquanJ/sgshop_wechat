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
    userName:"",
    phoneNo:"",
    display: "none",
    img_url: imgurl
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
    if(wx.getStorageSync("userInfo")){
      var userInfo =wx.getStorageSync("userInfo")
      that.setData({
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
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
        wx.setStorageSync('phoneNo', '18640844669')
        wx.navigateTo({
          url: './userInfo/userInfo',
         })
      }
    })

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
      url: './addrList/addr',
     })
  },
  goCancel : function(){
    this.setData({display:"none"})
  }
})