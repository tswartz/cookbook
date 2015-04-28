app.controller('SettingsCtrl', function($scope, $http, $location)
{
    $scope.$parent.hideSplashImg();
    
    $scope.selectCategory = function (category) {
        $scope.selectedCategory = category;
    };
});