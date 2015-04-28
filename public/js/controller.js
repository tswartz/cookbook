var app = angular.module("CookbookApp", ["ngRoute"]);

app.controller('CookbookController', function($scope, $http, $location, $sce)
{
    $scope.showSplashImg = function () {
        $('.home-splash-gradient').show()
        $('.home-splash-img').show()
        $('nav').removeClass('white-background');
    }

    $scope.hideSplashImg = function () {
        $('.home-splash-gradient').hide()
        $('.home-splash-img').hide()
        $('nav').addClass('white-background');
    }

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

    // Allows angular to insert html into views
    // Needed for setRating
    $scope.trust = $sce.trustAsHtml;

});

// Routing!!!
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
    when('/home', {
        templateUrl: '../pages/home/home.html',
        controller: 'HomeCtrl'
    }).
    when('/signin', {
        templateUrl: '../pages/login/login.html',
        controller: 'LoginCtrl'
    }).
    when('/signup', {
        templateUrl: '../pages/register/register.html',
        controller: 'RegisterCtrl'
    }).
    when('/settings', {
        templateUrl: '../pages/settings/settings.html',
        controller: 'SettingsCtrl'
    }).
    when('/my-recipes', {
        templateUrl: '../pages/my-recipes/my-recipes.html',
        controller: 'MyRecipesCtrl'
    }).
    otherwise({
        redirectTo: '/home'
    });
}]);
