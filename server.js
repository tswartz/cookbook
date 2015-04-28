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
    categories: { type: [String], default: ['All', 'Poultry', 'Beef', 'Seafood', 'Vegetarian', 'Soups', 'Salads', 'Appetizers', 'Desserts', 'Misc.'] }
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

// Adding a new category
app.post('/category', function (req, res) {
    var newCategory = req.body.newCategory;
    User.findOne({username: req.user.username}, function (err,doc) {
        if (err) {
            res.status(401).send('An error occurred');
        } else {
            var categories = doc.categories;
            if (categories.indexOf(newCategory) != -1) {
                res.status(401).send('There is already a category called ' + newCategory + '. Please choose a new name.');
                return;
            }
            categories.push(newCategory);
            User.update({username: req.user.username}, {"categories": categories}, function (err, updatedDoc) {
                req.user.categories = categories;
                res.send(req.user);
            });
        }
    });
});

// Renaming a category
app.put('/category', function (req, res) {
    var newCategory = req.body.newCategory;
    var oldCategory = req.body.oldCategory;
    User.findOne({username: req.user.username}, function (err,doc) {
        if (err) {
            res.status(401).send('An error occurred');
        } else {
            var categories = doc.categories;
            if (categories.indexOf(newCategory) != -1) {
                res.status(401).send('There is already a category called ' + newCategory + '. Please choose a new name.');
                return;
            }
            var index = categories.indexOf(oldCategory);
            if (index != -1) {
                categories[index] = newCategory;
            } else {
                res.status(401).send('There was an error in renaming ' + oldCategory + '.');
                return;
            }
            User.update({username: req.user.username}, {"categories": categories}, function (err, updatedDoc) {
                if (err) {
                    res.status(401).send('There was an error in renaming ' + oldCategory + '.');
                } else {
                    Recipe.update({username: req.user.username, "category": oldCategory}, {"category": newCategory}, {multi: true}, function (err, recipes) {
                        if (err) {
                            res.status(401).send('There was an error in renaming ' + oldCategory + '.');
                        } else {
                            req.user.categories = categories;
                            res.send(req.user);
                        }
                    });
                }
            });
        }
    });
});

app.put('/removeCategory', function (req, res) {
    var categoryToDelete = req.body.categoryToDelete;
    var newCategory = req.body.newCategory;
    User.findOne({username: req.user.username}, function (err,doc) {
        if (err) {
            res.status(401).send('An error occurred');
        } else {
            var categories = doc.categories;
            var index = categories.indexOf(categoryToDelete);
            categories.splice(index, 1);
            User.update({username: req.user.username}, {"categories": categories}, function (err, updatedDoc) {
                if (err) {
                    res.status(401).send('There was an error in deleting ' + categoryToDelete + '.');
                } else {
                    if (newCategory) {
                        Recipe.update({username: req.user.username, "category": categoryToDelete}, {"category": newCategory}, {multi: true}, function (err, recipes) {
                            if (err) {
                                res.status(401).send('There was an error in deleting ' + categoryToDelete + '.');
                            } else {
                                req.user.categories = categories;
                                res.send(req.user);
                            }
                        });
                    } else {
                        Recipe.remove({username: req.user.username, "category": categoryToDelete}, function (err, recipes) {
                            if (err) {
                                res.status(401).send('There was an error in deleting ' + categoryToDelete + '.');
                            } else {
                                req.user.categories = categories;
                                res.send(req.user);
                            }
                        });
                    }
                    
                }
            });
        }
    });
    
});

// Recipe Schema and Model -------------------------------
var RecipeSchema = new mongoose.Schema({
    name: String,
    content: String,
    username: String,
    category: String
});
var Recipe = mongoose.model('Recipe', RecipeSchema);

var sendAllRecipes = function (req, res) {
    var username = req.user.username;
    Recipe.find({username: username}, function (err, recipes) {
        if (err) {
            res.status(401).send('Error in getting recipes');
        } else {
            res.json(recipes);
        }
    });
}

app.get('/recipes', function(req, res) {
    sendAllRecipes(req, res);
});

// Adding a new recipe
// No duplicates!!
app.post('/recipe', function(req, res) {
    var newRecipe = req.body;
    newRecipe.username = req.user.username;
    newRecipe = new Recipe(newRecipe);
    Recipe.findOne({name: newRecipe.name, username: req.user.username}, function (err, recipe) {
        // first check to see if there is recipe with that name already 
        // (in which case recipe would be non-null)
        if (err || recipe) {
            res.status(401).send('There is already a recipe called ' + newRecipe.name + '. Please choose a new name.');
        // Otherwise, add the new recipe to the db
        } else {
            newRecipe.save(function (err, recipe) {
                if (err) {
                    res.status(401).send('Error in creating new recipe');
                } else {
                    sendAllRecipes(req, res);
                }
            });
        }
    });
});

var updateRecipe = function (updatedRecipe, origName, req, res) {
    Recipe.update({name: origName, username: req.user.username}, updatedRecipe, function (err, recipe) {
        if (err) {
            res.status(401).send('Error in editing recipe');
        } else {
            sendAllRecipes(req, res);
        }
    });
};

// Editing a recipe
app.put('/recipe', function(req, res) {
    var data = req.body;
    var origName = data.origName;
    var updatedRecipe = data.recipe;
    // If the recipe's name is NOT changing, go ahead and update
    if (origName == updatedRecipe.name) {
        updateRecipe(updatedRecipe, origName, req, res);
        return;
    }
    // Otherwise, make sure the new name doesn't match an already-existing recipe
    Recipe.findOne({name: updatedRecipe.name, username: req.user.username}, function (err, recipe) {
        // first check to see if there is recipe with that name already 
        // (in which case recipe would be non-null)
        if (err || recipe) {
            res.status(401).send('There is already a recipe called ' + updatedRecipe.name + '. Please choose a new name.');
        // Otherwise, updated the recipe
        } else {
            updateRecipe(updatedRecipe, origName, req, res);
        }
    });
});

// Deleting a recipe
app.put('/removeRecipe', function(req, res) {
    var recipeToRemove = req.body;
    Recipe.remove({ name: recipeToRemove.name, username: req.user.username }, function (err) {
      if (err) {
        res.status(401).send('Error in deleting recipe');
      } else {
        sendAllRecipes(req, res);
      }
    });
});

// Look for openshift port and ip first, if not, host locally
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

app.listen(port, ip);