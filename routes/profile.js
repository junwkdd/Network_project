var express = require('express');
var router = express.Router();

var model = require('../model/DAO');

router.route('/')
.get(function(req, res, next) {
    var id = req.query.id;
    
});