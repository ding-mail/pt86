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

    var ESC = 1 //ESC键码
    var OK = 59 //OK键码
    var DOWN = 108 //下键
    var ENT = 28 //ENT
    var FUNC = 60 //FUNC

    var DEF_QTY = 1 //默认数量

    var TITLE = '盘点'

    var dialog = gui.getdialogwrap();  //获取对话框封装对象
    var scanServ = new Scan();  //scan服务实例化

    var m_bar = null //条码。用扫描或键盘输入，都存在这里
    var m_qty = null //数量。

    dialog.on('onInitdialog', function () {  //注册onInitdialog事件回调

        var static = gui.getstaticwrap() //条码 标题
        static.createstatic(dialog, 0, 5, 10, 30, 20, static.SS_LEFT, '条码')

        var lblqty = gui.getstaticwrap() //数量 标题
        lblqty.createstatic(dialog, 0, 5, 36, 30, 20, lblqty.SS_LEFT, '数量')

        var sledit = gui.getsleditwrap() //条码 输入框
        sledit.createsledit(dialog, 0, 35, 5, 120, 20)
        sledit.setfocus()
        sledit.on('onEditChange', function (text) {
            m_bar = text
            // dialog.bar = text
            console.log('bar.change = ' + m_bar)
        })

        var edtqty = gui.getsleditwrap() //数量输入框
        edtqty.createsledit(dialog, 0, 35, 31, 120, 20)
        edtqty.on('onEditChange', function (text) {
            m_qty = text
            // dialog.qty = text
            console.log('qty.change = ' + m_qty)
        })

        dialog.edtqty = edtqty //提供给别的函数访问

        scanServ.on('onBarcode', function (err, isEnd, received) {  //scan服务注册'onBarcode'事件回调，接收条码数据
            if (err == null) { //判断是否出错

                if (isEnd == false) {  //判断是否接收完数据
                    m_bar = received.slice(4).toString()
                    sledit.setsledit(m_bar)
                    try {
                        data.insert(m_bar, m_qty)
                    } catch (excep) {
                        console.log('插入记录发生异常：' + excep)
                    }

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
            // // console.log("this == dialog ")
            // console.log('bar = ' + dialog.bar + ' , qty = ' + dialog.qty)
            console.log('bar = ' + m_bar + ' , qty = ' + m_qty)
            // data.insert(dialog.bar, dialog.qty)
            try {
                data.insert(m_bar, m_qty)
            } catch (excep) {
                console.log(excep)
            }
            finally {
                m_qty = DEF_QTY //保存完就把数量调回默认值
                dialog.edtqty.setsledit(m_qty.toString())
            }

        } else if (key == FUNC) {
            console.log('FUNC') //没有响应
        }
    });

    dialog.createdialogbox(0, TITLE);  //创建对话框
};