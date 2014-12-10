//routes/reports.js
var express = require('express');
var cradle = require('cradle');

var db = new (cradle.Connection)().database('tarea');

// Handlers
function outputQuotes2(err) {
	console.log("Necesitamos un milagro");
}

// handler to get all tasks
function getAllTasks(res) {
  var rows = [];
	var self = this;
	self.res = res;

  // Creo la vista para obtener todos los valores
  db.save('_design/tareas', {
		all: {
			map: function (doc) {
				emit(doc._id, doc);
			}
		}
  });

  // Consulto la vista que devuelve todas las tareas
  db.view('tareas/all', function(err, res) {
		res.forEach(function(row) {
			rows.push(row);
		});
		self.res.json({message: rows});
  });
}

// handler to create a task
function createTask(req, res) {
	var self = this;
	self.res = res;

  if (req.body.title) {
    db.save({value: req.body.title}, function(err, res) {
			if(err) {
				return new Error("Error al tratar de crear tarea en base de datos");
			}

			self.res.json({message: res});
		});
  }

	return;
}

// handler to get a task
function getTask(params, res) {
	console.log('params: ', params);

	if(params.id) {
		db.get(params.id, function(err, doc) {
			if(err) {
				return new Error("Error al tratar de obtener la tarea");
			}

			res.json({message: doc});
		});
	}
}

// handler to update a task
function updateTask(req, res) {
	var self = this;
	self.res = res;

	if (req.params.id) {
		db.save(req.params.id, {value: req.body.title}, function(err, res) {
			if(err) {
				return new Error("Error al tratar de actualizar tarea en base de datos");
			}

			self.res.json({message: res});
		});
	}

	return;
}

// handler to delete a task
function deleteTask(params, res) {
	var self = this;
	self.res = res;

	if (params.id) {
		db.remove(params.id, function(err, res) {
			if(err) {
				return new Error("Error al tratar de eliminar tarea en base de datos");
			}

			self.res.json({message: res});
		});
	}

	return;
}

//config Routes
var router = express.Router();

// Get all tasks
router.route('/tasks').get(function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Origin, X-Titanium-Id, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");

//  outputQuotes(res);
	getAllTasks(res);
});

// Create a single task
router.route('/tasks').post(function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Origin, X-Titanium-Id, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");

	createTask(req, res);
});

// Get a single task by id
router.route('/tasks/:id').get(function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Origin, X-Titanium-Id, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");

	getTask(req.params, res);
});

// Update a task by id
router.route('/tasks/:id').put(function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Origin, X-Titanium-Id, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");

	updateTask(req, res);
});

// Delete a task by id
router.route('/tasks/:id').delete(function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Origin, X-Titanium-Id, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");

	deleteTask(req.params, res);
});


module.exports = router;