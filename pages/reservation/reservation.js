// pages/cal2/index2.js

var dateTimePicker = require('../../utils/dateTimer');
Page({


  data: {
    dateString: "",
    dateTimeArray: '', //时间数组
    re_time: '',
  },
  dateChange(e) {
    this.setData({
      dateString: e.detail.dateString
    })
  },

  
  onLoad: function (options) {
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker();
    console.log(obj.dateTime)
    this.setData({
      start_time: obj.dateTime == -1? 0: obj.dateTime ,
      end_time: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
      is_self : options.is_self,
      temp_order_id: options.temp_order_id,
    });
    
  },
  changeDateTime(e) {
    let dateTimeArray = this.data.dateTimeArray,
      {
        type,
        param
      } = e.currentTarget.dataset;
    this.check_reservation(this.data.dateString, dateTimeArray[0][e.detail.value[0]]+":"+dateTimeArray[1][e.detail.value[1]])
    this.setData({
      [type]: e.detail.value,
      re_time : dateTimeArray[0][e.detail.value[0]] + ':' + dateTimeArray[1][e.detail.value[1]],
    });
  },
  changeDateTimeColumn(e) {
    var dateArr = this.data.dateTimeArray,
      {
        type
      } = e.currentTarget.dataset,
      arr = this.data[type];
    arr[e.detail.column] = e.detail.value;
    this.setData({
      [type]: arr
    });
  },

  
  onShow: function () {

  },
  //判断是否为1小时后
  check_reservation : function (str1, str2){
    var date1 = new Date(str1.replace(/-/g,'/')+" "+str2)
    var date2 = new Date();
    let check_m = parseInt(Math.round(date1 - date2)/1000/60)
    console.log('str1:::'+str1.replace(/-/g,'/'))
    console.log('str2:::'+str2)
    console.log('check_m:::'+check_m)
    if(check_m < 58){
      wx.showModal({
        cancelText: '取消',
        confirmColor: '#ff2244',
        confirmText: '确认',
        content: '预约需提前一小时，请重新选择',
        placeholderText: 'placeholderText',
        showCancel: false,
        title: '提示',
        success: (result) => {
          if(result.confirm){
            this.setData({
              re_time: ''
            })
          }
        },
      })
      return false
    }
    return true
  },
  confirm:function(){
    if(this.check_reservation(this.data.dateString,this.data.re_time)){
      wx.navigateTo({
        url: '/pages/order/checkout/checkout?temp_order_id=' + this.data.temp_order_id + '&is_self='+this.data.is_self
              +'&order_sendtime='+this.data.dateString+" "+this.data.re_time
      })
    }

  },
  //字符串转为date
  replace_date : function(str){
    return str.replace(/-/g,'/')
  },
  
})