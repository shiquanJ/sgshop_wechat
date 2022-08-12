function withData(param) {
  return param < 10 ? '0' + param : '' + param;
}

function getLoopArray(start, end) {
  var start = start || 0;
  var end = end || 1;
  var array = [];
  for (var i = start; i <= end; i++) {
    array.push(withData(i));
  }
  return array;
}


function getNewDateArry() {
  // 当前时间的处理
  var newDate = new Date();
  var hour = withData(newDate.getHours()+1),
    minu = withData(newDate.getMinutes())

  return [hour, minu];
}

function dateTimePicker(date) {
  // 返回默认显示的数组和联动数组的声明
  var dateTime = [],
    dateTimeArray = [
      [],
      []
    ];
  // 默认开始显示数据
  var defaultDate = date ? [...date.split(' ')[0].split('-'), ...date.split(' ')[1].split(':')] : getNewDateArry();
  // 处理联动列表数据
  /*时分*/
  dateTimeArray[0] = ['10','11','12','13','14','15','16','17','18','19','20']
  dateTimeArray[1] = ['00','10','20','30','40','50']

  dateTimeArray.forEach((current, index) => {
    dateTime.push(current.indexOf(defaultDate[index]));
  });
  return {
    dateTimeArray: dateTimeArray,
    dateTime: dateTime
  }
}
module.exports = {
  dateTimePicker: dateTimePicker,
}