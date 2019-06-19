//数据模块
var db = require('db')
var fs = require('fs')
// var EventEmitter = require('events').EventEmitter

var refcnt = 0 //本模块的引用次数
var mdbfile = null //本模块的数据库文件对象

var mydbfile = null
var mystmtinsert = null
var mystmtdelete = null
var mystmtupdate = null
var mystmtselect = null
var mystmtquery = null
var mystmtquerycnd = null
var mystmtselectwh = null
var mystmtinsertwh = null

module.exports = function() {
  console.debug = true
  console.log('-->> virgin.data.js')

  // var mydbfile = null
  // var mystmtinsert = null
  // var mystmtdelete = null
  // var mystmtupdate = null
  // var mystmtselect = null
  // var mystmtquery = null

  return {
    EXP_DIR: '/datafs/virgin.export', //导出文件夹
    EXP_FILE: '/datafs/virgin.export/virgin.export.txt', //导出文件名

    initialize: function() {
      //初始化数据库

      if (!refcnt) {
        db.initialize()

        mydbfile = mydbfile || db.open('virgin.db') //打开数据库文件
        try {
          // mydbfile.exec('CREATE TABLE checks(id INTEGER AUTO_INCREMENT PRIMARY KEY, bar TEXT NOT NULL)') //执行sql语句
          mydbfile.exec(
            'CREATE TABLE checks(id INTEGER PRIMARY KEY, bar TEXT NOT NULL, qty INTEGER NOT NULL);' +
              'CREATE TABLE warehouses(id INTEGER PRIMARY KEY, wname TEXT NOT NULL UNIQUE);'
          ) //执行sql语句

          // console.debug = true
          console.log('table created successfully')
        } catch (err) {
          console.log(err)
        }

        mystmtinsert =
          mystmtinsert ||
          mydbfile.getstmt('INSERT INTO checks (bar, qty) VALUES (?, ?)')
        mystmtdelete =
          mystmtdelete || mydbfile.getstmt('DELETE FROM checks WHERE bar = ?')
        mystmtupdate =
          mystmtupdate ||
          mydbfile.getstmt('UPDATE checks SET qty = ? WHERE bar = ?')
        mystmtselect =
          mystmtselect ||
          mydbfile.getstmt('SELECT qty FROM checks WHERE bar = ?')
        mystmtquery =
          mystmtquery || mydbfile.getstmt('SELECT bar, qty FROM checks')
        mystmtquerycnd =
          mystmtquerycnd ||
          mydbfile.getstmt('SELECT bar, qty FROM checks WHERE bar = ?')
        mystmtselectwh =
          mystmtselectwh || mydbfile.getstmt('SELECT wname FROM warehouses')
        mystmtinsertwh =
          mystmtinsertwh ||
          mydbfile.getstmt('INSERT INTO warehouses (wname) VALUES (?)')
        refcnt++
      }
    },

    insert: function(bar, qty) {
      //插入记录
      // console.log('-->> data.insert()')

      var amt = 0

      qty = (qty && parseInt(qty)) || 1

      // console.log('qty = ' + typeof (qty))

      mystmtselect.reset()
      mystmtselect.bind(1, bar)
      if (mystmtselect.step()) {
        //已有的条码
        mystmtupdate.reset()
        var oqty = mystmtselect.column(0)
        amt = qty + oqty
        // console.log(oqty)
        mystmtupdate.bind(1, amt)
        mystmtupdate.bind(2, bar)
        mystmtupdate.step()

        console.log(bar + ' +' + qty + ' = ' + amt + ' inserted')
        // console.log('typeof(qty+oqty) =' + typeof(qty + oqty))
      } else {
        //新的条码
        mystmtinsert.reset()
        mystmtinsert.bind(1, bar)
        mystmtinsert.bind(2, qty)
        mystmtinsert.step()

        amt = qty

        console.log(bar + ' ' + qty + ' inserted')
      }

      return amt
    },

    delete: function(bar) {
      //删除记录
      mystmtdelete.reset()
      mystmtdelete.bind(1, bar)
      mystmtdelete.step()

      console.log(bar + ' deleted')
    },

    query: function() {
      //查询记录
      // var result = ['6955489652940', '999']
      var result = []

      // console.debug = true
      console.log('---> query()')

      while (mystmtquery.step()) {
        var bar = mystmtquery.column(0)
        var qty = mystmtquery.column(1)
        result.push({ bar: bar.toString(), qty: qty.toString() })
      }

      return result
    },

    export: function(emmiter) {
      var expdir = this.EXP_DIR
      var expfile = this.EXP_FILE

      try {
        fs.exists(expdir, function(exists) {
          //建立导出文件夹
          // console.log(expdir + ':' + exists)
          !exists && fs.mkdir(expdir)
        })

        fs.open(expfile, 'w+', function(err, fd) {
          if (err) {
            console.log(err)
            throw err
          }

          while (mystmtquery.step()) {
            var bar = mystmtquery.column(0)
            var qty = mystmtquery.column(1)
            var cont = new Buffer(bar + ',' + qty + '\r\n')

            // console.log(cont.toString())

            fs.write(fd, cont, 0, cont.length, function(err, bytesRead) {
              if (err) {
                console.log(err)
                throw err
              }

              // console.log(bar + ',' + qty)
            })
          }

          fs.close(fd, function() {
            console.log('export()-->>')

            emmiter.emit('expdone')
          })
        })
      } catch (ex) {
        console.log(ex)
      }

      // fs.exists(this.EXP_DIR, function (exists) { //建立导出文件夹
      //     !exists && fs.mkdir(this.EXP_DIR)
      // })

      // fs.open(this.EXP_FILE, 'w+', function (err, fd) {
      //     if (err) {
      //         console.log(err)
      //         throw err
      //     }

      //     while (mystmtquery.step()) {
      //         var bar = mystmtquery.column(0)
      //         var qty = mystmtquery.column(1)
      //         var cont = new Buffer(bar + ',' + qty + '\r')

      //         // console.log(cont.toString())

      //         fs.write(fd, cont, 0, cont.length, function (err, bytesRead) {
      //             if (err) {
      //                 console.log(err)
      //                 throw err
      //             }

      //             // console.log(bar + ',' + qty)
      //         })
      //     }

      //     fs.close(fd, function () {
      //         console.log('export()-->>')

      //         emmiter.emit('expdone')
      //     })
      // })
    },

    getWarehouses: function() {
      var result = [
        // { wname: 'wname1' },
        // { wname: 'wname2' },
        // { wname: 'wname3' },
        // { wname: 'wname4' },
        // { wname: 'wname5' },
        // { wname: 'wname6' },
        // { wname: 'wname7' },
        // { wname: 'wname8' },
        // { wname: 'wname9' },
        // { wname: 'wname10' },
        // { wname: 'wname11' },
        // { wname: 'wname12' },
        // { wname: 'wname13' }
      ]

      while (mystmtselectwh.step()) {
        var wname = mystmtselectwh.column(0)
        result.push({ wname: wname })
      }

      return result
    },

    //新增一个仓库
    addWarehouse: function(wname) {
      try {
        mystmtinsertwh.reset()
        mystmtinsertwh.bind(1, wname)
        mystmtinsertwh.step()
      } catch (excep) {
        // console.log('增加仓库发生异常：' + excep)
        throw excep
      }
    },

    finalize: function() {
      //关闭数据库
      console.log('-->> data.finalize()')

      if (!refcnt) {
        mystmtinsert.finalize()
        mystmtdelete.finalize()
        mystmtupdate.finalize()
        mystmtselect.finalize()
        mystmtquery.finalize()
        mystmtselectwh.finalize()
        mystmtinsertwh.finalize()
        mydbfile.close()
        db.release()
      } else {
        refcnt--
      }
    }
  }

  // //     var my
  // // insert: function (bar) {

  // // db.initialize() //使用数据库之前必须先初始化

  // // var mydbfile = db.open('virgin.db')  //打开数据库文件
  // // try {
  // //     // mydbfile.exec('CREATE TABLE checks(id INTEGER AUTO_INCREMENT PRIMARY KEY, bar TEXT NOT NULL)') //执行sql语句
  // //     mydbfile.exec('CREATE TABLE checks(id INTEGER PRIMARY KEY, bar TEXT NOT NULL)') //执行sql语句

  // //     // console.debug = true
  // //     console.log('table created successfully')
  // // } catch (err) {

  // //     console.log(err)
  // // }

  // // var mystmt = mydbfile.getstmt("INSERT INTO checks (bar) VALUES (?)")
  // // mystmt.bind(1, 'bar3')
  // // mystmt.step()

  // // mystmt.reset()
  // // mystmt.bind(1, 'bar4')
  // // mystmt.step()

  // // mystmt.finalize()

  // // mydbfile.close()
  // // db.release()
}
