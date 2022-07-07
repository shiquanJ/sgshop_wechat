//index.js
const app = getApp();
const fetch = app.fetch
Page({
  data: {
    swiper: ['/images/index/lb1.jpg','/images/index/lb2.jpg','/images/index/lb3.jpg'],
    addrName: wx.getStorageSync("addrName"),
    userInfo : '',
    hasUserInfo: false,
    animationData:{}
  },
  onLoad: function() {

    var userInfo = wx.getStorageSync("userInfo");
    console.log(userInfo);
    if(userInfo != null && userInfo != '' ){
      this.setData({
        userInfo : userInfo,
        hasUserInfo : true
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

  //外卖
  goShipping: function(e){
    var userInfo = this.data.userInfo;
    console.log(userInfo)
    if(userInfo){
      wx.switchTab({
        url: '/pages/list/list'
      })
    }else{
      getUserProfile(e)
    }
  },
  getUserProfile(e){
    var userInfo = this.data.userInfo;
    if(!userInfo){
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => {
          console.log(res.userInfo)
          this.setData ({
            userInfo : res.userInfo,
            hasUserInfo : true
          })
          wx.setStorageSync('userInfo', res.userInfo) ;
        },
        fail: (res) => {},
        complete: (res) => {
          
        },
      })
    }else{
      //有权限了
      var id = e.currentTarget.dataset.id;
      if(id == 0){  //门店自取
        wx.navigateTo({
          url: '/pages/list/list?is_self=true'
        })
      }else{        //外卖
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
                url: '/pages/mine/addr/addr',
              })
            }
          })
        }
      }
    }
  },

})
