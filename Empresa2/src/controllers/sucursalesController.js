'use strict'


var Sucursal = require('../models/sucursal')
var Empresa = require('../models/empresa')
var Empleado = require('../models/empleado')
var PDF = require('pdfkit')
var fs = require('fs')


function crearSucursal(req, res) {
    var sucursal = new Sucursal();
    var params = req.body

    if(params.direccion){
        sucursal.direccion = params.direccion
        sucursal.empresa = req.empresa.sub
    
    
        Sucursal.find({$or: [
            {direccion: sucursal.direccion}
        ]})
    
        .exec((err, sucursales)=>{
            if(err) return res.status(500).send({menssage: 'Error en la peticion'})
            if(sucursales && sucursales.length >=1){
                return res.status(500).send({menssage: 'La sucursal ya existe'})
            }else{
                sucursal.save((err, sucursalGuardada)=>{
                    if(err) return res.status(500).send({menssage: 'Error al guardar el empleado'})
                    if(!sucursalGuardada){
                        res.status(404).send({menssage: 'No se ha podido guardar la sucursal'})
                    }else{
                    Empresa.findById(req.empresa.sub, (err, empresaActual)=>{
                        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
                        Sucursal.findByIdAndUpdate({_id : sucursalGuardada._id}, {$push: {nombreEmpresa: empresaActual.nombreEmpresa}}, {new: true}, (err, sucursalActualizada)=>{
                            if(err) return res.status(500).send({menssage: 'Error en la peticion' + err})
                            if(!sucursalActualizada) return res.status(404).send({menssage: 'Error al agregar empleado'})  
                                   return res.status(200).send({Sucursales: sucursalActualizada})
                        })
                    })
                    
                    Empresa.findByIdAndUpdate(req.empresa.sub,  {$inc: {cantidad_Sucursales: 1}},
                        {new : true}, (err, sucursalAgregada)=>{
                                if(err) return res.status(500).send({menssage: 'Error en la peticion' + err})
                                if(!sucursalAgregada) return res.status(404).send({menssage: 'Error al agregar empleado ' + err})  
                                
                        })
                    }
                })
            }
        })
    }else{
        return res.status(200).send({menssage: 'Rellene todos los datos necesarios'})
    }
}


function editarSucursal(req, res){
    var sucursalId =  req.params.id;
    var params = req.body;

    Sucursal.findByIdAndUpdate(sucursalId, params, {new: true}, (err, sucursalActualizada)=>{
        if(err) return res.status(500).send({menssage: 'Error en la particion'})
        if(!sucursalActualizada) return res.status(404).send({menssage: 'No se a podido editar la sucursal ' + err})
        return res.status(200).send({Sucursal: sucursalActualizada})
    })
}


function eliminarSucursal(req, res){
    var sucursalId = req.params.id;
    
    Sucursal.findByIdAndDelete(sucursalId, (err, sucursalEliminada)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
        else{
            Empleado.deleteMany({sucursal: sucursalId}, (err, empleadosEliminados)=>{
                if(err) return res.status(500).send({menssage: 'Error en la peticion'})
                else return res.status(200).send({Sucursal_Eliminada: sucursalEliminada })
            })
        }
        
    })
}

function listarSucursales(req, res) {
    var empresaLog = req.empresa.sub;

    Sucursal.find({empresa: empresaLog}, (err, listaSucursales)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion de sucursale'})
        if(!listaSucursales) return res.status(404).send({menssage: 'Error al listar las sucursales'})
        return res.status(202).send({Empresa_Sucursales: listaSucursales})
    })
}

module.exports = {
    crearSucursal,
    editarSucursal,
    eliminarSucursal,
    listarSucursales
}