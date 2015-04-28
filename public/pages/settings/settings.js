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
        $scope.dialogAction = "Save Changes";
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
        $scope.deleteCategory = {moveRecipes: true};
        $scope.nonAllCategories = $scope.$parent.user.categories.filter(function(category){
            return category != 'All' && category != $scope.selectedCategory;
        });
        if ($scope.form) {
            $scope.form.$setPristine();
            $scope.form.$setUntouched();
        }
        $scope.submitCategory = function (deleteCategory) {
            if ($scope.form.$invalid) return;
            var deleteData = {categoryToDelete : $scope.selectedCategory};
            if (deleteCategory.moveRecipes) {
                deleteData.newCategory = deleteCategory.newCategory;
            }
            
            console.log(deleteCategory);
        }
        $('#deleteCategoryModal').modal('show');
    }
});