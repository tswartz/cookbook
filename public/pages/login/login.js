app.controller('LoginCtrl', function($scope, $http, $location)
{
    // call login endpoint to log in this user
    $scope.login = function (user) {
        $http.post('/login', user)
        .success(function (response) {
            // add user to parent scope so accessible globally
            $scope.$parent.user = response;
            $location.path("/");
        })
        .error(function (data) {
            $scope.errorMessage = 'Username or password is invalid';
        });
    }
});