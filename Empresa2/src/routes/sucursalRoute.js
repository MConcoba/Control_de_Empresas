'use strcit'


var express = require("express")
var SucursalController = require("../controllers/sucursalesController")
var md_auth = require('../minddlewares/autentification')


var api = express.Router();

api.post('/nueva-sucursal', md_auth.ensureAuth, SucursalController.crearSucursal)
api.put('/editar-sucursal/:id', md_auth.ensureAuth, SucursalController.editarSucursal)
api.delete('/eliminar-sucursal/:id', md_auth.ensureAuth, SucursalController.eliminarSucursal)
api.get('/empresa-sucursales', md_auth.ensureAuth, SucursalController.listarSucursales)


module.exports = api;