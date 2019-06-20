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

// var mb_wid = null //换成 mb_wid 来代替，避免多个 Data() 实例共用这个变量

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

    mb_wid: null,

    initialize: function() {
      //初始化数据库

      if (!refcnt) {
        db.initialize()

        mydbfile = mydbfile || db.open('virgin.db') //打开数据库文件
        try {
          // mydbfile.exec('CREATE TABLE checks(id INTEGER AUTO_INCREMENT PRIMARY KEY, bar TEXT NOT NULL)') //执行sql语句
          mydbfile.exec(
            'CREATE TABLE checks(id INTEGER PRIMARY KEY, bar TEXT NOT NULL, qty INTEGER NOT NULL, wid INTEGER NOT NULL);' +
              'CREATE TABLE warehouses(id INTEGER PRIMARY KEY, wname TEXT NOT NULL UNIQUE);'
          ) //执行sql语句

          // console.debug = true
          console.log('table created successfully')
        } catch (err) {
          console.log(err)
        }

        mystmtinsert =
          mystmtinsert ||
          mydbfile.getstmt(
            'INSERT INTO checks (bar, qty, wid) VALUES (?, ?, ?)'
          )
        mystmtdelete =
          mystmtdelete ||
          mydbfile.getstmt('DELETE FROM checks WHERE bar = ? AND wid = ?')
        mystmtupdate =
          mystmtupdate ||
          mydbfile.getstmt(
            'UPDATE checks SET qty = ? WHERE bar = ? AND wid = ?'
          )
        mystmtselect =
          mystmtselect ||
          mydbfile.getstmt('SELECT qty FROM checks WHERE bar = ? AND wid = ?')
        mystmtquery =
          mystmtquery ||
          mydbfile.getstmt('SELECT bar, qty FROM checks WHERE wid = ?')
        mystmtquerycnd =
          mystmtquerycnd ||
          mydbfile.getstmt(
            'SELECT bar, qty FROM checks WHERE bar = ? AND wid = ?'
          )
        mystmtselectwh =
          mystmtselectwh || mydbfile.getstmt('SELECT wname FROM warehouses')
        mystmtinsertwh =
          mystmtinsertwh ||
          mydbfile.getstmt('INSERT INTO warehouses (wname) VALUES (?)')
        refcnt++
      }
    },

    getwid: function(wname) {
      var wid = this.mb_wid
      if (!wid) {
        var stmt = mydbfile.getstmt('SELECT id FROM warehouses WHERE wname = ?')

        try {
          stmt.bind(1, wname)
          if (stmt.step()) {
            wid = stmt.column(0)
          } else {
            throw new Error(
              'getwid()异常，可能是没有找到仓库名，也可能是其他问题'
            )
          }
        } catch (excep) {
          throw excep
        } finally {
          stmt.finalize()
        }
      }

      this.mb_wid = wid
      return wid
    },

    // //mb_wid 是模块变量，多个Data()的 m_id 会互相干扰，所以加上这个方法来清除干扰。但这种模块变量好像不太适合这样用，最好用一种跟实例相关的变量来实现。
    // resetwid: function() {
    //   mb_wid = null
    // },

    insert: function(bar, qty, wname) {
      //插入记录
      // console.log('-->> data.insert()')

      var amt = 0

      qty = (qty && parseInt(qty)) || 1

      // console.log('qty = ' + typeof (qty))

      console.log('wname:' + wname)
      var wid = this.getwid(wname)

      // console.log('wid:' + wid)

      mystmtselect.reset()
      mystmtselect.bind(1, bar)
      mystmtselect.bind(2, wid)
      if (mystmtselect.step()) {
        //已有的条码
        mystmtupdate.reset()
        var oqty = mystmtselect.column(0)
        amt = qty + oqty
        // console.log(oqty)
        mystmtupdate.bind(1, amt)
        mystmtupdate.bind(2, bar)
        mystmtupdate.bind(3, wid)
        mystmtupdate.step()

        console.log(bar + ' +' + qty + ' = ' + amt + ' inserted')
        // console.log('typeof(qty+oqty) =' + typeof(qty + oqty))
      } else {
        //新的条码
        mystmtinsert.reset()
        mystmtinsert.bind(1, bar)
        mystmtinsert.bind(2, qty)
        mystmtinsert.bind(3, wid)
        mystmtinsert.step()

        amt = qty

        console.log(bar + ' ' + qty + ' inserted')
      }

      return amt
    },

    delete: function(bar, wname) {
      //删除记录
      var wid = getwid(wname)

      mystmtdelete.reset()
      mystmtdelete.bind(1, bar)
      mystmtdelete.bin(2, wid)
      mystmtdelete.step()

      console.log(bar + ' deleted')
    },

    query: function(wname) {
      //查询记录
      var result = []

      // console.log('---> query()')
      console.log('query():' + wname)
      var wid = this.getwid(wname)
      console.log('query():' + wid)

      // console.debug = true
      // console.log('---> query()')

      mystmtquery.reset()
      mystmtquery.bind(1, wid)
      while (mystmtquery.step()) {
        var bar = mystmtquery.column(0)
        var qty = mystmtquery.column(1)
        result.push({ bar: bar.toString(), qty: qty.toString() })
      }

      return result
    },

    export: function(emmiter) {
      console.log('-->> export()')

      var expdir = this.EXP_DIR
      var expfile = this.EXP_FILE

      console.log('export() 1')

      try {
        fs.exists(expdir, function(exists) {
          //建立导出文件夹
          // console.log(expdir + ':' + exists)
          !exists && fs.mkdir(expdir)
        })

        console.log('export() 2')

        fs.open(expfile, 'w+', function(err, fd) {
          if (err) {
            console.log(err)
            throw err
          }

          console.log('export() 3')

          var stmt = mydbfile.getstmt(
            'SELECT a.wname, b.bar, b.qty FROM warehouses a INNER JOIN checks b ON a.id = b.wid  ORDER BY  a.id'
          )

          // console.log('after getstmt()')

          while (stmt.step()) {
            var wname = stmt.column(0)
            var bar = stmt.column(1)
            var qty = stmt.column(2)

            var cont = new Buffer(wname + ',' + bar + ',' + qty + '\r\n')

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
}
