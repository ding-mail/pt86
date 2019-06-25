var gui = require('gui') //获取内置gui模块接口
// var Scan = require('scan');  //导入scan模块
var Data = require('virgin.data.js') //导入数据模块

// var Dbwrap = require('virgin.dbwrap.js')

module.exports = function(wname) {
  var data = Data()
  data.initialize()

  // var dbwrap = Dbwrap()
  // dbwrap.initialize()

  // gui.initialize()

  console.debug = true
  console.log('-->virgin.list.js')

  var ESC = 1 //ESC键码
  var OK = 59 //OK键码
  var ENT = 28 //ENT

  var TITLE = '盘点记录' + '(' + wname + ')'

  var dialog = gui.getdialogwrap()
  // dialog.createdialogbox(0, TITLE)
  dialog.on('onInitdialog', function(hdc) {
    // dbwrap.printrefcnt()

    var lstchecks = gui.getlistboxwrap()
    lstchecks.createlistbox(dialog, 0, 0, 0, 158, 128)

    var records = data.query(wname)
    for (var i in records) {
      lstchecks.addlistbox(
        '[' + (parseInt(i) + 1) + '] ' + records[i].bar + ',' + records[i].qty
      )
    }

    // for (var i = 0; i < 30; i++) {
    //     lstchecks.addlistbox('[' + (parseInt(i) + 1) + '] ')
    // }
    lstchecks.setfocus() //获取焦点
  })

  dialog.on('onKeydown', function(key) {
    if (key == ESC) {
      dialog.destroydialogbox() //销毁对话框
      data.finalize()
    }
  })

  dialog.createdialogbox(0, TITLE)
}
