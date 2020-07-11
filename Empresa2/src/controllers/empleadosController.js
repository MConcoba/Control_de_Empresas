'use strict'


var Empleado = require('../models/empleado')
var Empresa = require('../models/empresa')
var Sucursal = require('../models/sucursal')
var PDF = require('pdfkit')
var fs = require('fs')




//CRUD:

function agregarEmpleado(req, res) {
    var empleado = new Empleado();
    var params = req.body;
    var empresaId = req.empresa.sub
    var sucursalId = req.params.id

    Sucursal.findById(sucursalId, (err, sucursales)=>{
        if(err) return res.status(500).send({menssage: 'Error en la petición de Empleados'})
        if(!sucursales) return res.status(404).send({menssage: 'No se encontro la sucursal ' + err})
        if(sucursales.empresa == empresaId){

            if(params.nombres && params.sexo && params.departamento && params.puesto && params.salario){
                empleado.nombres = params.nombres;
                empleado.sexo = params.sexo;
                empleado.departamento = params.departamento;
                empleado.puesto = params.puesto;
                empleado.sucursal = sucursalId
                
                Empleado.find({$or: [
                    {nombres: empleado.nombres}
                ]
                }).exec((err, empleados)=>{
                    if(err) return res.status(500).send({menssage: 'Error en la petición de Empleados'})
                    if(empleados && empleados.length >= 1){
                        return res.status(500).send({menssage: 'El empleado ya existe'})
                    }else{
                        empleado.save((err, empleadoGuardado)=>{
                            if(err) return res.status(500).send({menssage: 'Error al guardar el empleado'})
                            if(!empleadoGuardado){
                                res.status(404).send({menssage: 'No se ha podido guardar el empleado'})
                            }else{
                                Sucursal.findByIdAndUpdate(sucursalId,  {$inc:{cantidad_Empleados: 1}},
                                    {new : true}, (err, empleadoAgregado)=>{
                                        if(err) return res.status(500).send({menssage: 'Error en la peticion' + err})
                                        if(!empleadoAgregado) return res.status(404).send({menssage: 'Error al agregar empleado'})
                                        return res.status(202).send({Empleado: empleadoGuardado})
                                    })
                            }
                            
                        })
                        
                    }
                })
            }else{
                res.status(200).send({menssage: 'Rellene todos los datos necesarios'})
            }
        }
    })
}


function getEmpleados(req, res) {
    var empresaId = req.params.id
    var params = req.body;
    

    Empleado.find({empresas: empresaId},(err, listarEmpleados)=>{
        if (err) return res.status(500).send({menssage: 'Error en la peticion'})
        if (!listarEmpleados) return res.status(404).send({menssage: 'Error al mostrar emplados'})
        return res.status(200).send({Empleados: listarEmpleados})  
            
        
    })
}

function ediatarEmpleado(req, res) {
    var emId = req.params.id;
    var params = req.body;
    
    
    Empleado.findByIdAndUpdate(emId, params,{new: true}, (err, empleadoActualizado)=>{
        if(err) return res.status(500).send({menssage: 'Error en la particion'})
        if(!empleadoActualizado) return res.status(404).send({menssage: 'No se a podido editar el empleado'})
        return res.status(200).send({Empleado: empleadoActualizado})
    })
}


function eliminarEmpleado(req, res) {
    var empleadoId = req.params.id;
        

    Empleado.findByIdAndDelete(empleadoId, (err, empleadoEliminado)=>{
        if(err) return res.status(500).send({menssage: 'Error en la particion'})
        if(!empleadoEliminado) return res.status(404).send({menssage: 'Error no se pudo eliminar al empleado ' + err })
        else{
            Empresa.findByIdAndUpdate(empleadoEliminado.empresas, {$inc: {cantidad_Empleados: -1}}, (err, empleadoElimindados)=>{
                if(err) return res.status(500).send({messsage: 'Error en la peticion de Empleado'})
                if(!empleadoElimindados) return res.status(404).send({messsage: 'Error al eliminar el empleado'})
             else return res.status(200).send({Empleado_Eliminado: empleadoEliminado})
        })
        }
        
        
    })

}

