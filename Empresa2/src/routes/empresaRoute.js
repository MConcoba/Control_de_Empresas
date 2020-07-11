'use strict'

var express = require("express")
var EmpresaController = require("../controllers/empresaController")
var md_auth = require('../minddlewares/autentification')


var api = express.Router();

api.post('/nueva-empresa', EmpresaController.crearEmpresa)
api.post('/login', EmpresaController.login)
api.get('/listar-empresas', EmpresaController.getEmpresas)
api.put('/editar-empresa/:id', EmpresaController.editarEmpresa)
api.delete('/eliminar-empresa', md_auth.ensureAuth, EmpresaController.eliminarEmpresa)
api.delete('/eliminar-empleado-de-empresa', EmpresaController.eliminarEmpleado)
api.get('/pdf-todo/:id', EmpresaController.crearPdf)



module.exports = api