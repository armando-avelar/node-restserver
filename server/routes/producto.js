const express = require('express');
const app = express();

const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const Producto = require('../models/producto');


//=============================
// Obtener productos
//============================
app.get('/producto', verificaToken, (req, res) => {

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({})
        .limit(limite)
        .skip(desde)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos: productoDB
            })
        });
});

//=============================
// Obtener producto por ID
//============================
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.find({ _id: id })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});
//============================
// Buscar Productos
//============================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i')

    Producto.find({nombre: regex})
        .populate('categoria', 'nombre')
        .exec((err, productosDB) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos: productosDB
            })
        });

});

//============================
// Crear nuevo producto
//============================
app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    });
});

//=============================
// Actualizar producto
//============================
app.put('/producto/:id', verificaToken, (req, res) => {
    let body = req.body;
    let id = req.params.id;

    Producto.findByIdAndUpdate(id, body, { new: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    });
});

//=============================
// Borrar producto
//============================
app.delete('/producto/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }
        res.json({
            ok: true,
            message: 'Producto Borrado'
        });

    });
});

module.exports = app;