'use strict'

var express = require("express")
var ProductoController = require("../controllers/productosController")
var md_auth = require('../minddlewares/autentification')


var api = express.Router();


api.post('/agregar-producto', md_auth.ensureAuth, ProductoController.crearProducto)
api.post('/distribuir-producto/:id', md_auth.ensureAuth, ProductoController.distribuirProducto)
api.post('/getProductos', md_auth.ensureAuth, ProductoController.getProducto)
api.post('/editar-nombre-producto', md_auth.ensureAuth, ProductoController.editarNombreProducto)
api.get('/productos-sucursal/:id', md_auth.ensureAuth, ProductoController.productosSucursal)
api.post('/stok-empresa', md_auth.ensureAuth, ProductoController.stockEmpresa)
api.post('/nombre-producto-empresa', md_auth.ensureAuth, ProductoController.nombreProductoEmpresa)
api.post('/nombre-producto-sucursal/:id', md_auth.ensureAuth, ProductoController.nombreProductoSucursal)
api.get('/reporte/:id', md_auth.ensureAuth, ProductoController.documento)


module.exports = api