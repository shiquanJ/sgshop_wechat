const app = getApp()
const fetch = app.fetch
const server = app.globalData.server
var categoryHeight = [] // 右列表各分类高度数组

Page({
  data: {
    activeIndex: 0,
    tapIndex: 0,
    prdList: '',
    categoryList: '',
    cartList: {},
    cartPrice: 0,
    cartNumber: 0,
    cartBall: {
      show: false,
      x: 0,
      y: 0
    },
    showCart: false,
    promotion: {},
    server: server,
    windowHeight:'',
    is_self:'', //false 外卖， true 自取
  },
  changingCategory: false, // 是否正在切换左侧激活的分类（防止滚动过快时切换迟缓）
  shopcartAnimate: null,
  onLoad: function(options) {
    wx.showLoading({
      title: '努力加载中...'
    })
    //获取手机高度
    const sysInfo = wx.getSystemInfoSync();
    console.log("self::"+options.is_self)
    this.setData({
      is_self: options.is_self,
      windowHeight : sysInfo.windowHeight + "px"
    })
    //fetch('list').then(data => {
    var that = this
    fetch('/api/list', '', 'POST').then(res => {
    
      console.log(res)
      if(res.prdList == null){
        this.onLoad()
      }
      wx.hideLoading()
      for (var i in res.prdList) {
        that.setData({
          activeIndex: i
        })
        break
      }
      that.setData({
        prdList: res.prdList,
        categoryList: res.categoryList,
      }, () => {
        var query = wx.createSelectorQuery()
        var top = 0
        query.select('.food').boundingClientRect(rect => {
          top = rect.top
        })
        query.selectAll('.food-category').boundingClientRect(res => {
          res.forEach(rect => {
            categoryHeight[rect.id.substring(rect.id.indexOf('_') + 1)] = rect.top - top
          })
        })
        query.exec()
      })
    })
      
    //this.shopcartAnimate = shopcartAnimate('.cart-icon', this)
  },
  tapCategory: function(e) {
    var index = e.currentTarget.dataset.index
    this.changingCategory = true
    this.setData({
      activeIndex: index,
      tapIndex: index
    }, () => {
      this.changingCategory = false
    })
  },
  onFoodScroll: function(e) {
    var scrollTop = e.detail.scrollTop
    var activeIndex = 0
    categoryHeight.forEach((item, i) => {
      if (scrollTop >= item) {
        activeIndex = i
      }
    })
    if (!this.changingCategory) {
      this.changingCategory = true
      this.setData({
        activeIndex: activeIndex,
      }, () => {
        this.changingCategory = false
      })
    }
  },
  scrolltolower: function() {
    this.setData({
      activeIndex: categoryHeight.length - 1
    })
  },
  addToCart: function(e) {
    var that = this
    var id = e.currentTarget.dataset.id
    var category_id = e.currentTarget.dataset.category_id
    var food = that.data.prdList[id]
    var cartList = this.data.cartList
    if (cartList[id]) {
      ++cartList[id].number
    } else {
      cartList[id] = {
        prd_id: food.prd_id,
        name: food.prd_name,
        price: parseFloat(food.price),
        number: 1
      }
    }
    //this.shopcartAnimate.show(e)
    this.setData({
      cartList,
      cartPrice: this.data.cartPrice + cartList[id].price,
      cartNumber: this.data.cartNumber + 1
    })
  },
  showCartList: function() {
    if (this.data.cartNumber > 0) {
      this.setData({
        showCart: !this.data.showCart
      })
    }
  },
  // 减少商品，最小数量为1
  cartNumberDec: function(e) {
    var id = e.currentTarget.dataset.id
    var cartList = this.data.cartList
    if (cartList[id]) {
      var price = cartList[id].price
      if (cartList[id].number > 1) {
        --cartList[id].number
        this.setData({
          cartList,
          cartNumber: --this.data.cartNumber,
          cartPrice: this.data.cartPrice - price
        })
      } else {
        wx.showToast({
          icon: "none",
          title: '商品不可再减少~',
        })
        this.setData({
          cartList,
          cartNumber: this.data.cartNumber,
          cartPrice: this.data.cartPrice
        })
      }
    }
  },
  // 增加商品
  cartNumberAdd: function(e) {
    var id = e.currentTarget.dataset.id
    var cartList = this.data.cartList
      ++cartList[id].number
    this.setData({
      cartList,
      cartNumber: ++this.data.cartNumber,
      cartPrice: this.data.cartPrice + cartList[id].price
    })
  },
  // 删除商品
  cartNumberDel: function(e) {
    var id = e.currentTarget.dataset.id
    var cartList = this.data.cartList
    var price = cartList[id].price
    var num = cartList[id].number
    delete cartList[id]
    this.setData({
      cartList,
      cartNumber: this.data.cartNumber - num,
      cartPrice: this.data.cartPrice - num*price
    })
    if (this.data.cartNumber <= 0) {
      this.setData({
        showCart: false
      })
    }
  },
  // 清空购物车
  cartClear: function() {
    this.setData({
      cartList: {},
      cartNumber: 0,
      cartPrice: 0,
      showCart: false
    })
  },
  //주문 플로우
  // 1. 카트리스트에 있는 상품들을 temp_order_list 에 임시 저장
  order: function() {
    if (this.data.cartNumber === 0) {
      return
    }
    wx.showLoading({
      title: '正在生成订单...'
    })

    console.log(this.data.cartList)

    app.setSession('cartList', this.data.cartList)

    fetch('/api/temp_order', {
      
      cartList: JSON.stringify(this.data.cartList)
    }, 'POST').then(data => {
      console.log(data.temp_order_id);
      wx.hideLoading()
      if(this.data.is_self == 'false'){
        wx.navigateTo({
          url: '/pages/reservation/reservation?temp_order_id=' + data.temp_order_id + '&is_self='+this.data.is_self
        })       
      }else{
        wx.navigateTo({
          url: '/pages/order/checkout/checkout?temp_order_id=' + data.temp_order_id + '&is_self='+this.data.is_self
        })
      }
      // console.log(data.order_id)
    }, () => {
      this.order()
    })
  }
})

