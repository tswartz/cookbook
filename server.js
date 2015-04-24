var express = require('express');
var app = express();

var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var bodyParser = require('body-parser');
var multer     = require('multer');

var cookieParser = require('cookie-parser');
var session      = require('express-session');
var mongoose = require('mongoose');

app.use(cookieParser())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'this is the secret' }));
app.use(multer());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

var connection_string = 'localhost/cookbook';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

mongoose.connect('mongodb://' + connection_string);

// User Schema and Model ----------------------------------
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    categories: { type: [String], default: ['Poultry', 'Beef', 'Seafood', 'Soups', 'Salads', 'Vegetarian', 'Desserts', 'Appetizers'] }
});
var User = mongoose.model('User', UserSchema);
var conn = mongoose.connection;

// Login  ----------------------------------
passport.use(new LocalStrategy(
function (username, password, done) {
    User.findOne({username: username, password: password}, function (err,docs) {
        if (err) {
            return done(null, false, {errorMessage: 'Username or password is invalid'});
        } else {
            return done(null, docs);
        }
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// check authentication before proceeding
var auth = function (req, res, next) {
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

// get all users in collection
app.get('/users', auth, function (req, res) {
    User.find(function (err,docs) {
        res.json(docs);
    });
});

// get user doc by username
app.get('/user/:username', function (req, res) {
    var username = req.params.username;
    User.findOne({username: username}, function (err,docs) {
        if (err) {
            res.status(401).send('User ' + username + ' was not found');
        } else {
            res.json(docs);
        }
    });
});

// check if user is logged in
app.get('/loggedin', function (req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});

// authenticate user
app.post('/login', passport.authenticate('local'), function (req, res) {
    res.send(req.user);
});

// logout user
app.post('/logout', function (req, res) {
    req.logOut();
    res.send(200);
}); 

// register a new user in the user collection
app.post('/register', function(req, res){
    var newuser = req.body;
    User.findOne({username: newuser.username}, function (err,docs) {
        // first check to see if user already has that username (in which case docs would be non-null)
        if (err || docs) {
            // if so, return error and error message saying to pick new username
            res.status(401).send('Username ' + newuser.username + ' already taken. Choose a new username.');
        } else {
            // otherwise insert and log in new user
            insertNewUser(req, res, newuser);
        }
    });
});

// helper to actually insert the new user
function insertNewUser(req, res, newuser)  {
    newuser["following"] = [];
    conn.collection('users').insert(newuser, function (err,docs) {
        if (err) {
            res.status(401).send('Error in registration');
        } else {
            passport.authenticate('local')(req, res, function () {
                res.send(req.user);
            })
        }
    });
}

// Recipe Schema and Model -------------------------------
var RecipeSchema = new mongoose.Schema({
    name: String,
    content: String,
    username: String
});
var Recipe = mongoose.model('Recipe', RecipeSchema);

app.get('/recipes', function(req, res) {
    var username = req.user.username;
    Recipe.find({username: username}, function (err, recipes) {
        if (err) {
            res.status(401).send('Error in getting recipes');
        } else {
            res.json(recipes);
        }
    });
});

app.post('/recipe', function(req, res) {
    var newRecipe = req.body;
    newRecipe = new Recipe(newRecipe);
    newRecipe.save(function (err, recipe) {
        if (err) {
            res.status(401).send('Error in creating new recipe');
        } else {
            res.send(recipe);
        }
    });
});

// Look for openshift port and ip first, if not, host locally
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

app.listen(port, ip);