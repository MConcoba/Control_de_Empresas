'use stricit'

var Empresa = require('../models/empresa')
var Sucursal = require('../models/sucursal')
var xlsx = require('xlsx')
var excel = require('excel4node')
var fs = require('fs')
const { Parser } = require('json2csv');

function crearProducto(req, res) {
    var empresaLog = req.empresa.sub
    var params = req.body
    var empresa = Empresa();
    
        if(params.nombre && params.cantidad && params.precioUnitario){
            Empresa.find({_id: empresaLog, "productos.nombre" : params.nombre}, (err, verProducto)=>{
                if(err) return res.status(500).send({messsage: 'Error en la peticion de procutos ' + err})
                if(verProducto && verProducto.length >= 1){
                    Empresa.findOneAndUpdate({_id: empresaLog, "productos.nombre" : params.nombre}, {$inc: {'productos.$.cantidad' : params.cantidad}}, {new : true}, (err, empresaActualizada)=>{
                        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
                        if(!empresaActualizada) return res.status(404).send({menssage: 'Error al modificar el producto'})
                        return res.status(200).send({Empresa_Producto: empresaActualizada.productos})
                    })
                }else{
                    Empresa.findOneAndUpdate({_id: empresaLog}, {$push: {productos: {nombre: params.nombre, 
                        cantidad: params.cantidad, precioUnitario: params.precioUnitario}}},
                        {new: true}, (err, empresaActualizada)=>{
                            if(err) return res.status(500).send({menssage: 'Error en la peticion'})
                            if(!empresaActualizada){
                                return res.status(404).send({menssage: 'Error al agegar el Producto ' + err})
                            }else{
                                return res.status(202).send({Empresa_Productos: empresaActualizada.productos})
                            }
                    })
                }
                
            })
                
        }else{
            return res.status(200).send({menssage: 'Rellene todos los campos'})
        }  
}

function distribuirProducto(req, res){
    var sucursalId =  req.params.id;
    var empresaLog = req.empresa.sub
    var params = req.body
   
    var productoSelec;

    
        if(params.cantidad, params.nombre){
            var newCantidad = params.cantidad * (-1)
        Empresa.findOne({_id: empresaLog, "productos.nombre" : params.nombre}, (err, verProducto)=>{
            if(err) return res.status(500).send({messsage: 'Error en la peticion de procutos ' + err})
            if(!verProducto){
                return res.status(404).send({menssage: 'Error al listar producto'})
            }else{
                for (let x = 0; x < verProducto.productos.length; x++) {
                    if(verProducto.productos[x].nombre == params.nombre){
                        productoSelec = verProducto.productos[x]
                        if(productoSelec.cantidad >= params.cantidad){
                            Sucursal.find({_id: sucursalId, "productos.nombre" : params.nombre}, (err, verProductoS)=>{
                                if(err) return res.status(500).send({messsage: 'Error en la peticion de procutos ' + err})
                                if(verProductoS && verProductoS.length >= 1){
                                    
                                    Sucursal.findOneAndUpdate({_id: sucursalId, "productos.nombre" : params.nombre},
                                        {$inc: {'productos.$.cantidad' : params.cantidad}}, {new : true}, (err, sucursalActualizada)=>{
                                    if(err) return res.status(500).send({menssage: 'Error en la peticion'})
                                    if(!sucursalActualizada) return res.status(404).send({menssage: 'Error al modificar el producto'})
                                    
                                    Empresa.findOneAndUpdate({_id: empresaLog, "productos.nombre" : params.nombre}, {$inc: {'productos.$.cantidad' : newCantidad}}, 
                                            {new : true}, (err, empresaActualizada)=>{
                                        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
                                        if(!empresaActualizada) return res.status(404).send({menssage: 'Error al modificar el producto'})
                                        return res.status(200).send({Sucursal_Producto: sucursalActualizada.productos})
                                
                                            
                                        
                                    })
                                })
                                }else{

                                    Sucursal.findOneAndUpdate({_id: sucursalId}, {$push: {productos: {nombre: params.nombre, cantidad: params.cantidad,
                                        precioUnitario: productoSelec.precioUnitario}}}, {new : true}, (err, sucursalActualizada)=>{
                                    if(err) return res.status(500).send({menssage: 'Error en la peticion'})
                                    if(!sucursalActualizada) return res.status(404).send({menssage: 'Error al agregar producto ' + err})

                                    Empresa.findOneAndUpdate({_id: empresaLog, "productos.nombre" : params.nombre}, {$inc: {'productos.$.cantidad' : newCantidad}}, 
                                    {new : true}, (err, empresaActualizada)=>{
                                    if(err) return res.status(500).send({menssage: 'Error en la peticion'})
                                    if(!empresaActualizada) return res.status(404).send({menssage: 'Error al modificar el producto'})
                                        return res.status(200).send({Sucursal_Producto: sucursalActualizada.productos})
                                
                                    })
                                       
                                    })
                                }
                            })
                        }else{
                            return res.status(500).send({menssage: 'Actualmente cuenta con ' + productoSelec.cantidad + ' ' + productoSelec.nombre})
                    }   
                }   
            }
        }
        })
    }
}


