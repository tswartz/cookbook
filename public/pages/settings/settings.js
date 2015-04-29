app.controller('SettingsCtrl', function($scope, $http, $location)
{
    if ($scope.$parent.user != '0') {
        $scope.$parent.hideSplashImg();
    }

    $scope.selectCategory = function (category) {
        $scope.selectedCategory = category;
    };

    $scope.addCategory = function () {
        $scope.dialogTitle = "Add Category";
        $scope.dialogAction = "Add";
        $scope.newCategory = "";
        if ($scope.addEditform) {
            $scope.addEditform.$setPristine();
            $scope.addEditform.$setUntouched();
        }
        $scope.submitCategory = function (newCategory) {
            if ($scope.addEditform.$invalid) return;
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
        $scope.dialogAction = "Save Changes";
        $scope.newCategory = $scope.selectedCategory;
        if ($scope.addEditform) {
            $scope.addEditform.$setPristine();
            $scope.addEditform.$setUntouched();
        }
        $scope.submitCategory = function (newCategory) {
            if ($scope.addEditform.$invalid) return;
            $('#addEditCategoryModal').modal('hide');
            $http.put('/category', {newCategory: newCategory, oldCategory: $scope.selectedCategory})
            .success(function (response) {
                $scope.$parent.user = response;
                $scope.selectedCategory = newCategory;
            })
            .error(function (response) {
                $scope.errorMessage = response;
                $('#errorModal').modal('show');
            });
        }
        $('#addEditCategoryModal').modal('show');
    }

    $scope.deleteCategory = function () {
        if (!$scope.selectedCategory) {
            $('#selectRecipeModal').modal('show');
            return;
        }
        $scope.deleteData = {moveRecipes: true, newCategory: ""};
        $scope.nonAllCategories = $scope.$parent.user.categories.filter(function(category){
            return (category != 'All' && category != $scope.selectedCategory);
        });
        if ($scope.deleteform) {
            $scope.deleteform.$setPristine();
            $scope.deleteform.$setUntouched();
        }
        $scope.submitCategory = function (deleteData) {
            if ($scope.deleteform.$invalid) return;
            $('#deleteCategoryModal').modal('hide');
            var deleteDataJson = {categoryToDelete : $scope.selectedCategory};
            if (deleteData.moveRecipes) {
                deleteDataJson.newCategory = deleteData.newCategory;
            }
            $http.put('/removeCategory', deleteDataJson)
            .success(function (response) {
                $scope.$parent.user = response;
                $scope.selectedCategory = undefined;
            })
            .error(function (response) {
                $scope.errorMessage = response;
                $('#errorModal').modal('show');
            });
        }
        $('#deleteCategoryModal').modal('show');
    }

    $scope.changePassword = function (passwordChange) {
        console.log(passwordChange);
    }
});