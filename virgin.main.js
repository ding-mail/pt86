var gui = require("gui"); //获取内置gui模块接口
var check = require('virgin.check.js')
var exp = require('virgin.export.js')
var about = require('virgin.about.js')

gui.initialize();  //gui初始化

var ESC = 1; //ESC键码
var OK = 59; //OK键码
var KEY_1 = 2;

var TITLE = '简单盘点程序'

var dialog = gui.getdialogwrap();  //获取对话框封装对象
// win.on('onPaint', function (hdc){
//     gui.circle(hdc, 80, 80, 40);
// })

// win.on('onKeydown', function (key) {
// 	if (key == OK) {
// 		// var dialog = gui.getdialogwrap();
// 		// dialog.on('onInitdialog', function(){
// 		// 	var button = gui.getbuttonwrap();
// 		// 	button.createbutton(dialog, 0, 20, 60, 60, 20, 'Hello World');
// 		// 	button.setfocus();
// 		// });
// 		// dialog.on('onKeydown', function(key){
// 		// 	if(key == ESC){
// 		// 		dialog.destroydialogbox();
// 		// 	}
// 		// });
// 		// dialog.createdialogbox(0, 'Dialog', win);
// 		gui.messagebox('KEY_OK', 'KEY_OK')
// 	} else if (key == KEY_1) {
// 		gui.messagebox('KEY_1', 'KEY_1')
// 	}
// 	else if (key == ESC) {
// 		win.destroywindow();
// 		gui.release();
// 	}
// });

dialog.on('onInitdialog', function (hdc) {
    var listbox = gui.getlistboxwrap(); //获取列表框封装对象
    listbox.on('onListboxEnter', function (cur_sel) {
        if (cur_sel == 0) {
            // gui.messagebox('check()', '提示');
            check()
        }
        else if (cur_sel == 1){
            exp()
        }
        else if (cur_sel == 2){
            about()
        }
        else {
            dialog.destroydialogbox() //销毁对话框
            gui.release() //退出gui事件循环
            // gui.messagebox('选中第' + (cur_sel + 1) + '项', '提示');
        }
    });
    listbox.createlistbox(dialog, 0, 0, 0, 158, 128);  //创建列表框
    listbox.addlistbox('[1] 盘点 [1]');  //添加列表项
    listbox.addlistbox('[2] 导出数据');
    listbox.addlistbox('[3] 关于');
    listbox.addlistbox('[4] 退出');
    listbox.setfocus(); //获取焦点

    // var win = getwinwrap()
    // win.on('onPaint', function (hdc){
    //     gui.circle(hdc, 80, 80, 40);
    // })
});

// var listbox = gui.getlistboxwrap(); //获取列表框封装对象
// listbox.on('onListboxEnter', function(cur_sel){
// 	gui.messagebox('选中第'+(cur_sel+1)+'项', '提示');
// });
// listbox.createlistbox(win, 0, 0, 0, 158, 128);  //创建列表框
// listbox.addlistbox('1 item1');  //添加列表项
// listbox.addlistbox('2 item2');
// listbox.addlistbox('3 item3');
// listbox.addlistbox('4 item4');
// listbox.addlistbox('5 item5');
// listbox.addlistbox('6 item6');
// listbox.addlistbox('7 item7');
// listbox.addlistbox('8 item8');
// listbox.setfocus(); //获取焦点


dialog.createdialogbox(0, TITLE);

// dialog.on('onInitdialog', function () {  //注册onInitdialog事件回调

//     var static = gui.getstaticwrap(); //获取静态框封装对象
//     static.createstatic(dialog, 0, 0, 0, 158, 128, static.SS_LEFT, '\n[1] 盘点\n\n[2] 导出数据\n\n[3] 关于\n\n[4] 退出');  //创建静态框
//     static.setfocus(); //获取焦点

// });



// var win = gui.getwinwrap()
// win.on('onKeydown', function (key) {
//     if (key == ESC) {
//         dialog.destroydialogbox() //销毁对话框
//         gui.release() //退出gui事件循环
//     }
//     else if (key == KEY_1) {
//         gui.messagebox('KEY_1', 'KEY_1')
//     }
// })

// dialog.createdialogbox(0, TITLE);  //创建对话框
