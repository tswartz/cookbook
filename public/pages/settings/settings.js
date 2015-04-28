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
            })
            .error(function (response) {
                $scope.errorMessage = response;
                $('#errorModal').modal('show');
            });
        }
        $('#addEditCategoryModal').modal('show');
    }

    $scope.editCategory = function () {
        if (!$scope.selectedCategory) {
            $('#selectRecipeModal').modal('show');
            return;
        }
        $scope.dialogTitle = "Edit Category";
        $scope.dialogAction = "Edit";
        $scope.newCategory = $scope.selectedCategory;
        if ($scope.form) {
            $scope.form.$setPristine();
            $scope.form.$setUntouched();
        }
        $scope.submitCategory = function (newCategory) {
            if ($scope.form.$invalid) return;
            $('#addEditCategoryModal').modal('hide');
            $http.put('/category', {newCategory: newCategory, oldCategory: $scope.selectedCategory})
            .success(function (response) {
                $scope.$parent.user = response;
                $scope.selectCategory = newCategory;
            })
            .error(function (response) {
                $scope.errorMessage = response;
                $('#errorModal').modal('show');
            });
        }
        $('#addEditCategoryModal').modal('show');
    }
});