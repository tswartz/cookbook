app.controller('RegisterCtrl', function($scope, $http, $location)
{
    // Registers a new user
    $scope.register = function (newuser) {
        // Has 2 password fields to ensure that user is typing intended password
        // First checks that user retyped its password accurately
        var password2 = $('input#retypedPassword').val();
        if (newuser.password != password2) {
            $scope.errorMessage = 'Passwords do not match'
            return;
        }
        // Register post endpoint adds user to db and logs him/her in
        // Redirects to homepage
        $http.post('/register', newuser)
        .success(function (response) {
            // set current user in parent scope
            $scope.$parent.user = response;
            $location.path("/");
        })
        .error(function (data) {
            $scope.errorMessage = data;
        });
    }
});