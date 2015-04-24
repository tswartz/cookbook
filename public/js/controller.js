var app = angular.module("LunchboxApp", ["ngRoute"]);

app.controller('LunchboxController', function($scope, $http, $location, $sce)
{

    // First check if there is a currently logged in user
    $http.get('/loggedin').success(function (user) {
        $scope.user = user;
    });

    // Logs out user, sets user to 0 and redirects to home
    $scope.logout = function () {
        $http.post('/logout').success(function (response) {
            $scope.user = '0';
            $location.url('/home');
        });
    };

    // used in several places to render star ratings
    // needs to be here to use in different views
     $scope.setRating = function(rating) {
        var i = 1;
        var stars = '';
        for(i; i <= 5; i++) {
            if (i <= rating) {
                stars += '<span class="fa fa-star"/>';
            } else {
                stars += '<span class="fa fa-star-o"/>';
            }
        }
        return stars
    }

    // Formats list of ingredients in search results 
    // Displays no more than maxIngredients, cuts off with "..."
    $scope.formatIngredients = function(ingredients, maxIngredients) {
        var displayedIngredients = ingredients.slice(0,maxIngredients);
        var ingredientList = displayedIngredients.join(", ");
        if (ingredients.length > maxIngredients) {
            ingredientList += "...";
        }
        return ingredientList;
    }

    // Formats recipe's given time (in seconds by default) 
    // Displays as hours and minutes
    $scope.formatTime = function(time) {
        time = parseInt(time);
        var hrs = Math.floor(time/3600);
        var min = Math.floor((time%3600)/60);
        var timeStr = hrs ? hrs + " hr, " + min + " min" : min + " min";
        return timeStr;
    }

    // Allows angular to insert html into views
    // Needed for setRating
    $scope.trust = $sce.trustAsHtml;

    // Prep recipe to match Recipe schema in db
    $scope.serializeRecipe = function (recipe) {
        return {
            image: (recipe.images[0].imageUrlsBySize)["90"],
            ingredients: recipe.ingredientLines,
            recipeId: recipe.id,
            recipeName: recipe.name,
            rating: recipe.rating,
            timeInSeconds: recipe.totalTimeInSeconds,
            sourceUrl: recipe.source.sourceRecipeUrl
        }
    }

    // Recipe serialization needs to be deferred
    // In some cases, an API call will need to be made to get more info
    // The defer makes the favoriting process wait for the serialization
    // and API calls before storing the favorited recipe in the db
    $scope.deferredSerializeRecipe = function (recipe) {
        var defer = $.Deferred();
        defer.resolve($scope.serializeRecipe(recipe));
        return defer;
    }

    // When user "favorites" or likes a recipe
    $scope.favoriteRecipe = function (recipe) {
        if ($scope.user == '0') {
            $('#notLoggedInDialog').modal('show');
            return;
        }
        // child controller may want to override deferredSerializeRecipe, i.e. search
        var serializeRecipe = $scope.$$childHead.deferredSerializeRecipe || $scope.deferredSerializeRecipe;
        serializeRecipe(recipe).done(function (resp) {
            recipe = resp;
            $http.put('/favorite', recipe)
            .success(function (response) {
                $scope.user = response;
            });
        });
    }

    // When user "unfavorites" or unlikes a recipe
    $scope.unfavoriteRecipe = function (recipeId) {
        var recipeIdJSON = {recipeId : recipeId};
        $http.put('/unfavorite', recipeIdJSON)
        .success(function (response) {
            $scope.user = response;
            if ($scope.$$childHead.getFavoriteRecipes) {
                $scope.$$childHead.getFavoriteRecipes();
            }
        });
    }

    $('.sign-in-up-buttons').click(function (e) {
        $('#notLoggedInDialog').modal('hide');
    });
});

// Routing!!!
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/home', {
        templateUrl: '../pages/home/home.html'
    }).
    when('/search', {
        templateUrl: '../pages/search/search.html',
        controller: 'SearchCtrl'
    }).
    when('/search/:query', {
        templateUrl: '../pages/search/search.html',
        controller: 'SearchCtrl'
    }).
    when('/my-recipes', {
        templateUrl: '../pages/my-recipes/my-recipes.html'
    }).
    when('/login', {
        templateUrl: '../pages/login/login.html',
        controller: 'LoginCtrl'
    }).
    when('/signup', {
        templateUrl: '../pages/register/register.html',
        controller: 'RegisterCtrl'
    }).
     when('/profile/:username', {
        templateUrl: '../pages/profile/profile.html',
        controller: 'ProfileCtrl'
    }).
    when('/recipe/:recipeId', {
        templateUrl: '../pages/details/details.html',
        controller: 'DetailsCtrl'
    }).
    when('/my-recipes', {
        templateUrl: '../pages/my-recipes/my-recipes.html',
        controller: 'MyRecipesCtrl'
    }).
    otherwise({
        redirectTo: '/home'
    });
}]);
