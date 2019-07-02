var fs = require('fs')
var gui = require('gui')
var util = require('virgin.util.js')

var CONF_FILE = '/datafs/bin/virgin.conf.json'

var _instance = null

module.exports = function () {
    return (_instance || (_instanceof = { //单例
        _jsonstring: null,
        _json: { "unique": true, "infoRequired": "xhh" },

        initialize: function () {
            console.debug = true
            console.log('> set.initialize()')

            // fs.open(CONF_FILE, 'r', function (err, fd) {
            //     if (err) {
            //         gui.message(err.message, '异常')
            //         console.log(err.message)
            //     } else {
            //         fs.close(fd, function (err) {
            //             if (err) {
            //                 gui.message(err.message, '异常')
            //                 console.log(err.message)
            //             }
            //         })
            //     }
            // })

            try {
                var fd = fs.openSync(CONF_FILE, 'r')
                // fd.open(CONF_FILE, 'r', function (err, fd) {
                //     if (err) {
                //         gui.message(err.message, '异常')
                //         console.log(err.message)
                //     } else {
                //         fs.close(fd, function (err) {
                //             if (err) {
                //                 gui.message(err.message,f '异常')
                //                 console.log(err.message)
                //             }
                //         })
                //     }
                // })

                var json = ''
                var buf = new Buffer(100)

                for (var i = 0; fs.readline(fd, buf); i++) {
                    json += buf.toString()
                    console.log('%d : %s', i + 1, buf.toString())
                    buf = new Buffer(100)
                }
                fs.closeSync(fd)

                this._jsonstring = json

                console.log(this._jsonstring)

                console.log('set.initialize() >')

                // return this

            } catch (excpt) {
                console.log(excpt.message)
                gui.messagebox(excpt.message, excpt.message)
                // throw excpt //这里不抛出异常，因为可能找不到配置文件，就按默认配置处理
            }

            return this
        },

        getConfig: function () {
            try {
                // console.log('getConfig():%s', this._jsonstring)
                this._json = JSON.parse(this._jsonstring)
                return this._json
            } catch (excpt) {
                console.log(excpt.message)
                throw excpt
            }
        },

        transform: function (literal) { //将分隔符的字面名称转换为字符
            var TRANS_MAP = { ',': ',', 'TAB': '\t', '~': '~' }
            return TRANS_MAP[literal]
        },

        // setConfig: function (json) { //传入一个设置的json对象
        //     try {
        //         console.log('_json:%s, json:%s', JSON.stringify(this._json), JSON.stringify(json))

        //         for (var k in json) {
        //             this._json[k] = json[k]
        //         }

        //         console.log('_json:%s, json:%s', JSON.stringify(this._json), JSON.stringify(json))

        //         var fd = fs.openSync(CONF_FILE, 'w+')
        //         var confstr = JSON.stringify(this._json)
        //         var buff = new Buffer(confstr)
        //         // console.log('buff.length=%s', buff.length.toString())
        //         gui.messagebox(CONF_FILE, 'abc')
        //         fs.writeSync(fd, buff, 0, buf.length, null)
        //         fs.closeSync(fd)


        //     } catch (excpt) {
        //         console.log(excpt.message)
        //         throw excpt
        //     }
        // },

        setConfig: function (json) { //传入一个设置的json对象
            try {
                // console.log('_json:%s, json:%s', JSON.stringify(this._json), JSON.stringify(json))

                for (var k in json) {
                    this._json[k] = json[k]
                }

                // console.log('_json:%s, json:%s', JSON.stringify(this._json), JSON.stringify(json))

                var fd = fs.openSync(CONF_FILE, 'w+')
                var confstr = JSON.stringify(this._json)
                var buff = new Buffer(confstr)
                // console.log('buff.length=%s', buff.length.toString())
                // gui.messagebox(CONF_FILE, 'abc')
                fs.writeSync(fd, buff, 0, buff.length, null)
                fs.closeSync(fd)


            } catch (excpt) {
                console.log(excpt.message)
                throw excpt
            }
        },


        _loadcfg: function () {
            // console.log('loadconf')
            // util.enumlog(this)
            this.getConfig()
            var cfg = this._json

            console.log('_loadcfg():' + cfg.unique)


            var comunique = gui.getctrl('comunique')
            comunique.setcursel(cfg.unique ? 0 : 1)

            var cominforequired = gui.getctrl('cominforequired')
            cominforequired.setcursel(cfg.infoRequired ? 0 : 1)

            var comseparator = gui.getctrl('comseparator')
            var CHOICE_MAP = { ',': 0, 'TAB': 1, '~': 2 }
            var idx = CHOICE_MAP[cfg.separator]
            comseparator.setcursel(idx)
        },

        show: function () {
            console.log('set.show() 1')

            var me = this

            gui.initialize()

            var dialog = gui.getdialogwrap()

            console.log('set.show() 2')

            dialog.on('onInitdialog', function () {
                console.log('set.show() 3')

                var lblunique = gui.getstaticwrap()
                lblunique.createstatic(dialog, 0, 12, 12, 72, 18, lblunique.SS_LEFT, '条码不重复')

                console.log('set.show() 3.5')

                var lblinforequired = gui.getstaticwrap()
                lblinforequired.createstatic(dialog, 0, 12, 36, 72, 18, lblinforequired.SS_LEFT, '必须有资料')

                var lblseparator = gui.getstaticwrap()
                lblseparator.createstatic(dialog, 0, 12, 60, 48, 18, lblseparator.SS_LEFT, '分隔符')

                var comunique = gui.getcomboboxwrap()
                comunique.createcombobox(dialog, 0, 84, 6, 68, 18)
                comunique.addlistbox('是')
                comunique.addlistbox('否')
                comunique.on('onEditChange', function (text) {
                    me._json.unique = text == '是' //这时的 this 是 gui，所以在外面用 me 来暂存 set.this
                    console.log(me._json.unique)
                })
                gui.addctrl('comunique', comunique)

                console.log('set.show() 4')

                var cominforequired = gui.getcomboboxwrap()
                cominforequired.createcombobox(dialog, 0, 84, 30, 56, 18)
                cominforequired.addlistbox('是')
                cominforequired.addlistbox('否')
                cominforequired.on('onEditChange', function (text) {
                    me._json.infoRequired = text == '是'
                })
                gui.addctrl('cominforequired', cominforequired)

                var comseparator = gui.getcomboboxwrap()
                comseparator.createcombobox(dialog, 0, 60, 56, 56, 18)
                comseparator.addlistbox(',')
                comseparator.addlistbox('TAB')
                comseparator.addlistbox('~')
                comseparator.on('onEditChange', function (text) {
                    me._json.separator = text
                })
                gui.addctrl('comseparator', comseparator)

                console.log('set.show() 5')

                var btnsave = gui.getbuttonwrap()
                btnsave.createbutton(dialog, 0, 55, 104, 48, 18, '保存')
                btnsave.on('onButtonClicked', function () {
                    try {
                        me.setConfig(me._json)
                        gui.messagebox('保存完成', '提示')
                    } catch (excpt) {
                        console.log(excpt.message)
                        gui.messagebox('保存完成', '异常')
                    }
                })

                me._loadcfg()

                comunique.setfocus()
            })

            dialog.on('onKeydown', function (key) {
                if (key == gui.keys.ESC) {
                    dialog.destroydialogbox() //销毁对话框
                }
            })

            dialog.createdialogbox(0, '设置')
        }
    }))
}