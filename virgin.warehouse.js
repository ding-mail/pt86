var gui = require('gui')
var EventEmitter = require('events').EventEmitter
var Data = require('virgin.data.js')
var util = require('virgin.util')

var addhouse = {
  show: function() {
    var whname = ''
    var promise = new util.Promise()

    gui.initialize()

    var dialog2 = gui.getdialogwrap()
    dialog2.on('onInitdialog', function() {
      var lblwh = gui.getstaticwrap()
      lblwh.createstatic(dialog2, 0, 0, 60, 48, 12, lblwh.SS_CENTER, '仓库名')
      gui.addctrl('lblwh', lblwh)

      var txtwh = gui.getsleditwrap()
      txtwh.createsledit(dialog2, 0, 48, 54, 104, 24)
      gui.addctrl('txtwh', txtwh)

      txtwh.on('onEditChange', function(text) {
        whname = text
      })

      txtwh.setfocus()
    })

    dialog2.on('onKeydown', function(key) {
      if (key == gui.keys.ESC) {
        dialog2.destroydialogbox()
      } else if (key == gui.keys.OK) {
        // gui.messagebox(whname, '提示')
        promise.thencb(whname)
        dialog2.destroydialogbox()
      }
    })

    dialog2.createdialogbox(0, '新仓库')

    return promise
  }
}

module.exports = {
  show: function() {
    console.debug = true
    console.log('-->>wh.show()')

    var data = Data()
    data.initialize() //初始化数据库

    gui.initialize()

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
      lstHouse.on('onListboxEnter', function(index) {
        // gui.messagebox(whs.length(), '提示')
        console.log(whs.length + '---' + index)
      })

      lstHouse.createlistbox(dialog, 0, 0, 0, 158, 106)
      gui.addctrl('lstHouse', lstHouse)

      //建立仓库列表
      var whs = data.getWarehouses()
      for (var i in whs) {
        lstHouse.addlistbox('[' + (parseInt(i) + 1) + '] ' + whs[i].wname)
      }

      //新增仓库 按钮
      var btnAdd = gui.getbuttonwrap()
      btnAdd.on('onButtonClicked', function() {
        // gui.messagebox('新增仓库', '提示')
        var promise = addhouse
          .show()
          .then(function(whname) {
            // console.log(whname)
            try {
              data.addWarehouse(whname)
              lstHouse.createlistbox(dialog, 0, 0, 0, 158, 106)
              whs = data.getWarehouses()
              for (var i in whs) {
                lstHouse.addlistbox(
                  '[' + (parseInt(i) + 1) + '] ' + whs[i].wname
                )
              }
            } catch (excep) {
              this.catchcb(excep)
            }
          })
          .catch(function(excep) {
            gui.messagebox(excep.message, '异常')
          })
      })
      gui.addctrl('btnAdd', btnAdd)

      btnAdd.createbutton(dialog, 0, 55, 108, 48, 18, '新增')
      btnAdd.setfocus()

      lstHouse.setfocus() //初始时列表获得焦点
    })

    dialog.on('onKeydown', function(key) {
      if (key == gui.keys.ESC) {
        dialog.destroydialogbox()
        console.log('wh.show()-->>')
      } else if (key == gui.keys.LEFT) {
        gui.getctrl('lstHouse').setfocus()
      } else if (key == gui.keys.RIGHT) {
        gui.getctrl('btnAdd').setfocus()
      }
    })

    dialog.createdialogbox(0, TITLE)
  }
}
