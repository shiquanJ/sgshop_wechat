const config = require('./config');
module.exports = function (path, data, method) {
  var sess = wx.getStorageSync('PHPSESSID')
  return new Promise ((resolve, reject) => {
    wx.request({
      url: config.url + path,
      method,
      data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      success: res => {
        // 请求成功
        if (res.statusCode !== 200) {
          fail('服务器异常！', reject)
          return
        }
        if (res.data.code === 0) {
          fail(res.data.msg, reject)
          return
        }
        resolve(res.data);
      },
      fail: (e) => {
        console.log(e)
        // 请求失败
        fail('加载数据失败', reject)
      }
    })
  })
}

function fail(title, callback) {
  wx.hideLoading()
  wx.showModal({
    title,
    confirmText: '重试',
    success: res => {
      if (res.confirm) {
        callback()
      }
    }
  })
}

function decodeCookie(cookie) {
  var obj = {}
  cookie.split(',').forEach((item) => {
    item.split(';').forEach((item) => {
      var arr = item.split('=')
      obj[arr[0]] = arr[1] !== undefined ? decodeURIComponent(arr[1]) : true
    })
  })
  return obj
}