'use strict'

var express = require("express")
var EmpleadoController = require("../controllers/empleadosController")
var md_auth = require('../minddlewares/autentification')


var api = express.Router();

api.post('/nuevo-empleado/:id', md_auth.ensureAuth, EmpleadoController.agregarEmpleado)
api.put('/editar-empleado/:id', md_auth.ensureAuth, EmpleadoController.ediatarEmpleado)
api.get('/listar-empleados/:id', md_auth.ensureAuth, EmpleadoController.getEmpleados)
api.delete('/eliminar-empleado/:id', md_auth.ensureAuth, EmpleadoController.eliminarEmpleado)
api.get('/pdf/:id', md_auth.ensureAuth, EmpleadoController.crearPdf)
api.post('/busqueda-nombre/:id', EmpleadoController.buscarNombre)
api.post('/busqueda-puesto/:id', md_auth.ensureAuth, EmpleadoController.buscarPuesto)
api.post('/busqueda-departamento/:id', md_auth.ensureAuth, EmpleadoController.buscarDepartamento)
api.post('/busqueda-id/:id', md_auth.ensureAuth, EmpleadoController.buscarId)






module.exports = api