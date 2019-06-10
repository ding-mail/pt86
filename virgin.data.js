//数据模块
var db = require('db')

module.exports = function () {

    console.debug = true
    console.log('-->> virgin.data.js')

    var mydbfile = null
    var mystmtinsert = null
    var mystmtdelete = null
    var mystmtupdate = null
    var mystmtselect = null

    return {
        initialize: function () { //初始化数据库
            db.initialize()

            mydbfile = mydbfile || db.open('virgin.db')  //打开数据库文件
            try {
                // mydbfile.exec('CREATE TABLE checks(id INTEGER AUTO_INCREMENT PRIMARY KEY, bar TEXT NOT NULL)') //执行sql语句
                mydbfile.exec('CREATE TABLE checks(id INTEGER PRIMARY KEY, bar TEXT NOT NULL, qty INTEGER NOT NULL)') //执行sql语句

                // console.debug = true
                console.log('table created successfully')
            } catch (err) {
                console.log(err)
            }

            mystmtinsert = mystmtinsert || mydbfile.getstmt('INSERT INTO checks (bar, qty) VALUES (?, ?)')
            mystmtdelete = mystmtdelete || mydbfile.getstmt('DELETE FROM checks WHERE bar = ?')
            mystmtupdate = mystmtupdate || mydbfile.getstmt('UPDATE checks SET qty = ? WHERE bar = ?')
            mystmtselect = mystmtselect || mydbfile.getstmt('SELECT qty FROM checks WHERE bar = ?')
        },

        insert: function (bar, qty) { //插入记录
            // console.log('-->> data.insert()')

            qty = qty && parseInt(qty) || 1

            // console.log('qty = ' + typeof (qty))

            mystmtselect.reset()
            mystmtselect.bind(1, bar)
            if (mystmtselect.step()) { //已有的条码
                mystmtupdate.reset()
                var oqty = mystmtselect.column(0)
                // console.log(oqty)
                mystmtupdate.bind(1, qty + oqty)
                mystmtupdate.bind(2, bar)
                mystmtupdate.step()

                console.log(bar + ' +' + qty + ' = ' + (qty + oqty) + ' inserted')
                // console.log('typeof(qty+oqty) =' + typeof(qty + oqty))
            }
            else { //新的条码
                mystmtinsert.reset()
                mystmtinsert.bind(1, bar)
                mystmtinsert.bind(2, qty)
                mystmtinsert.step()

                console.log(bar + ' ' + qty + ' inserted')
            }
        },

        delete: function (bar) { //删除记录
            mystmtdelete.reset()
            mystmtdelete.bind(1, bar)
            mystmtdelete.step()

            console.log(bar + ' deleted')
        },

        finalize: function () { //关闭数据库
            console.log('-->> data.finalize()')
            mystmtinsert.finalize()
            mystmtdelete.finalize()
            mystmtupdate.finalize()
            mystmtselect.finalize()
            mydbfile.close()
            db.release()
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
