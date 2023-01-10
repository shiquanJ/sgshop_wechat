//app.js
// 引入SDK核心类
var QQMapWX = require('/utils/qqmap-wx-jssdk.min');
// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'J2SBZ-P7IK3-KEC3A-YZZFA-YDXHE-QQB5K' // 必填
});

App({
  fetch: require('utils/fetch.js'),
  onLaunch: function () {
    // 展示本地存储能力
    if(!wx.cloud){
      
    }else{
      wx.cloud.init({
        env:"cloud1-9gayvwib6f591c0b",
        traceUser:true
      })
    }
  },
  
  globalData: {
    userInfo: wx.getStorageSync("userInfo"),
  },
  setSession : function(sessionNm, sessionValue){
    wx.setStorageSync(sessionNm, sessionValue)
  }

    
    
  
})