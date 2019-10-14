const express = require('express');
const router = express.Router();
const Location =  require('../Model/location');

router.get('/locations',(req,res) =>{
    Location.find({}).then(locations =>
        {
            res.send(locations);
        });
});

router.post('/locations',(req,res) =>{
    console.log(req.body);
    Location.create(req.body).then((ninja)=>{
        res.send(ninja);
    });
});

router.put('/locations/:id',(req,res) =>{
    res.send({type : 'PUT'})
})

router.delete('/locations/:id',(req,res) =>{
    res.send({type : 'DELETE'})
})

module.exports = router;