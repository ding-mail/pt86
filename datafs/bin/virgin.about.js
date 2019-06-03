var gui = require("gui"); //获取内置gui模块接口

module.exports = function () {
    gui.initialize();  //gui初始化

    var ESC = 1; //ESC键码
    var OK = 59; //OK键码

    var TITLE = '关于'

    var dialog = gui.getdialogwrap();  //获取对话框封装对象

    dialog.on('onInitdialog', function () {  //注册onInitdialog事件回调
        var static = gui.getstaticwrap();
        static.createstatic(dialog, 0, 0, 52, 158, 24, static.SS_CENTER, '深圳市信华翰科技有限公司\r@2019.4');
    });

    dialog.on('onKeydown', function (key) {  //注册onKeydown事件回调

        if (key == ESC) {
            dialog.destroydialogbox();  //销毁对话框
            //gui.release();  //退出gui事件循环
        }

    });

    dialog.createdialogbox(0, TITLE);  //创建对话框
};
