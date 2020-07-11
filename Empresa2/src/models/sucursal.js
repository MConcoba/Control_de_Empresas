'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var SucursalSchema = Schema({
    nombreEmpresa: String,
    direccion: String,
    productos:[{
        nombre: String, 
        cantidad: Number,
        precioUnitario: Number,
    }],
    empresa : {type: Schema.ObjectId, ref: 'empresa'},
    cantidad_Empleados: Number,
    
})

module.exports = mongoose.model('sucursal', SucursalSchema)