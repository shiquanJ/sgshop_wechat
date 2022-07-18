const app = getApp()
const fetch = app.fetch
const server = app.globalData.server
// pages/mine/newAddr
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addrList:"",
    hasAddrInfo:false,
    is_self: '',
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.is_self == 'false'){
      this.data.is_self = 'false'
    }
    var that=this;
    //访问数据库
    console.log(wx.getStorageSync('user_id'))
    fetch('/api/addrList', {
      user_id : wx.getStorageSync('user_id')
      ,
    }, 'POST').then(res => {

      that.setData({
        addrList: res.addrList,
        hasAddrInfo: res.hasAddrInfo
      })
    })
      
  }, 
  //地址详细
  setDetailAddr: function(e){
    var id = e.currentTarget.dataset.id;
    console.log(e)
    wx.navigateTo({
      url: '../newAddr/newAddr?a_id='+id,
    })
  },
  setNewAddr: function(e){
    wx.navigateTo({
      url: '../newAddr/newAddr?is_self='+this.data.is_self,
    })
  },

  //设置默认地址
  /* setDefaultAddr: function(e){
    var that = this
    console.log(e)
    wx.showModal({
      title: '提示',
      content: '确认此地址为默认收货地址吗？',
      success: function(res){
        if(res.confirm){
          var addr_id = e.currentTarget.dataset.id;

          fetch('/api/upd_addr_default', {
            user_id : wx.getStorageSync('user_id'),
            addr_id : addr_id
          }, 'POST').then(res => {
      
            that.setData({
              addrList: res.addrList,
              hasAddrInfo: res.hasAddrInfo
            })
          })
        }else{
          
        }
      }
    }) 
  }*/
})