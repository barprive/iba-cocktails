// The purpose of this script is to generate
// a file for ingredients and a file for recipes linked to these ingredients
// from a single file containing recipes and ingredients
// INPUT: file containing a list of cocktail recipes
// OUTPUT:
// -- A file containing a dicitonary of the ingredients extracted from the input cocktail recipes
// -- A file containing the cocktail recipes from the input, but linked to the ingredients in the ingredients file generated

const _ = require('lodash');
const fs = require('fs');
const removeAccents = require('remove-accents-diacritics');

//// Open input point: cocktail recipes
const recipes = require('./recipes');
const categories = require('./categories');

/// Destination files for generated collections
const recipes_dest = "gen_cocktails.json"
const ingredients_dest = "gen_ingredients.json"
const categories_dest = "gen_categories.json"
const algolia_recipes_dest = "gen_algolia_cocktails.json"
const algolia_ingredients_dest = "gen_algolia_ingredients.json"
const algolia_categories_dest = "gen_algolia_categories.json"

//// Variables for both generated dictionaries of recipes and ingredients
var gen_recipes;
var gen_ingredients;
var gen_categories;
var gen_algolia_recipes;
var gen_algolia_ingredients;
var gen_algolia_categories;

//// Go get all the ingredients in the JSON recipes
var gen_ingredients = [];
var i = 1;
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

//// Sort ingredients so they are unique
gen_ingredients = _.uniqBy(gen_ingredients, "name");

//// Create slug for every ingredient
gen_ingredients = _.map(gen_ingredients, ingredient => {
  ingredient_duplicate = _.cloneDeep(ingredient);
  ingredient_duplicate.slug = removeAccents.remove(ingredient_duplicate.name).toLowerCase().replace(/ /g, "-").replace(/'/g, "").replace(/"/g, "");
  return ingredient_duplicate;
});

//// Sort ingredients by name
gen_ingredients = _.sortBy(gen_ingredients, [function(ing) { return ing.name; }]);

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
    ingredient.id = found.id;
    ingredient.ingredient = undefined;
    return ingredient;
  });
  return recipe_duplicate;
});

//// Create id for every cocktail
var i = 1;
gen_recipes = _.map(gen_recipes, recipe => {
  recipe_duplicate = _.cloneDeep(recipe);
  recipe_duplicate.id = i++;
  return recipe_duplicate;
});

//// Create slug for every cocktail
gen_recipes = _.map(gen_recipes, recipe => {
  recipe_duplicate = _.cloneDeep(recipe);
  recipe_duplicate.slug = removeAccents.remove(recipe_duplicate.name).toLowerCase().replace(/ /g, "-").replace(/'/g, "").replace(/"/g, "");
  return recipe_duplicate;
});

//// Get subset from cocktails attributes for Algolia
gen_algolia_recipes = _.map(gen_recipes, recipe => {
  algolia_recipe = {"name": "", "slug": "", "id": -1};
  algolia_recipe.name = recipe.name;
  algolia_recipe.id = recipe.id;
  algolia_recipe.slug = recipe.slug;
  return algolia_recipe;
});

//// Get subset from ingredients attributes for Algolia
gen_algolia_ingredients = _.map(gen_ingredients, ingredient => {
  algolia_ingredient = {"name": "", "id": -1};
  algolia_ingredient.name = ingredient.name;
  algolia_ingredient.id = ingredient.id;
  return algolia_ingredient;
});

//// Copy categories into generated file
var i = 1;
gen_categories = _.map(categories, category => {
  category_duplicate = _.cloneDeep(category);
  category_duplicate.slug = removeAccents.remove(category_duplicate.name).toLowerCase().replace(/ /g, "-").replace(/'/g, "").replace(/"/g, "");
  category_duplicate.id = i++;
  return category_duplicate;
});

//// Get subset from categories attributes for Algolia
gen_algolia_categories = _.map(gen_categories, category => {
  algolia_category = {"name": "", "slug": "", "id": -1};
  algolia_category.name = category.name;
  algolia_category.id = category.id;
  algolia_category.slug = category.slug;
  return algolia_category;
});

//// A few checks to emit warnings in case
console.log("WARNINGZONE WARNINGZONE WARNINGZONE WARNINGZONE WARNINGZONE\n");
var warningString = "";
_.each(gen_recipes, recipe => {
  recipe_duplicate = _.cloneDeep(recipe);
  if(recipe_duplicate.ingredients == undefined || recipe_duplicate.ingredients == []) {
    warningString += "No ingredients in cocktail "+recipe_duplicate.name+"\n";
  }
  if(recipe_duplicate.preparation == undefined || recipe_duplicate.preparation == "") {
    warningString += "No preparation in cocktail "+recipe_duplicate.name+"\n";
  }
});
console.log(warningString);
console.log("\nWARNINGZONE WARNINGZONE WARNINGZONE WARNINGZONE WARNINGZONE\n\n");

//// Write result to files
fs.writeFile(recipes_dest, JSON.stringify(gen_recipes, null, " "), err => {
  if (err) throw err;
  console.log('Cocktails recipes generated in '+recipes_dest);
});
fs.writeFile(ingredients_dest, JSON.stringify(gen_ingredients, null, " "), err => {
  if (err) throw err;
  console.log('Ingredients generated in '+ingredients_dest);
});
fs.writeFile(categories_dest, JSON.stringify(gen_categories, null, " "), err => {
  if (err) throw err;
  console.log('Categories generated in '+categories_dest);
});
fs.writeFile(algolia_recipes_dest, JSON.stringify(gen_algolia_recipes, null, " "), err => {
  if (err) throw err;
  console.log('Cocktails recipes for Algolia generated in '+algolia_recipes_dest);
});
fs.writeFile(algolia_ingredients_dest, JSON.stringify(gen_algolia_ingredients, null, " "), err => {
  if (err) throw err;
  console.log('Ingredients for Algolia generated in '+algolia_ingredients_dest);
});
fs.writeFile(algolia_categories_dest, JSON.stringify(gen_algolia_categories, null, " "), err => {
  if (err) throw err;
  console.log('Categories for Algolia generated in '+algolia_categories_dest);
});
