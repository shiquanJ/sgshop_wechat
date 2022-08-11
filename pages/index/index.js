// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min');
// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'J2SBZ-P7IK3-KEC3A-YZZFA-YDXHE-QQB5K' // 必填
});
//index.js
const app = getApp();
const fetch = app.fetch
Page({
  data: {
    swiper: ['/images/index/lb1.jpg','/images/index/lb2.jpg','/images/index/lb3.jpg'],
    addrName: '',
    userInfo : '',
    hasUserInfo: false,
    animationData:{},
    windowHeight: '',
    show_flag : false,
    arrow_img: '/images/icon/arrowDown.png',
  },
  onLoad: function() {
    //设置屏幕高度
    this.setData({
      windowHeight :(wx.getSystemInfoSync().windowHeight ) + "px"
    })

    //this.getWxLocation()
    var userInfo = wx.getStorageSync("userInfo")
    console.log('userInfo:::'+userInfo)
    if(userInfo ==''){
      this.wxlogin()
    }else{
      this.setData({
        userInfo : userInfo,
        hasUserInfo: true
      })
    }
  },
  onShow: function(){
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear',
    })
    this.animation = animation
    var next = true;
    setInterval(function(){
      if(next){
        this.animation.scale(0.95).step()
        next = !next;
      }else{
        this.animation.scale(1).step()
        next = !next;
      }
      this.setData({
        animationData:animation.export()
      })
    }.bind(this), 1000);
  },
  //查看商家信息
  show_open:function(){
    if(this.data.show_flag){
      this.setData({
        show_flag: false,
        arrow_img: '/images/icon/arrowDown.png'
      })
    }else{
      this.setData({
        show_flag: true,
        arrow_img: '/images/icon/arrowUp.png'
      })
    }
  },
  wxlogin:function(){
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if(res.code){
          fetch('/api/wxlogin',{
            code: res.code, 
          }).then(res=>{
            console.log('wx::login::'+res.userInfo)
            if(res.userInfo != undefined){
              this.setData({
                userInfo : res.userInfo,
                hasUserInfo : true
              })
              console.log(res.userInfo.nickname)
              wx.setStorageSync('user_id', res.userInfo.user_id)
              wx.setStorageSync('userInfo', res.userInfo)
            }else{
              console.log(res.userid)
              wx.setStorageSync('user_id', res.userid)
            }
          })
        }else{
          console.log("网络错误")
        }
        
      },
      fail : res =>{
        console.log("网络出错");
      }
    })
  },
  getUserProfile(e){
    var userInfo = this.data.userInfo;
    console.log(userInfo)
    if(!userInfo){
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => {
          console.log(res.userInfo)
          //把userInfo保存到db里
          fetch('/api/saveUserInfo', {
            user_id : wx.getStorageSync('user_id'),
            userInfo : JSON.stringify(res.userInfo) 
            ,
          }, 'POST').then(res => {
            this.setData ({
              userInfo : res.userInfo,
              hasUserInfo : true
            })
            wx.setStorageSync('userInfo', res.userInfo) ;
            var id = e.currentTarget.dataset.id;
            this.goMenu(id); 
          })

        },
        fail: (res) => {},
        complete: (res) => {
          
        },
      })
    }else{
      var id = e.currentTarget.dataset.id;
      this.goMenu(id);
    }
  },

  goMenu : function(id){
    //有权限了
    if(id == 0){  //门店自取
      wx.navigateTo({
        url: '/pages/list/list?is_self=true'
      })
    }else if(id == 1){        //外卖
      var addList = wx.getStorageSync('addrList')
      console.log(addList)
      if(addList){
        wx.navigateTo({
          url: '/pages/list/list?is_self=false'
        })
      }else{
        //访问数据库获取收获地址
        fetch('/api/addrList', {
          user_id : wx.getStorageSync('user_id')
          ,
        }, 'POST').then(res => {
          if(res.hasAddrInfo){
            app.setSession('addrList',res.addrList);
            wx.navigateTo({
              url: '/pages/list/list?is_self=false'
            })
          }else{
            wx.navigateTo({
              url: '/pages/mine/addr/addr?is_self=false',
            })
          }
        })
      }
    }else{
      console.log('点击头像了')
    }
  },
  getAddrName : function(){
    var that = this
    wx.getSetting({
      success(res) {
        that.authorization();
      }
    })
  },
  async authorization(res){
    let that = this
    try{
      await this.getWxLocation()
    }catch(error){

      wx.showModal({
        cancelColor: '#000',
        cancelText: '取消',
        confirmColor: '#ff2244',
        confirmText: '确认',
        content: '获取权限失败，需要获取您的地理位置才能为您提供更好的服务',
        placeholderText: 'placeholderText',
        showCancel: true,
        title: '提示',
        success: (result) => {
          if(result.confirm){
            that.toSetting(res)
          }else{
          }
        },
      })
    }
  },
  getWxLocation(){
    wx.showLoading({
      title: '定位中',
      mask: true
    })
    return new Promise((resolve,reject) =>{
      let _locationChangeFn = (res) =>{
        qqmapsdk.reverseGeocoder({
          location:{
            latitude: res.latitude,
            longitude: res.longitude
          },
          success : (res) =>{
            console.log("addrName:2:"+res.result.address_reference.landmark_l2.title);
            wx.setStorageSync("addrName",res.result.address_reference.landmark_l2.title)
            this.setData({
              addrName : wx.getStorageSync("addrName")
            })
            wx.offLocationChange(_locationChangeFn)
            //wx.setStorageSync("addrName","浦项IT中心")
          },
          fail :(res) =>{
            this.getWxLocation()
          }
        })
        wx.hideLoading()
        wx.offLocationChange(_locationChangeFn)
        wx.stopLocationUpdate(_locationChangeFn)
      }
      wx.startLocationUpdate({
        success: (res) => {
          wx.onLocationChange(_locationChangeFn)
          
        },
        fail: (err) =>{
          wx.hideLoading()
          reject()
        }
      })
    })
  },
  toSetting(res){
    let that = this
    wx.openSetting({
      success: (res) =>{
        if(res.authSetting['scope.userLocation']){
          that.authorization()
        }
      }
    })
  },
})
