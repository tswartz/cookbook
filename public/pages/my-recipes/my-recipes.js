app.controller('MyRecipesCtrl', function($scope, $http, $location)
{
	$scope.$parent.hideSplashImg();

    $http.get('/recipes')
    .success(function (response) {
        $scope.recipes = response;
        $scope.categorizeRecipes();
    });

    $scope.categorizeRecipes = function () {
    	var categorizedRecipes = [];
    	$($scope.$parent.user.categories).each(function (i,category) {
    		var recipesInCategory = $scope.recipes.filter(function(recipe){
	    		return recipe.category == category;
	    	});
	    	categorizedRecipes.push({
	    		category: category,
	    		recipes: recipesInCategory
	    	});
    	});
    	$scope.categorizedRecipes = categorizedRecipes;
    }

    $scope.categoryHasRecipes = function (category) {
    	if (!$scope.recipes) return;
    	var recipesInCategory = $scope.recipes.filter(function(recipe){
    		return recipe.category == category;
    	});
    	return recipesInCategory.length > 0;
    };

    $scope.showRecipeContent = function (recipe, $event) {
    	$('.recipe-list .list-group-item').removeClass("active-group-item");
    	$($event.target).addClass("active-group-item");
    	$('#' + recipe.category + ' .recipe-content').text(recipe.content);
    }
});