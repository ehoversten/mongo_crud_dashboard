// Require the Express Module
const express = require('express');
// Create an Express App
const app = express();
// Require body-parser (to receive post data from clients)
const bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
const path = require('path');

const session = require('express-session');

app.use(session({
    secret: 'codingmojo',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

const flash = require('express-flash');
app.use(flash());
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

// Require Mongoose
var mongoose = require('mongoose');
// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/dashboard');

// DATABASE SCHEMA
var AnimalSchema = new mongoose.Schema({

 name: { type: String, required: true, minlength: 2 },
 age: { type: Number, required: true },
 pack: { type: String, required: true, minlength: 2},
 date: { type: Date, default: Date.now}

}, {timestamps: true })

// Use native promises
mongoose.Promise = global.Promise;

mongoose.model('Animal', AnimalSchema);
var Animal = mongoose.model('Animal');

// ------- ROUTES  ---------
// app.get('/', function(req, res) {
//   res.send("Hello User");
// })

// Root Request

app.get('/', function(req, res) {
  // Retrieve an array of users
  Animal.find({}, function(err, animals) {
   if(err) {
     console.log("Error: ", err);
     return redirect('/');
   } else {
     return res.render('index', {animals});
   }

 });
});

app.get('/new', (req, res) => {
  return res.render('new', {})
});

app.post('/new', (req, res) => {
  console.log("POST DATA: ", req.body);
  var animal = new Animal(req.body);
  animal.save(function(err) {
    if(err) {
      console.log('something went wrong', err);
      for(var key in err.errors) {
          req.flash('fail', err.errors[key].message);
      }
      res.redirect('/');
    } else {
      console.log('successfully added a member!');
      res.redirect('/');
    }
  });
});

// app.get('/animals/:id', (req, res) => {
//   Animal.findOne({_id:req.params.id}, function(err, animal) {
//     if(err) {
//       console.log('something went wrong', err);
//       return res.redirect('/')
//     }
//     console.log("Found animal: ", animal);
//     console.log("Animal ID: ", animal.id);
//     return res.render('details', {animal})
//   });
// });

app.get('/animals/:id',function(req,res){
  Animal.findById(req.params.id, function(err, animal) {
    if(err) {
      console.log('something went wrong');
      return res.redirect('/')
    } else { // else console.log that we did well and then redirect to the root route
      console.log("found animal: ", animal);
      console.log("found animalID: ", animal.id);

      return res.render('details', {animal})
    }
  });
});

app.get('/animals/:id/edit', function(req, res) {
  // Query the DB for this animal. Return either an error or the animal OBJECT
  Animal.findById(req.params.id, function(err, animal) {
    if(err) {
      console.log('something went wrong', err);
      return res.redirect('/')
    } else {
      // console.log("found animal: ", animal);
      console.log("found animalID: ", animal.id);
      return res.render('edit', {animal})
    }
  });
});

app.post('/animals/:id', function(req, res) {
  console.log('EDIT POST DATA:', req.body);
  Animal.findById(req.params.id, function(err, animal) {
    if(err) {
      console.log('something went wrong', err);
      return res.redirect('edit');
    } else {
      console.log("found animal: ", animal.name);
      // update any changed values from the POST DATA
      animal.name = req.body.name;
      animal.age = req.body.age;
      animal.pack = req.body.pack;
      animal.save(function(err) {
        if(err) {
          console.log("something went wrong" , err );
          return res.redirect('/animals/:id/edit');
        } else {
          console.log("animal attributes updated successfully");
          return res.render('details', {animal});
        }

      });
    }
  });
});

app.post('/animal/:id/delete', function(req, res) {
  Animal.findById(req.params.id, function(err, animal) {
    animal.remove(function(err) {
      if(err) {
        console.log("something went wrong", err);
        return res.redirect('/animals/:id/edit');
      } else {
        console.log(animal.name + "was removed from the database");
        return res.redirect('/')
      }
    });
  });
});


app.listen(8000, function() {
  console.log("Listening on PORT:8000");
});
