app.controller('SettingsCtrl', function($scope, $http, $location)
{
    $scope.$parent.hideSplashImg();
    
    $scope.selectCategory = function (category) {
        $scope.selectedCategory = category;
    };

    $scope.addCategory = function () {
        $scope.dialogTitle = "Add Category";
        $scope.dialogAction = "Edit Category";
        $('#addEditCategoryModal').modal('show');
    }
});