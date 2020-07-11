'user strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var EmpleadoSchema = Schema({
    nombres: String,
    sexo: String,
    departamento: String,
    puesto: String,
    salario: Number,
    sucursal: {type: Schema.ObjectId, ref: 'sucursal'}
})

module.exports = mongoose.model('empleado', EmpleadoSchema)