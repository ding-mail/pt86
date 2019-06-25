//工具库

module.exports = {
  Promise: function() {
    // this.then = function() {}
    // this.catch = function() {}

    this.a = 'a'
    this.b = 'b'

    this.then = function(cb) {
      console.log('set then()')
      this.thencb = cb
      return this
    }
    this.catch = function(cb) {
      console.log('set catch()')
      this.catchcb = cb
      return this
    }
  },

  enumlog: function(obj) {
    console.debug = true
    console.log('-->>enumlog()')
    for (var k in obj) {
      console.log(k + ' : {' + obj[k] + '}')
    }
  }
}