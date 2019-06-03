var gui = require('gui'); //获取内置gui模块接口
var Scan = require('scan');  //导入scan模块
var Data = require('virgin.data.js') //导入数据模块
// var Test = require('virgin.test.js')

module.exports = function () {

    // var test = Test()
    // test.set('test.set')
    // console.debug = true
    // console.log(test.get())
    // //  console.log(test())
    // // console.log(data)

    var data = Data()
    data.initialize() //初始化数据库

    gui.initialize();  //gui初始化

    var ESC = 1; //ESC键码
    var OK = 59; //OK键码
    var DOWN = 108 //下键

    var TITLE = '盘点--'

    var dialog = gui.getdialogwrap();  //获取对话框封装对象
    var scanServ = new Scan();  //scan服务实例化

    dialog.on('onInitdialog', function () {  //注册onInitdialog事件回调
        var static = gui.getstaticwrap()
        static.createstatic(dialog, 0, 5, 10, 30, 20, static.SS_LEFT, '条码');
        static.createstatic(dialog, 0, 5, 30, 30, 20, static.SS_LEFT, '数量');


        var sledit = gui.getsleditwrap();
        sledit.createsledit(dialog, 0, 35, 5, 120, 20);
        sledit.setfocus();
        sledit.on('onEditChange', function (text) {

        })

        var edtqty = gui.getsleditwrap()
        edtqty.createsledit(dialog, 0, 35, 25, 120, 20)

        scanServ.on('onBarcode', function (err, isEnd, received) {  //scan服务注册'onBarcode'事件回调，接收条码数据
            if (err == null) { //判断是否出错

                if (isEnd == false) {  //判断是否接收完数据
                    var bar = received.slice(4).toString()
                    sledit.setsledit(bar)
                    data.insert(bar, 1)
                }
            }
        });
        scanServ.start();  //扫码服务开启        
    });

    dialog.on('onKeydown', function (key) {  //注册onKeydown事件回调

        if (key == ESC) {
            scanServ.end();  //关闭扫码服务
            dialog.destroydialogbox();  //销毁对话框
            //gui.release();  //退出gui事件循环
            data.finalize()
        }
        else if (key == OK) {
            console.debug = true
            console.log("this == dialog ")
        }
    });

    dialog.createdialogbox(0, TITLE);  //创建对话框
};
