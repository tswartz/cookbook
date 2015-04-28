app.controller('SettingsCtrl', function($scope, $http, $location)
{
    $scope.$parent.hideSplashImg();
    
    $scope.selectCategory = function (category) {
        $scope.selectedCategory = category;
    };

    $scope.addCategory = function () {
        $scope.dialogTitle = "Add Category";
        $scope.dialogAction = "Add";
        $scope.newCategory = "";
        if ($scope.form) {
            $scope.form.$setPristine();
            $scope.form.$setUntouched();
        }
        $scope.submitCategory = function (newCategory) {
            if ($scope.form.$invalid) return;
            $('#addEditCategoryModal').modal('hide');
            $http.post('/category', {newCategory: newCategory})
            .success(function (response) {
                $scope.$parent.user = response;
            });
        }
        $('#addEditCategoryModal').modal('show');
    }
});