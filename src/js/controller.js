import * as model from './model.js'; //importing everything from the model.js
import recipeView from './views/recipeView.js';

import 'core-js/stable'; // for polyfilling everything
import 'regenerator-runtime/runtime'; //for polyfilling async/await - converting to an ES5 feature

// const recipeContainer = document.querySelector('.recipe'); // it has been repalced by #parentElement in recipeView.js

// https://forkify-api.herokuapp.com/v2 // Project API

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); //this is getting the hash of the Id universally, the slice removes the first character which is #
    console.log(id);

    if (!id) return;

    recipeView.renderSpinner();

    // 1) Loading Recipe
    await model.loadRecipe(id); // we are not storing bcus the loadRecipe is not returning anything

    // 2) Rendering recipe
    recipeView.render(model.state.recipe); // render() is a method to render something
    // const recipeView = new recipeView(model.state.recipe); // we will do this assuming we didnt export we didnt create the new object from the recipeView module
  } catch (err) {
    console.log(err);
  }
};

// Publisher subscriber pattern
//handler will be in the the controller and listener is in the view.
const init = function () {
  recipeView.addHandlerRender(controlRecipes);
};
init();
