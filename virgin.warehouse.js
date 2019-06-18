var gui = require('gui')
var Data = require('virgin.data.js')

module.exports = {
  show: function() {
    // var data = Data()
    // data.initialize()

    console.debug = true
    console.log('-->>wh.show()')

    var data = Data()
    data.initialize() //初始化数据库

    gui.initialize()

    var ESC = 1 //ESC键码
    var OK = 59 //OK键码

    var TITLE = '仓库'

    //    0123456789ABC
    //        仓库
    //#1  [1]仓库一
    //#2  [2]仓库二
    //#3  [3]仓库三
    //...
    //#12 [新仓库]
    //#13 -

    var dialog = gui.getdialogwrap()
    dialog.on('onInitdialog', function() {
      //建立仓库列表
      var lstHouse = gui.getlistboxwrap()
      lstHouse.createlistbox(dialog, 0, 0, 0, 158, 110)

      var whs = data.getWarehouses()
      for (var i in whs) {
        lstHouse.addlistbox('[' + (parseInt(i) + 1) + '] ' + whs[i].wname)
      }

      // lstHouse.setfocus()

      //新增仓库 按钮
      var btnAdd = gui.getbuttonwrap()
      btnAdd.on('onButtonClicked', function() {
        gui.messagebox('新增仓库', '提示')
      })

      btnAdd.createbutton(dialog, 0, 49, 110, 48, 18, '新增')
      btnAdd.setfocus()
    })

    dialog.on('onKeydown', function(key) {
      if (key == ESC) {
        dialog.destroydialogbox()
        console.log('wh.show()-->>')
      }
    })

    dialog.createdialogbox(0, TITLE)
  }
}
