//GUI扩展

var gui = require('gui')

var m_ctrls = {}

module.exports = {
  extend: function() {
    //整个程序只需要调用一次即可
    gui.addctrl = function(ctrlname, actrl) {
      m_ctrls[ctrlname] = actrl
    }

    gui.getctrl = function(ctrlname) {
      //整个程序只需要调用一次即可
      return m_ctrls[ctrlname]
    }

    var ESC = 1 //ESC键码
    var OK = 59 //OK键码
    var LEFT = 105 //左
    var RIGHT = 106 //右
    var UP = 103 //上
    var DOWN = 108 //下

    gui.keys = {
      ESC: ESC,
      OK: OK,
      LEFT: LEFT,
      RIGHT: RIGHT,
      UP: UP,
      DOWN: DOWN
    }
  }
}