function busquedas(req, res) {
    var params = req.body;

   
    Empleado.find({nombres: params.nombres}, (err, empleadoVisualizado)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
        else return res.status(200).send({Empleado: empleadoVisualizado})
    })



    
}

//BUSCQUEDAS

function buscarId(req, res) {
    var empresaId = req.params.id;
    var params = req.body


    Empleado.find({empresas: empresaId,  _id: params.id} , (err, empleadoVisualizado)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
        else return res.status(200).send({Empleado: empleadoVisualizado})
    })
}

function buscarNombre(req, res) {
    var empresaId = req.params.id
    var params = req.body;

   
    Empleado.find({nombres: {$regex: params.nombres, $options: 'i'}}, (err, empleadoVisualizado)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
        if(!empleadoVisualizado) return res.status(404).send({menssage: 'Error al mostrar Empleado'})
        else return res.status(200).send({Empleado: empleadoVisualizado})
    })
}

function buscarPuesto(req, res) {
    var params = req.body;
    var empresaId = req.params.id

   
    Empleado.find({puesto: {$regex: params.puesto} , empresas: empresaId},  (err, empleadoVisualizado)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
        else return res.status(200).send({Empleado: empleadoVisualizado})
    })
}

function buscarDepartamento(req, res) {
    var empresaId = req.params.id
    var params = req.body;
    
   
    Empleado.find({departamento: {$regex: params.departamento} , empresas: empresaId},(err, empleadoVisualizado)=>{
        if(err) return res.status(500).send({menssage: 'Error en la peticion'})
        else return res.status(200).send({Empleado: empleadoVisualizado})
    })
}


//PDF
function crearPdf(req, res){
    var params = req.body;
    var doc = new PDF();
    var empresaId = req.params.id



    Empleado.find({empresas: empresaId}).exec((err, empleados)=>{
        if(err) return res.status(500).send({menssage: 'Error al agregar empreado'})
        if(!empleados) return res.status(404).send({menssage: 'Error al ralizar el cambio'})
        else{
            Empresa.findById(empresaId).exec((err, listarEmpresas)=>{
                if (err) return res.status(500).send({menssage: 'Error en la peticion'})
                if (!listarEmpresas) return res.status(404).send({menssage: 'Error al mostrar empleados' + err})
                else{

                doc.pipe(fs.createWriteStream('./src/documents/' + params.nombreDoc + '.pdf'));

               doc
                    .fillColor('red')
                    .font('Times-Roman')
                    .fontSize(25)
                    .text('INFORMACION DE LA EMPRESA ' + listarEmpresas.nombreEmpresa)
                
                doc
                    .fillColor('black')
                    .font('Times-Roman')
                    .fontSize(15)
                    .text('   ')
                    .text('Direccion de correo: ' + listarEmpresas.email)
                    .text('Telefono: ' + listarEmpresas.telefono)
                    .text('Empleados: ')


                if(empleados == undefined){
                doc
                    .text('     ')
                    .text('     No tiene ningun Empleado gurdado: ')
                    .text('     ')
                }else{
                    for (let x = 0; x < empleados.length; x++) {
                        doc
                        .text('     ')
                        .text('     Nombre: ' + empleados[x].nombres)
                        .text('     Sexo: ' + empleados[x].sexo)
                        .text('     Departamento: ' + empleados[x].departamento)
                        .text('     Puesto: ' + empleados[x].puesto)
                        .text('     ')
                    }
                    
                }
                    
                doc
               
                    .text('Cantidad de Empleados: ' + listarEmpresas.cantidad_Empleados)
                    
                
                doc.end();
    
                return res.status(200).send({menssage: empleados})  
                }
                })
        } 
    
    })
}


module.exports ={
    agregarEmpleado,
    getEmpleados,
    ediatarEmpleado,
    eliminarEmpleado,
    buscarId,
    buscarNombre,
    buscarPuesto,
    buscarDepartamento,
    busquedas,
    crearPdf
}