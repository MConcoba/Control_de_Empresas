'use strict'

var Empresa = require('../models/empresa')
var Empleado = require('../models/empleado')
var Sucursal = require('../models/sucursal')
var jwt = require('../services/jwt')
var PDF = require('pdfkit')
var fs = require('fs')
var bcrypt = require('bcrypt-nodejs')



//CRUD
function crearEmpresa(req, res) {
    var empresa = new Empresa();
    var params = req.body
    
    if(params.nombreEmpresa && params.email && params.telefono && params.password){
        empresa.nombreEmpresa = params.nombreEmpresa
        empresa.email = params.email
        empresa.telefono = params.telefono
       

        Empresa.find({$or: [
            {nombreEmpresa: empresa.nombreEmpresa},
            {telefono: empresa.telefono},
            {email: empresa.email}
        ]
            
        }).exec((err, empresas)=>{
            if(err) return res.status(500).send({menssage: 'Error en la peticion de empresas'})
            if(empresas && empresas.length >= 1){
                return res.status(500).send({menssage: 'La empresa ya existe'})
            }else{
                bcrypt.hash(params.password, null, null, (err, hash)=>{
                    empresa.password = hash;
                
                empresa.save((err, empresaCreada)=>{
                    if(err) return res.status(500).send({menssage: 'Error al guardar el empresa'})
                    if(empresaCreada){
                        res.status(200).send({Empresa: empresaCreada})
                    }else{
                        res.status(404).send({menssage: 'No se ha podido crear la empresa'})
                    }
                })
            })

            }
                
        })
    }else{
        res.status(200).send({menssage: 'Rellene todos los datos necesarios'})
    }
}

function getEmpresas(req, res) {

    Empresa.find((err, listarEmpresas)=>{
        if (err) return res.status(500).send({menssage: 'Error en la peticion'})
        if (!listarEmpresas) return res.status(404).send({menssage: 'Error al mostrar empresas'})
        else return res.status(200).send({Empresas: listarEmpresas})  
    })  
}

function editarEmpresa(req, res) {
    var empresaId =  req.params.id;
    var params = req.body;

    Empresa.findByIdAndUpdate(empresaId, params,{new: true}, (err, empresaActualizada)=>{
        if(err) return res.status(500).send({menssage: 'Error en la particion'})
        if(!empresaActualizada) return res.status(404).send({menssage: 'No se a podido editar la empresa'})
        return res.status(200).send({Empresa: empresaActualizada})
    })
    
}

function eliminarEmpresa(req, res) {
    var empresaId = req.empresa.sub;
    
    Empresa.findByIdAndDelete(empresaId, (err, empresaEliminada)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
        Sucursal.find({empresa: empresaId}, (err, sucursalEliminada)=>{
            for (let x = 0; x < sucursalEliminada.length; x++) {
                Empleado.deleteMany({sucursal: sucursalEliminada[x]._id}, (err, empleadosEliminados)=>{
                    if(err) return res.status(500).send({menssage: 'Error en la peticion'})
                    Sucursal.deleteMany({empresa: empresaId}, (err, sucursalEliminada)=>{
                        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
                        else return res.status(200).send({Empresa_Eliminada: empresaEliminada})
                    })
                   
                })
            }
            
        })
    })
}


function eliminarEmpleado(req, res) {
    
    var empleadoId = req.params.empleado;
    var params = req.body

    Empresa.findOne(
        {nombreEmpresa: params.nombreEmpresa}
    ).exec((err, verEmpresa)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
        if(!verEmpresa){
            return res.status(404).send({menssage: 'Error'})
        }else{
    
            Empresa.findOneAndUpdate({nombreEmpresa: params.nombreEmpresa}, {$pull:{empleados: params.empleado}, 
            $dec: {cantidad_Empleados: 1}}, (err, empleadoElimindado)=>{
                if(err) return res.status(500).send({messsage: 'Error en la peticion de Empleado'})
                if(!empleadoElimindado) return res.status(404).send({messsage: 'Error al eliminar el empleado'})
            return res.status(200).send({messsage: 'Elminado'})
            })
        }
    })
}


function login(req, res) {
    var params = req.body

    Empresa.findOne({email: params.email}, (err, empresaLog)=>{
        if(err) return res.status(500).send({mensssage: 'Error en la peticion'})
        if(empresaLog){
            bcrypt.compare(params.password, empresaLog.password, (err, check)=>{
                if(check){
                    if(params.gettoken){
                        return res.status(200).send({
                            token: jwt.createToken(empresaLog)
                        })
                    }else{
                        empresaLog.password = undefined
                        return res.status(200).send({Empresa: empresaLog})
                    }
                }else{
                    return res.status(404).send({menssage: 'La Empresa no se logró identificar'})
                }
            })
        }else{
            return res.status(404).send({menssage: 'La Empresa no se a podido logear'})
        }
    })
}


function crearPdf(req, res){
    var params = req.body;
    var doc = new PDF();
    var empresaId = req.params.id
    
    Empresa.findById(empresaId).populate('empleados').exec((err, listarEmpresas)=>{
        if (err) return res.status(500).send({menssage: 'Error en la peticion'})
        if (!listarEmpresas) return res.status(404).send({menssage: 'Error al mostrar empleados' + err})
        else{
            Empleado.find({empresas: empresaId}).populate('empresas').exec((err, empleadoss)=>{
                if(err) return res.status(500).send({menssage: 'Error al agregar empreado'})
                if(!empleadoss) return res.status(404).send({menssage: 'Error al ralizar el cambio'})
                else{
            
                doc.pipe(fs.createWriteStream('./src/documents/' + params.nombreDoc + '.pdf'));

                doc
                    .fillColor('red')
                    .font('Times-Roman')
                    .fontSize(25)
                    .text('INFORMACION DE LA EMPRESA ' +  listarEmpresas.nombreEmpresa, {
                        align: 'center'
                    })
    
                doc
                    .fillColor('black')
                    .font('Times-Roman')
                    .fontSize(15)
                    .text('   ')
                    .text('Direccion de correo: ' + listarEmpresas.email)
                    .text('Telefono: ' + listarEmpresas.telefono)
                    .text('Empleados: ')
                    .text('     Nombre: ' + empleadoss.nombres)
                    .text('     Sexo: ' + empleadoss.sexo)
                    .text('     Departamento: ' + empleadoss.departamento)
                    .text('     Puesto: ' + empleadoss.puesto)
                      
                    .text('Cantidad de Empleados: ' + listarEmpresas.cantidad_Empleados)
                    
                
                doc.end();
    
                return res.status(200).send({menssage: 'PDF creado abrir: /' + params.nombreDoc + '.pdf/'})  
                }
            })
        } 
    })
}

module.exports ={
    crearEmpresa,
    login,
    getEmpresas,
    editarEmpresa,
    eliminarEmpresa,
    eliminarEmpleado,
    crearPdf
}