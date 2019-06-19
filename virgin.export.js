var gui = require('gui') //获取内置gui模块接口
var Data = require('virgin.data.js')
var EventEmitter = require('events').EventEmitter

module.exports = function() {
  var data = Data()
  data.initialize() //初始化数据库

  gui.initialize() //gui初始化

  var emitter = new EventEmitter()
  emitter.on('expdone', function() {
    gui.messagebox('导出完成：' + data.EXP_FILE, '提示')
  })

  var ESC = 1 //ESC键码
  var OK = 59 //OK键码

  var TITLE = '导出数据'

  var dialog = gui.getdialogwrap() //获取对话框封装对象

  dialog.on('onInitdialog', function() {
    //注册onInitdialog事件回调
    var btnexp = gui.getbuttonwrap()
    btnexp.on('onButtonClicked', function() {
      try {
        data.export(emitter)
      } catch (err) {
        console.debug = true
        console.log(err)
      }
    })
    btnexp.createbutton(dialog, 0, 49, 55, 60, 18, '确认导出')
    btnexp.setfocus()
  })

  dialog.on('onKeydown', function(key) {
    //注册onKeydown事件回调

    if (key == ESC) {
      dialog.destroydialogbox() //销毁对话框
      //gui.release();  //退出gui事件循环
    }
    // else if (key == OK) {
    //     try {
    //         data.export(emitter)
    //         // gui.messagebox('导出完成', '提示')
    //     } catch (err) {
    //         console.debug = true
    //         console.log(err)
    //     }
    // }
  })

  dialog.createdialogbox(0, TITLE) //创建对话框
}
