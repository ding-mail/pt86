var gui = require("gui"); //获取内置gui模块接口
var Scan = require('scan');  //导入scan模块

module.exports = function () {
    gui.initialize();  //gui初始化

    var ESC = 1; //ESC键码
    var OK = 59; //OK键码

    var TITLE = '盘点'

    var dialog = gui.getdialogwrap();  //获取对话框封装对象
    var scanServ = new Scan();  //scan服务实例化

    dialog.on('onInitdialog', function () {  //注册onInitdialog事件回调
        var static = gui.getstaticwrap()
        static.createstatic(dialog, 0, 5, 10, 30, 20, static.SS_LEFT, '条码');

        var sledit = gui.getsleditwrap();
        sledit.createsledit(dialog, 0, 35, 5, 120, 20);
        sledit.setfocus();
    
        scanServ.on('onBarcode', function (err, isEnd, data) {  //scan服务注册'onBarcode'事件回调，接收条码数据
            if (err == null) { //判断是否出错
    
                if (isEnd == false) {  //判断是否接收完数据
                    sledit.setsledit(data.slice(4).toString());
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
        }

    });

    dialog.createdialogbox(0, TITLE);  //创建对话框
};
