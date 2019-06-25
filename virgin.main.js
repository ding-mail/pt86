var gui = require('gui') //获取内置gui模块接口
var guiex = require('virgin.gui') //gui扩展
var check = require('virgin.check.js')
var exp = require('virgin.export.js')
var about = require('virgin.about.js')
var wh = require('virgin.warehouse.js') //仓库

guiex.extend() //整个程序只需要调用一次
gui.initialize() //gui初始化

var ESC = 1 //ESC键码
var OK = 59 //OK键码
var KEY_1 = 2

var TITLE = '简单盘点程序'

function exitcfr() {
  if (gui.messageboxYN('退出程序吗？', '确认')) {
    dialog.destroydialogbox() //销毁对话框
    gui.release() //退出gui事件循环
  }
}

var dialog = gui.getdialogwrap() //获取对话框封装对象

dialog.on('onInitdialog', function(hdc) {
  var listbox = gui.getlistboxwrap() //获取列表框封装对象
  listbox.on('onListboxEnter', function(cur_sel) {
    if (cur_sel == 0) {
      var promise = wh.show().then(function(wname) {
        console.log(wname)
        check(wname)
      })
    } else if (cur_sel == 1) {
      exp()
    } else if (cur_sel == 2) {
      about()
    } else if (cur_sel == 3) {
      exitcfr()
    }
  })

  listbox.createlistbox(dialog, 0, 0, 0, 158, 128) //创建列表框
  listbox.addlistbox('[1] 盘点')
  listbox.addlistbox('[2] 导出数据')
  listbox.addlistbox('[3] 关于')
  listbox.addlistbox('[4] 退出')
  listbox.setfocus() //获取焦点
})

dialog.on('onKeydown', function(key) {
  if (key == ESC) {
    exitcfr()
  }
})

dialog.createdialogbox(0, TITLE)
