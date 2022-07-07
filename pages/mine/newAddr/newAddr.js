const app = getApp()
const fetch = app.fetch

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addr_id:'',
    add:true,
    is_new:true, //是新建还是修改
    addressName:'',
    addressDetail:'',
    params:{
      detail:"",
      phone:"",
      contact:"",
    },
    gender: '先生',
    checked: 0,
    can_click:false,//默认不可点击
    default_addr: '', //默认项
  },
  checked : function (e){
    this.setData({
      checked: e.currentTarget.id,
      gender : e.currentTarget.id ==  0? '先生':'女士' ,
    })
  },
  setInput(e){
    let {type}=e.currentTarget.dataset,val = e.detail.value;
    let k = `params.${type}`
    this.setData({
      [k]: val,
    })
    this.inputClick()
  },
  inputClick(){
    let params = this.data.params,status=true,
    {addressName,addressDetail}=this.data;
    if (addressName == '') {
      status = false;
    }
    if (addressDetail == '') {
      status = false;
    }
    if (params.detail == '') {
      status = false;
    }

    if (params.phone == '') {
      status = false;
    }

    if (params.contact == '') {
      status = false;
    }
    this.setData({
      can_click:status
    })
  },

 
  onLoad: function (options) {
    var id = options.a_id;
    console.log(id)
    this.data.addr_id = id 
    if(id !=null && id != ''){

      //ID查询收获地址
      fetch('/api/getAddrInfo', {
        addr_id: id,
        user_id: wx.getStorageSync('user_id')
      }, 'POST').then(res => {
        this.setData({
          addressName: res.receipt_address_name,
          addressDetail: res.receipt_address_detail,
          'params.contact': res.receipt_name,
          'params.phone': res.receipt_phone,
          'params.detail':res.receipt_detail,
          gender:res.gender,
          add: false,
          is_new: false,
        })
      })
      this.inputClick()
    }
  },

 
  onShow: function () {

  },
   //获取用户定位授权，地图选点
   getLocation: function () {
    wx.getSetting({
      success:res=>{
        if(!res.authSetting['scope.userLocation']){
          wx.authorize({ 
            scope: 'scope.userLocation', 
            success:res=>{

            },fail:res=>{
              wx.showModal({
                title: '提示',
                content: '系统需要获取该您当前的定位，请确保您的位置授权已开启',
                showCancel: false,
                success: res=>{
                  if (res.confirm) {
                    wx.openSetting({
    
                    })
                  }
                }
              })
            }
          });
        }
        wx.chooseLocation({ 
          success: res=>{
            console.log(res)
            if(res.address!='' && res.name!=''){
              this.setData({
                addressName: res.name,
                addressDetail: res.address,
                add:false
              })
              this.inputClick()
            }
          }
        })
      }
    })

   },
   //获取微信收货地址
   chooseAddress(){
    // scope.address 通讯地址（已取消授权，可以直接调用对应接口）
    wx.chooseAddress({
      success: (res) => {
        console.log(res)
        this.setData({
          addressName: res.detailInfo,
          addressDetail: res.provinceName+res.cityName+res.countyName,
          'params.contact': res.userName,
          'params.phone': res.telNumber,
          'params.detail':res.detailInfo,
          add: false
        })
        this.inputClick()
      },
    })
  },
  subAddress(){
    this.inputClick()
    let params = this.data.params,  {addressName,addressDetail}=this.data;
    console.log(params);
    if(params.phone==''){
      wx.showToast({
        title: '请输入手机号',
        icon:'none'
      })
      return;
    }
    if (addressName == '' || addressDetail == ''){
      wx.showToast({
        title: '请选择收货地址',
        icon:'none'
      })
      return false;
    }
    if (params.detail == '' ){
      wx.showToast({
        title: '请输入详细地址',
        icon:'none'
      })
      return false;
    }
    if (params.contact == '' ){
      wx.showToast({
        title: '请输入联系人',
        icon:'none'
      })
      return false;
    }
    console.log(params)
    console.log(addressName)
    console.log(addressDetail)
    fetch('/api/saveAddr', {
      addr_id : this.data.addr_id,
      user_id : wx.getStorageSync('user_id'),
      phone:params.phone,
      receipt_name: params.contact,
      detail: params.detail,
      addressName:addressName,
      addressDetail:addressDetail,
      gender: this.data.gender,
      is_new : this.data.is_new,

    }, 'POST').then(res => {
      console.log(res)
      if(res.status == '0'){  //保存成功
        wx.setStorageSync('addrList', res.addrList)
        wx.showToast({
          title: '保存成功！', // 标题
          icon: 'success',  // 图标类型，默认success
          duration: 1500  // 提示窗停留时间，默认1500ms
        })
        wx.navigateTo({
          url: '../addrList/addr',
        })
      }
    })
    
  }
 

 
})