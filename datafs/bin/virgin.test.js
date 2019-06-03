module.exports = function () {

    var local = null;

    return {
        set: function (value) {
            local = value
        },
        get: function () {
            return local
        }
    }
    // console.debug = true
    // console.log('virgin.test.js')
    // return 'return from virgin.test.js'
}