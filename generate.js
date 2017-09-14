// The purpose of this script is to generate
// a file for ingredients and a file for recipes linked to these ingredients
// from a single file containing recipes and ingredients
// INPUT: file containing a list of cocktail recipes
// OUTPUT:
// -- A file containing a dicitonary of the ingredients extracted from the input cocktail recipes
// -- A file containing the cocktail recipes from the input, but linked to the ingredients in the ingredients file generated

const _ = require('lodash');
const fs = require('fs');

//// Open input point: cocktail recipes
const recipes = require('./recipes');
const recipes_dest = "gen_cocktails.json"
const ingredients_dest = "gen_ingredients.json"

//// Variables for both generated dictionaries of recipes and ingredients
var gen_recipes;
var gen_ingredients;

//// Go get all the ingredients in duplicate
var i = 0;
var gen_ingredients = [];
// Parse every recipe
_.each(recipes, recipe => {
  recipe_duplicate = _.cloneDeep(recipe);
  // Parse every ingredient in recipe
  _.each(recipe_duplicate.ingredients, ingredient => {
    ingredient_duplicate = _.cloneDeep(ingredient);
    var gen_ingredient = {"name": ingredient_duplicate.ingredient, "id": i++}
    // Push ingredient found in list of ingredients
    gen_ingredients.push(gen_ingredient);
  });
});

//// Sort ingredients to they are unique
gen_ingredients = _.uniqBy(gen_ingredients, "name");

//// Duplicate cocktail recipes input in output dicitonary
gen_recipes = _.cloneDeep(recipes);

//// Replace ingredient name in cocktail recipes by ingredient id created in ingredient dictionary
// Parse every recipe
gen_recipes = _.map(gen_recipes, recipe => {
  recipe_duplicate = _.cloneDeep(recipe);
  recipe_duplicate.ingredients = _.map(recipe_duplicate.ingredients, ingredient => {
    // Find id matching ingredient name in list of ingredients
    var found = _.find(gen_ingredients, ["name", ingredient.ingredient]);
    // Update ingredient name for id in ingredient specified in recipe
    ingredient.ingredient = found.id;
    return ingredient;
  });
  return recipe_duplicate;
});

//// Write result to files
fs.writeFile(recipes_dest, JSON.stringify(gen_recipes, null, " "), err => {
  if (err) throw err;
  console.log('Cocktails recipes generated in '+recipes_dest);
});
fs.writeFile(ingredients_dest, JSON.stringify(gen_ingredients, null, " "), err => {
  if (err) throw err;
  console.log('Ingredients generated in '+ingredients_dest);
});