function editarNombreProducto(req, res){
    var empresaLog = req.empresa.sub
    var params = req.body


    Empresa.findOneAndUpdate({_id: empresaLog, "productos.nombre" : params.nombre}, {"productos.$.nombre": params.newNombre}, (err, empresaActualizada)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion de empresa'})
        if(!empresaActualizada) return res.status(404).send({menssage: 'Error en al editar producto de la empresa'})

         Sucursal.updateMany({empresa: empresaLog, "productos.nombre" : params.nombre}, {"productos.$.nombre" : params.newNombre}, (err, sucursalActualizada)=>{
            if(err) return res.status(500).send({menssage: 'Error en la peticion de sucursal'})
            if(!empresaActualizada) return res.status(404).send({menssage: 'Error en al editar producto de la sucusal'})
        
        Empresa.findOne({_id: empresaLog, "productos.nombre" : params.newNombre}, (err, productoActualizado)=>{
            if(err) return res.status(500).send({menssage: 'Error en la peticion de producotos'})
            if(!productoActualizado) return res.status(404).send({menssage: 'Error en al editar producto'})
            return res.status(200).send({Producto_Actualizado: productoActualizado.productos})
        })
            
        })     
    })
}

function productosSucursal(req, res){
    var params = req.body
    var sucursalId = req.params.id

    Sucursal.findOne({_id: sucursalId}, (err, productoSucursal)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion de producto'})
        if(!productoSucursal) return res.status(404).send({menssage: 'Error al listar el producto'})
        return res.status(200).send({Producto_Sucursal: productoSucursal.productos})
    })


}

function stockEmpresa(req, res) {
    var empresaLog = req.empresa.sub
    var params = req.body

    Empresa.findOne({_id: empresaLog}, {"productos.nombre" : 1, "productos.cantidad" : 1, "productos.precioUnitario" : 1}, (err, empresaStok)=>{
        if(err) return res.status(500).send({menssage: 'Error en la busqueda'})
        if(!empresaStok) return res.status(404).send({menssage: 'Error al buscar la cantida'})
        return res.status(200).send({Producto_Empresa: empresaStok})
    })
}

function stockSucursal(req, res) {
    var sucursalId = req.params.id
    var params = req.body

    Sucursal.findOne({_id: sucursalId}, {"productos.nombre" : 1, "productos.cantidad" : 1, "productos.precioUnitario" : 1}, (err, sucuralStok)=>{
        if(err) return res.status(500).send({menssage: 'Error en la busqueda'})
        if(!sucuralStok) return res.status(404).send({menssage: 'Error al buscar la cantida'})
        return res.status(200).send({Producto_Empresa: sucuralStok})
    })
}


function nombreProductoEmpresa(req, res) {
    var empresaLog = req.empresa.sub
    var params = req.body;

    
    /*Empresa.find({ productos: { $elemMatch: { nombre: "huevos" } } }, {"productos.nombre" : 1 , 
        "productos.cantidad" : 1, "productos.precioUnitario" : 1}, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
        if(!productoEncontrado) return res.status(404).send({menssage: 'Error al mostrar productos ' + err})
        else return res.status(200).send({Producto: productoEncontrado})
    })*/
   

    Empresa.findOne({_id: empresaLog}, (err, verProducto)=>{
        if(err) return res.status(500).send({messsage: 'Error en la peticion de procutos ' + err})
        if(!verProducto) return res.status(404).send({messsage: 'Error al listar productos ' + err})
        for (let x = 0; x < verProducto.productos.length; x++) {
            if(verProducto.productos[x].nombre == params.nombre){
            return res.status(200).send({Producto: verProducto.productos[x]}) 
            }   
        }
        
    })

}


function nombreProductoSucursal(req, res) {
    var sucursalId = req.params.id
    var params = req.body

    Sucursal.findOne({_id: sucursalId}, (err, verProducto)=>{
        if(err) return res.status(500).send({messsage: 'Error en la peticion de procutos ' + err})
        if(!verProducto) return res.status(404).send({messsage: 'Error al listar productos ' + err})
       
        for (let x = 0; x < verProducto.productos.length; x++) {

            console.log(verProducto.productos.length)
            if(verProducto.productos[x].nombre == params.nombre){
            
                return res.status(200).send({Producto: verProducto.productos[x]}) 
            }
        }
        
    })

}

function getProducto(req, res) {
    var empresaLog = req.empresa.sub;
    var params = req.body

    Empresa.findOne({_id: empresaLog}, (err, verProducto)=>{
        if(err) return res.status(500).send({messsage: 'Error en la peticion de procutos ' + err})
        if(!verProducto) return res.status(404).send({messsage: 'Error al listar productos ' + err})
        for (let x = 0; x < verProducto.productos.length; x++) {
            if(verProducto.productos[x]._id == params.id){
            return res.status(200).send({Producto: verProducto.productos[x]})
            }   
            
        }
        
    })
}

function documento(req, res) {
    var params = req.body
    var sucursalId = req.params.id
    var empresaLog = req.empresa.sub

    Sucursal.findOne({_id: sucursalId}, {"productos.nombre" : 1, "productos.cantidad" : 1, "productos.precioUnitario": 1}, 
        (err, productosSucursal)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion de suculsal'})
        if(!productosSucursal){
            return res.status(404).send({menssage: 'Error al listar productos'})
        }else{

           
               

            const fields = ['nombre', 'cantidad', 'precioUnitario' ];            
            const info = productosSucursal.productos
            const json2csvParser = new Parser({ fields, delimiter: '\t'});
            const csv =  json2csvParser.parse(info);
            
            
              
              

           fs.appendFile( './src/documents/' + req.body.nombre + '.xls', csv, (err) => {
            if (err) return res.status(500).send({menssage: 'Error al crear el reporte'})
            
         });

             return res.status(200).send({menssage: productosSucursal.productos})        }

       
        
    })
}

module.exports ={
    crearProducto,
    distribuirProducto,
    productosSucursal,
    getProducto,
    stockEmpresa,
    stockSucursal,
    nombreProductoEmpresa,
    nombreProductoSucursal,
    editarNombreProducto,
    documento
}