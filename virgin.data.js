//数据模块
var db = require('db')
var fs = require('fs')
var util = require('virgin.util.js')

var mydbfile = null

var m_instant = null
var m_refcnt = 0

module.exports = function () {
  console.debug = true
  console.log('-->> virgin.data.js')

  if (!m_instant) {
    m_instant = {
      EXP_DIR: '/datafs/virgin.export', //导出文件夹
      EXP_FILE: '/datafs/virgin.export/virgin.export.txt', //导出文件名

      mb_wid: null,

      initialize: function () {
        //初始化数据库

        db.initialize()

        mydbfile = mydbfile || db.open('/datafs/bin/virgin.db') //打开数据库文件
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

        m_instant++
      },

      getWarehouses: function () {
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

        // return result

        var stmt = mydbfile.getstmt('SELECT wname FROM warehouses')
        // var stmt = mydbfile.getstmt('SELECT bar FROM checks')

        try {
          while (stmt.step()) {
            var wname = stmt.column(0)
            result.push({ wname: wname })
          }
        } catch (excep) {
          throw excep
        } finally {
          stmt.finalize()
        }

        return result
      },

      //新增一个仓库
      addWarehouse: function (wname) {
        var stmt = mydbfile.getstmt('INSERT INTO warehouses (wname) VALUES (?)')
        try {
          stmt.bind(1, wname)
          stmt.step()
        } catch (excep) {
          // console.log('增加仓库发生异常：' + excep)
          throw excep
        } finally {
          stmt.finalize()
        }
      },

      getwid: function (wname) { //获取仓库ID
        var wid = this.mb_wid
        if (!wid) {
          var stmt = mydbfile.getstmt(
            'SELECT id FROM warehouses WHERE wname = ?'
          )

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

      //插入盘点记录
      insert: function (bar, qty, wname) {
        console.log('-->> data.insert()')

        var stmtselect = mydbfile.getstmt('SELECT qty FROM checks WHERE bar = ? AND wid = ?')
        // stmtselect.bind(1, '1')
        // stmtselect.bind(2, '1')

        var stmtupdate = mydbfile.getstmt('UPDATE checks SET qty = ? WHERE bar = ? AND wid = ?')

        var stmtinsert = mydbfile.getstmt('INSERT INTO checks (bar, qty, wid) VALUES (?, ?, ?)')

        try {
          var amt = 0

          qty = (qty && parseInt(qty)) || 1

          // console.log('qty = ' + typeof (qty))

          console.log('wname:' + wname)
          var wid = this.getwid(wname)

          console.log('wid:' + wid)

          // console.log('before stmtselect.bind()')

          stmtselect.bind(1, bar)

          // console.log('during stmtselect.bind()')

          stmtselect.bind(2, wid)

          // console.log('after stmtselect.bind()')

          if (stmtselect.step()) { //已有的条码
            var oqty = stmtselect.column(0)
            amt = qty + oqty
            console.log(oqty)
            stmtupdate.bind(1, amt)
            stmtupdate.bind(2, bar)
            stmtupdate.bind(3, wid)
            stmtupdate.step()

            console.log(bar + ' +' + qty + ' = ' + amt + ' inserted')
            // console.log('typeof(qty+oqty) =' + typeof(qty + oqty))
          } else { //新的条码
            console.log('new bar')
            stmtinsert.bind(1, bar)
            stmtinsert.bind(2, qty)
            stmtinsert.bind(3, wid)
            stmtinsert.step()

            amt = qty

            console.log(bar + ' ' + qty + ' inserted')
          }

          return amt
        } catch (excep) {
          throw excep
        } finally {
          stmtselect.finalize()
          stmtupdate.finalize()
          stmtinsert.finalize()
        }
      },

      query: function (wname) { //查询记录
        var result = []

        var stmtchecks = mydbfile.getstmt('SELECT bar, qty FROM checks WHERE wid = ?')
        try {
          var wid = this.getwid(wname)
          stmtchecks.bind(1, wid)

          // console.log('query():' + wid)

          while (stmtchecks.step()) {
            var bar = stmtchecks.column(0)
            var qty = stmtchecks.column(1)
            result.push({ bar: bar.toString(), qty: qty.toString() })
          }

          return result
        }
        catch (excep) {
          throw excep
        }
        finally {
          stmtchecks.finalize()
        }

        try {
          // // console.log('---> query()')
          // console.log('query():' + wname)
          // console.log('query():' + wid)
          // stmtchecks.bind(1, wid)
          // stmtchecks.step()

          // // console.debug = true
          // // console.log('---> query()')

          // var wid = this.getwid(wname)
          // stmtchecks.bind(1, wid)
          while (stmtchecks.step()) {
            var bar = stmtchecks.column(0)
            var qty = stmtchecks.column(1)
            result.push({ bar: bar.toString(), qty: qty.toString() })
          }
        }
        catch (excep) {
          throw excep
        }
        finally {
          stmtchecks.finalize()
        }

        return result
      },

      export: function () {
        console.log('-->> export()')

        var promise = new util.Promise()

        var expdir = this.EXP_DIR
        var expfile = this.EXP_FILE

        console.log('export() 1')

        try {
          if (!fs.existsSync(expdir)) {
            fs.mkdir(expdir)
          }

          console.log('export() 2')

          fs.open(expfile, 'w+', function (err, fd) {
            if (err) {
              console.log(err)
              throw err
            }

            console.log('export() 3')

            console.log(mydbfile)

            var stmt = mydbfile.getstmt(
              'SELECT a.wname, b.bar, b.qty FROM warehouses a INNER JOIN checks b ON a.id = b.wid  ORDER BY  a.id'
            )

            // var stmt = mydbfile.getstmt('SELECT id, bar, qty FROM checks')

            console.log('export() 4')

            // // console.log('after getstmt()')

            while (stmt.step()) {
              var wname = stmt.column(0)
              var bar = stmt.column(1)
              var qty = stmt.column(2)
              // var qty = stmt.column(2)
              var cont = new Buffer(wname + ',' + bar + ',' + qty + '\r\n')
              fs.write(fd, cont, 0, cont.length, function (err, bytesRead) {
                if (err) {
                  console.log(err)
                  throw err
                }

                // console.log(bar + ',' + qty)
              })
            }
            stmt.finalize()

            console.log('export() 5')

            fs.close(fd, function (err) {
              console.log('export()-->>')
              // util.enumlog(promise)
              // console.log(promise)
              promise.thencb(expfile)
              // emmiter.emit('expdone')
            })

            console.log('export() 6')

            util.enumlog(promise)

            // return promise //这处于 fs.open() 里，并不是立即返回，所以上层得不到 promise，一个大坑！！！
          })

          return promise //这里就对了，可以立即返回
        } catch (ex) {
          console.log(ex)
        }
      },

      finalize: function () { //关闭数据库
        console.log('-->> data.finalize()')
        m_refcnt--
        if (m_refcnt == 0) {
          mydbfile.close()
          db.release()
        }
      }
    }
  }

  return m_instant
}
