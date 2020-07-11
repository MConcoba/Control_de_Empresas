'user strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;


var EmpresaSchema = Schema({
    nombreEmpresa: String,
    telefono: Number,
    email: String,
    password: String,
    productos:[{
        nombre: String, 
        cantidad: Number,
        precioUnitario: Number,
    }],
    cantidad_Empleados: Number,
    cantidad_Sucursales: Number

    
})


module.exports = mongoose.model('empresa', EmpresaSchema)