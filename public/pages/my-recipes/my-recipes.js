app.controller('MyRecipesCtrl', function($scope, $http, $location)
{
	$scope.selectedRecipes = {};
	$scope.nonAllCategories = $scope.$parent.user.categories.filter(function(category){
		return category != 'All';
	});
	$scope.$parent.hideSplashImg();

    $http.get('/recipes')
    .success(function (response) {
        $scope.recipes = response;
        $scope.categorizeRecipes();
    });

    $scope.categorizeRecipes = function () {
    	var categorizedRecipes = {};
    	$($scope.$parent.user.categories).each(function (i,category) {
    		var recipesInCategory = $scope.recipes.filter(function(recipe){
    			if (category == 'All') {
    				return true;
    			} else {
    				return recipe.category == category;
    			}
	    	});
	    	categorizedRecipes[category] = recipesInCategory;
    	});
    	$scope.categorizedRecipes = categorizedRecipes;
    }

    $scope.categoryHasRecipes = function (category) {
    	if (!$scope.categorizedRecipes) return;
    	return ($scope.categorizedRecipes[category]).length > 0;
    };

    $scope.showRecipeContent = function (recipe, category) {
    	$scope.selectedRecipes[category] = recipe;
    	$('#' + category + ' .recipe-content').text(recipe.content);
    };

    $scope.addRecipe = function (category) {
    	$scope.dialogTitle = "Add New Recipe";
    	$scope.dialogAction = "Add";
    	$scope.submitRecipe = function (newRecipe) {
    		if ($scope.form.$invalid) return;
    		$('#addEditRecipeModal').modal('hide');
            $http.post('/recipe', newRecipe)
            .success(function (response) {
                $scope.recipes = response;
                $scope.categorizeRecipes();
            });
    	};
        if ($scope.form) {
            $scope.form.$setPristine();
            $scope.form.$setUntouched();
        }
        $scope.newRecipe = category != 'All' ? {category: category} : {};
        $('#addEditRecipeModal').modal('show');
    };

    $scope.editRecipe = function (category) {
    	var recipe = $scope.selectedRecipes[category];
        if (!recipe) {
            $('#selectRecipeModal').modal('show');
            return;
        }
        recipe = $.extend(true, {}, recipe); // Clone it!!!
    	$scope.dialogTitle = "Edit Recipe";
    	$scope.dialogAction = "Save Changes";
        $scope.newRecipe = recipe;
    	$scope.submitRecipe = function (newRecipe) {
            if ($scope.form.$invalid) return;
            $('#addEditRecipeModal').modal('hide');
            var origRecipe = $scope.selectedRecipes[category];
            var data = {origName:origRecipe.name, recipe: newRecipe};
    		$http.put('/recipe', data)
            .success(function (response) {
                $scope.recipes = response;
                $scope.categorizeRecipes();
                $scope.showRecipeContent(newRecipe, category);
            });
    	};
        $('#addEditRecipeModal').modal('show');
    };

    $scope.deleteRecipe = function (category) {
    	var recipe = $scope.selectedRecipes[category];
        if (!recipe) {
            $('#selectRecipeModal').modal('show');
            return;
        }
        $scope.newRecipe = recipe;
        $scope.submitRecipe = function (newRecipe) {
            console.log("deleting", newRecipe);
        };
    };
});