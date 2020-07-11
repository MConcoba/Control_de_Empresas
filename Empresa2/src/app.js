'use strict'

const express = require("express")
const app = express()
const bodyparser = require("body-parser")

var empleado_routes = require("./routes/empledosRoute")
var empresa_routes = require("./routes/empresaRoute")
var sucursal_routes = require("./routes/sucursalRoute")
var producto_routes = require("./routes/productosRoute")


app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Authoruzation, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
    res.header('Access-Control-Allow-Methods', 'SET, POST, OPTIONS, PUT DELETE')
    res.header('Allow', 'SET, POST, OPTIONS, PUT, DELETE')

    next();

})

app.use('/api', empleado_routes, empresa_routes, sucursal_routes, producto_routes)

module.exports = app;