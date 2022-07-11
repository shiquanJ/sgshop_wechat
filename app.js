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
    this.getAddrName();
    this.wxlogin();
  },
  
  globalData: {
    userInfo: wx.getStorageSync("userInfo"),
    //server: 'http://116.62.231.62/wechat',
    server: 'http://8.142.251.252:8086'
  },
    // 登录
    wxlogin:function(){
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          console.log("code:"+res.code)
          if(res.code){
            wx.request({
              url: this.globalData.server+'/api/wxlogin',
              data: {
               code: res.code, 
              },
              success:function(res){
                console.log("statecd:"+res.data.statecd)
                //wx.setStorageSync('session_key', res.data.session_key)
                if(res.data.statecd == '2'){
                  wx.showToast({
                    title: '登录失败！', // 标题
                    icon: 'error',  // 图标类型，默认success
                    duration: 1500  // 提示窗停留时间，默认1500ms
                  })
                }else if(res.data.statecd == '1'){  //登录成功，并且数据库有用户信息
                  console.log(res)
                  wx.setStorageSync('userInfo', res.data.userInfo)
                  wx.setStorageSync('user_id', res.data.user_id)
                }else if(res.data.statecd == '0'){  //登录成功，但是数据库没有用户信息
                  wx.setStorageSync('user_id', res.data.user_id)
                }else{
                  wx.showToast({
                    title: '服务器报错！', // 标题
                    icon: 'error',  // 图标类型，默认success
                    duration: 3000  // 提示窗停留时间，默认1500ms
                  })
                }
              },
              fail:function(res){
                console.log("errMsg:"+res.errMsg)
              }
            })
            /* wx.getUserProfile({
              desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
              success: (res) => {
                wx.setStorageSync('userInfo', res.userInfo)
              }
            }) */
            // wx.request({
            //   url: 'http://localhost/wxlogin',
            //   data: {
            //    code: res.code, 
            //   },
            //   success:function(res){
            //     console.log("statecd:"+res.data.statecd)
            //     //wx.setStorageSync('session_key', res.data.session_key)
            //     if(res.data.statecd == '2'){
            //       wx.showToast({
            //         title: '登录失败！', // 标题
            //         icon: 'error',  // 图标类型，默认success
            //         duration: 1500  // 提示窗停留时间，默认1500ms
            //       })
            //     }else if(res.data.statecd == '1'){
            //       console.log(res)
            //       wx.setStorageSync('userInfo', res.data.userInfo)
            //       wx.setStorageSync('openid', res.data.openid)
            //     }else if(res.data.statecd == '0'){
            //       wx.setStorageSync('openid', res.data.openid)
            //     }else{
            //       wx.showToast({
            //         title: '服务器报错！', // 标题
            //         icon: 'error',  // 图标类型，默认success
            //         duration: 3000  // 提示窗停留时间，默认1500ms
            //       })
            //     }
            //   },
            //   fail:function(res){
            //     console.log("errMsg:"+res.errMsg)
            //   }
            // })
          }else{
            console.log("网络错误")
          }
          
        },
        fail : res =>{
          console.log("网络出错");
        }
      })
    },
    getAddrName : function(){
      wx.getSetting({
        success(res) {
          console.log('res是否开启授权', res)
          if (!res.authSetting['scope.userLocation']) { 
            wx.authorize({
              scope: 'scope.userLocation',  
              success() {
                wx.getLocation({
                  type: 'gcj02',
                  success: (res) => {
                    qqmapsdk.reverseGeocoder({
                      location:{
                        latitude: res.latitude,
                        longitude: res.longitude
                      },
                      success : (res) =>{
                        console.log("weizhi:1:"+JSON.stringify(res.result.address_component.street));
                        wx.setStorageSync("addrName",res.result.address_component.street)
                      },
                      fail :(res) =>{
                        console.log("fail::"+JSON.stringify(res));
                        return null;
                      }
                    })
                  }
                })
              }
            })
          }else{
            //已授权
            wx.getLocation({
              type: 'gcj02',
              success: (res) => {
                console.log("getLocation：："+JSON.stringify(res))
                qqmapsdk.reverseGeocoder({
                  location:{
                    latitude: res.latitude,
                    longitude: res.longitude
                  },
                  success : (res) =>{
                    console.log("weizhi:2:"+JSON.stringify(res.result));
                    wx.setStorageSync("addrName",res.result.address_reference.landmark_l2.title)
                    //wx.setStorageSync("addrName","浦项IT中心")
                  },
                  fail :(res) =>{
                    console.log("fail::"+JSON.stringify(res));
                    return null;
                  }
                })
              }
            })

          }
        }
    })
  },

  setSession : function(sessionNm, sessionValue){
    wx.setStorageSync(sessionNm, sessionValue)
  }

    
    
  
})