//数据模块
var db = require('db')

var refcnt = 0 //本模块的引用次数
var mdbfile = null //本模块的数据库文件对象

var mydbfile = null
var mystmtinsert = null
var mystmtdelete = null
var mystmtupdate = null
var mystmtselect = null
var mystmtquery = null
var mystmtquerycnd = null

module.exports = function () {

    console.debug = true
    console.log('-->> virgin.data.js')

    // var mydbfile = null
    // var mystmtinsert = null
    // var mystmtdelete = null
    // var mystmtupdate = null
    // var mystmtselect = null
    // var mystmtquery = null

    return {
        initialize: function () { //初始化数据库

            if (!refcnt) {

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
                mystmtquery = mystmtquery || mydbfile.getstmt('SELECT bar, qty FROM checks')
                mystmtquerycnd = mystmtquerycnd || mydbfile.getstmt('SELECT bar, qty FROM checks WHERE bar = ?')

                refcnt++
            }
        },

        insert: function (bar, qty) { //插入记录
            // console.log('-->> data.insert()')

            var amt = 0

            qty = qty && parseInt(qty) || 1

            // console.log('qty = ' + typeof (qty))

            mystmtselect.reset()
            mystmtselect.bind(1, bar)
            if (mystmtselect.step()) { //已有的条码
                mystmtupdate.reset()
                var oqty = mystmtselect.column(0)
                amt = qty + oqty
                // console.log(oqty)
                mystmtupdate.bind(1, amt)
                mystmtupdate.bind(2, bar)
                mystmtupdate.step()

                console.log(bar + ' +' + qty + ' = ' + amt + ' inserted')
                // console.log('typeof(qty+oqty) =' + typeof(qty + oqty))
            }
            else { //新的条码
                mystmtinsert.reset()
                mystmtinsert.bind(1, bar)
                mystmtinsert.bind(2, qty)
                mystmtinsert.step()

                amt = qty

                console.log(bar + ' ' + qty + ' inserted')
            }

            return amt
        },

        delete: function (bar) { //删除记录
            mystmtdelete.reset()
            mystmtdelete.bind(1, bar)
            mystmtdelete.step()

            console.log(bar + ' deleted')
        },

        query: function () { //查询记录
            // var result = ['6955489652940', '999']
            var result = []

            console.debug = true
            console.log('---> query()')


            while (mystmtquery.step()) {
                var bar = mystmtquery.column(0)
                var qty = mystmtquery.column(1)
                result.push({ 'bar': bar.toString(), 'qty': qty.toString() })
            }

            return result
        },

        getQty: function (bar) {
            var result = 0

            mystmtquerycnd.reset()
            mystmtquerycnd.bind(1, bar)
            if (mystmtquerycnd.step()) {
                result = mystmtquerycnd.column(1)
            }

            return result
        },

        finalize: function () { //关闭数据库
            console.log('-->> data.finalize()')

            if (!refcnt) {
                mystmtinsert.finalize()
                mystmtdelete.finalize()
                mystmtupdate.finalize()
                mystmtselect.finalize()
                mystmtquery.finalize()
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
