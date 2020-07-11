'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'encryp_password'

exports.createToken = function(empresa){
    var playload = {
        sub: empresa._id,
        nombreEmpresa: empresa.nombreEmpresa,
        telefono: empresa.telefono,
        email: empresa.email,
        iat: moment().unix(),
        exp: moment().day(30, 'days').unix()
    }
    return jwt.encode(playload, secret)
}