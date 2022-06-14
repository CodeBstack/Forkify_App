// CONTROLLER controls the app.....it calls the model and views only

import * as model from './model.js'; //importing everything from the model.js
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable'; // for polyfilling everything
import 'regenerator-runtime/runtime'; //for polyfilling async/await - converting to an ES5 feature
import { async } from 'regenerator-runtime';

// This is coming from parcel
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); //this is getting the hash of the Id universally, the slice removes the first character which is #
    // console.log(id);

    if (!id) return;

    recipeView.renderSpinner();

    // 0) Update results view to mark selected search
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    // debugger;    // for debugging
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading Recipe
    await model.loadRecipe(id); // we are not storing bcus the loadRecipe is not returning anything

    // 3) Rendering recipe
    recipeView.render(model.state.recipe); // render() is a method to render something
    // const recipeView = new recipeView(model.state.reciXDpe); // we will do this assuming we didnt export we didnt create the new object from the recipeView module
  } catch (err) {
    console.log(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(`${query}`);

    // 3) Rendering results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination  buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination  buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // console.log(model.state.recipe);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Re-render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL - pushState(state, title, url)
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back();  //going back to the last page.

    // close form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
    //
  } catch (err) {
    console.log('💥💥💥', err);
    addRecipeView.renderError(err.message);
  }
};

// Publisher subscriber pattern
//handler will be in the the controller and listener is in the view.
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
