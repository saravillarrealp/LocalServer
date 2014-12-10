/**
 * Created by Usuario on 09/12/2014.
 */

//routes/reports.js
var express = require('express');
var cradle = require('cradle');
var http = require('http');

var db = new (cradle.Connection)().database('kiwitienda');
db.exists(function (err, exists) {
	if (err) {
		console.log('error', err);
	}else if (!exists) {
		console.log('database does not exists.');
		db.create();
		console.log('database created.');

		db.save('_design/obtener', {
			views: {
				allFresas:{
					map: function (doc) {
						if(doc.fruta=='fresa')
							emit(null, doc);
					}
				},
				allPinas:{
					map: function (doc) {
						if(doc.fruta=='pina')
							emit(null, doc);
					}
				},
				allKiwi:{
					map: function (doc) {
						if(doc.fruta=='kiwi')
							emit(null, doc);
					}
				}
			}
		});
	}
});



//config Rutes
var router = express.Router();
router.route('/kiwitienda').get(function(req, res){
	console.log("Iniciado Servidor");
});


router.route('/kiwitienda/obtenertodas/:frutas').get(function(req, res){
	console.log("llega");
	var parameter = req.params;
	if(parameter.frutas=='kiwi'){
		db.view('obtener/allKiwi', function (err, ress) {
			res.json(ress);
			console.log('los kiwi : '+ress);
		});
	}
	else if(parameter.frutas=='pina'){
		db.view('obtener/allPinas', function (err, ress) {
			res.json(ress);
			console.log('las pinas : '+ress);
		});
	}
	else if(parameter.frutas=='fresa'){
		db.view('obtener/allFresas', function (err, ress) {
			res.json(ress);
			console.log('las fresas : '+ress);
		});
	}
	else
		res.json({'status':'failed'});
});

router.route('/kiwitienda/guardarfuta').post(function(req, res){
	var body = req.body;
	console.log(body);
	if(body.fruta=='fresa'||body.fruta=='pina'||body.fruta=='kiwi'){
		db.save(body._id,{"fruta":body.fruta,"status":"disponible"},function(err,ress){
			if(err){
				res.json({'status':'failed','reason':err});
				console.log(ress);
			}
			else{
				console.log(ress);
				res.json({'status':'succes','fruta':ress});
			}
		});
	}
	else if(body.fruta!='fresa'&&body.fruta!='pina'&&body.fruta!='kiwi'){
		res.json({'status':'failed',"reason":"You have to choose only 'pina', 'kiwi' or 'fresa'"});
	}
	else{
		res.json({'status':'failed',"reason":"You have to choose a fruit"});
	}
});

// Solicitar fruta
router.route('/tienda/:type/solicitarfrutas').post (function (req, res){
var type = req.params.type;
console.log('type: ', type);
//The url we want is `www.nodejitsu.com:1337/`
	var body = JSON.stringify({
		fruta: type
	});

	var options = {
		host: '127.0.0.1',
		path: '/api/distribuidora/comprarfruta',
		//since we are listening on a custom port, we need to specify it by hand
		port: '3050',
		//This is what changes the request to a POST request
		method: 'POST',
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Content-Length": Buffer.byteLength(body)
		}
	};
	callback = function(response) {
		var str = ''
		response.on('data', function (chunk) {
			str += chunk;
		});

		response.on('end', function () {
			console.log(str);
		//	res.json({message: JSON.parse(str)});
			str = JSON.parse(str);

			db.save({fruta: str.fruta.type, status: "disponible"}, function(err, responseSave) {
				if(err){
					res.json({'status':'failed','reason':err});
				//	console.log(ress);
				}
				else{
				//	console.log(ress);
					res.json({'status':'succes','fruta':str});
				}
			});
		});
	};

	var req = http.request(options, callback);
//This is the data we are posting, it needs to be a string or a buffer
	req.write(body);
	req.end();
});

// Producir frutas
router.route('/tienda/:user').post(function (req, res){
	var user = req.params.user;
	console.log('userrrr: ', user);
//The url we want is `www.nodejitsu.com:1337/`
	var body = JSON.stringify({
		type: req.body.type,
		quantity: req.body.quantity
	});

	console.log('body no stringigy: ', req.body);
	console.log('body si stringigy: ', body);
	console.log('/api/distribuidora/' + user + '/mandarproducir');

	var options = {
		host: '127.0.0.1',
		path: '/api/distribuidora/' + user + '/mandarproducir',
		//since we are listening on a custom port, we need to specify it by hand
		port: '3050',
		//This is what changes the request to a POST request
		method: 'POST',
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Content-Length": Buffer.byteLength(body)
		}
	};
	callback = function(response) {
		var str = ''
		response.on('data', function (chunk) {
			str += chunk;
		});

		response.on('end', function () {
			console.log(str);
			//	res.json({message: JSON.parse(str)});
		//	str = JSON.parse(str);

			res.json({message: str});
		});
	};

	var req = http.request(options, callback);
//This is the data we are posting, it needs to be a string or a buffer
	req.write(body);
	req.end();
});

router.route('/kiwitienda/venderfruta').put(function(req, res){
	var body = req.body;
	console.log(body);
	db.merge(body._id,{"status":"vendido"},function(err,ress){
		if(err){
			res.json({'status':'failed','reason':err});
		}
		else{
			console.log("ress es "+ress);
			res.json({'status':'succes','fruta':ress});
		}
	});
});

router.route('/kiwitienda/despacharfruta').delete(function(req, res){
	var body = req.body;
	console.log("el Body._id en despacharfruta es "+body._id);
	db.get(body._id,function(err,ress){
		if(err){
			res.json({'status':'failed','reason':err});
		}
		else{
			console.log(ress);

			db.remove(body._id,function(err,resss){
				if(err){
					res.json({'status':'failed','reason':err});
				}
				else{
					console.log(resss);
					res.json({'status':'succes'});
				}
			});
		}
	});

});

/*router.route('/kiwitienda/:user/mandarproducir').post(function(req, res){

 var parameter = req.params;
 var body = req.body;

 db.view('user/byUser', function(err,doc,usuario){
 if(err){
 console.log(err);
 }
 else{
 var usuario;
 for(var i = 0 ; i < doc.length ; i ++){
 if(doc[i].value.user==parameter.user){
 usuario = doc[i].value;
 break;
 }
 }
 console.log(usuario);
 if(usuario){
 if(usuario.type==body.type){
 if(!isNaN(body.quantity)){
 for(var i = 0 ; i < body.quantity ; i++){
 db.save({
 "type": body.type,
 }, function (err, res) {
 if (err) {
 console.log("ha ocurrido un error");
 } else {
 console.log("se creado un "+body.type);
 }
 });
 }
 res.json({"status":"succes"});
 }
 else{
 res.json({status:"failed",reason:"quantity must be a number"});
 }
 }
 else{
 res.json({status:"failed",reason:usuario.user+" can only send to produce "+usuario.type});
 }
 }
 else if(!usuario){
 res.json({status:"failed",reason:"User doesn't exist"});
 }
 else if(body.fruta!='fresa'&&body.fruta!='pina'&&body.fruta!='kiwi'){
 res.json({'status':'failed',"reason":"You have to choose only 'pina', 'kiwi' or 'fresa'"});
 }
 else{
 res.json({'status':'failed',"reason":"You have to choose a fruit"});
 }
 }
 });

 });*/

module.exports = router;