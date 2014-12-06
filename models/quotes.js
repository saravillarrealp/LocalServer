//routes/reports.js
var express = require('express');
var cradle = require('cradle');
var db = new (cradle.Connection)().database('tarea');

var params = {author: process.argv[2], quote: process.argv[3]};

function errorHandler(err) {
  if (err) { console.log(err); process.exit(); }
}


function createQuotesView(err) {
  console.log('Need to create view!');
  errorHandler(err);
  db.save('_design/quotes', {
    views: {
      byAuthor: {
        map: 'function (doc) { emit(doc.author, doc) }'
      }
    }
  }, outputQuotes);
}

/*function outputQuotes(err) {
  errorHandler(err);

  if (params.author) {
    db.view('quotes/byAuthor', {key: params.author}, 
    function (err, rowsArray) {
      if (err && err.error === "not_found") {
        createQuotesView();
        return;
      }
      errorHandler(err);

      rowsArray.forEach(function (doc) {
        console.log('%s: %s \n', doc.author, doc.quote); return;
      });
    });
  }
}
*/

function outputQuotes2(err) {
  console.log("Necesitamos un milagro");
}


function outputQuotes(res) {
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

/*
function Parametros(id, res) {
  console.log('esto es la ruta/models/post/'+id);
   res.json({ message: 'models/'+id});
}

function checkAndSave(err) {
  errorHandler(err);

  if (params.author && params.quote) {
    db.save({author: params.author, quote: params.quote}, outputQuotes);
    return;
  }

  outputQuotes();
}
*/

function Parametros2(id, res) {
 // errorHandler(err);

  if (id) {
    db.save({value: id}, outputQuotes2);
    return;
  }

  console.log('Id parametros2: ', id);
}

/*
db.exists(function (err, exists) {
  errorHandler(err);
  if (!exists) { db.create(checkAndSave); }
  checkAndSave();
});
*/

//config Rutes
var router = express.Router();
router.route('/models').get(function(req, res){
	res.setHeader("Access-Control-Allow-Origin", "*");

  outputQuotes(res);
});

router.route('/models/:id').post(function(req, res){
	res.setHeader("Access-Control-Allow-Origin", "*");

  var identificator = req.params.id;
  
  console.log('Id route: ', identificator);
  
  Parametros2(identificator, res);
});

module.exports = router;