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

    $scope.showRecipeContent = function (recipe, category, $event) {
    	$scope.selectedRecipes[category] = recipe;
    	$('.recipe-list .list-group-item').removeClass("active-group-item");
    	$($event.target).addClass("active-group-item");
    	$('#' + category + ' .recipe-content').text(recipe.content);
    };

    $scope.addRecipe = function (category) {
    	if ($scope.form) {
	    	$scope.form.$setPristine();
	      	$scope.form.$setUntouched();
	    }
    	$scope.dialogTitle = "Add New Recipe";
    	$scope.dialogAction = "Add";
    	$('#addEditRecipeModal').modal('show');
    	$scope.submitRecipe = function (newRecipe) {
    		if ($scope.form.$invalid) {
				return;
			}
    		console.log("adding", newRecipe);
    	};
    };

    $scope.editRecipe = function (category) {
    	var recipe = $scope.selectedRecipes[category];
    	console.log("editing", recipe);
    	$scope.dialogTitle = "Edit Recipe";
    	$scope.dialogAction = "Save Changes";
    	$('#addEditRecipeModal').modal('show');
    	$scope.submitRecipe = function (newRecipe) {
    		console.log("editing", newRecipe);
    	};
    };

    $scope.deleteRecipe = function (category) {
    	var recipe = $scope.selectedRecipes[category];
    };
});