/* function shopcartAnimate(iconClass, page) {
  var busPos = {}
  wx.createSelectorQuery().select(iconClass).boundingClientRect(rect => {
    busPos.x = rect.left + 15
    busPos.y = rect.top
  }).exec()
  return {
    show: function(e) {
      var finger = {
        x: e.touches[0].clientX - 10,
        y: e.touches[0].clientY - 10
      }
      var topPoint = {}
      if (finger.y < busPos.y) {
        topPoint.y = finger.y - 150
      } else {
        topPoint.y = busPos.y - 150
      }
      topPoint.x = Math.abs(finger.x - busPos.x) / 2
      if (finger.x > busPos.x) {
        topPoint.x = (finger.x - busPos.x) / 2 + busPos.x
      } else {
        topPoint.x = (busPos.x - finger.x) / 2 + finger.x
      }
      var linePos = bezier([busPos, topPoint, finger], 30)
      var bezier_points = linePos.bezier_points
      page.setData({
        'cartBall.show': true,
        'cartBall.x': finger.x,
        'cartBall.y': finger.y
      })
      var len = bezier_points.length
      var index = len
      let i = index - 1
      var timer = setInterval(function() {
        i = i - 5
        if (i < 1) {
          clearInterval(timer)
          page.setData({
            'cartBall.show': false
          })
          return
        }
        page.setData({
          'cartBall.show': true,
          'cartBall.x': bezier_points[i].x,
          'cartBall.y': bezier_points[i].y
        })
      }, 50)
    }
  }

  function bezier(pots, amount) {
    var pot
    var lines
    var ret = []
    var points
    for (var i = 0; i <= amount; ++i) {
      points = pots.slice(0)
      lines = []
      while (pot = points.shift()) {
        if (points.length) {
          lines.push(pointLine([pot, points[0]], i / amount))
        } else if (lines.length > 1) {
          points = lines
          lines = []
        } else {
          break
        }
      }
      ret.push(lines[0])
    }

    function pointLine(points, rate) {
      var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance
      var ret = []
      pointA = points[0]
      pointB = points[1]
      xDistance = pointB.x - pointA.x
      yDistance = pointB.y - pointA.y
      pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2)
      tan = yDistance / xDistance
      radian = Math.atan(tan)
      tmpPointDistance = pointDistance * rate
      ret = {
        x: pointA.x + tmpPointDistance * Math.cos(radian),
        y: pointA.y + tmpPointDistance * Math.sin(radian)
      }
      return ret
    }
    return {
      bezier_points: ret
    }
  }
} */