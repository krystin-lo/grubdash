const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");




function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    res.locals.dishId = dishId;
    return next();
  }
  return next({
    status: 404,
    message: `Dish id not found ${req.params.dishId}`,
  });
}

//Dish validation
function isValidDish(req, res, next) {
  const requiredFields = ["name", "description", "price", "image_url"];
  for (const field of requiredFields) {
//If the field is not validated return error
    if (!req.body.data[field]) {
      next({
        status: 400,
        message: `Dish must include a ${field}`,
      });
      return;
    }
  }
  next();
}

//Price validation
function isValidPrice(req, res, next) {
//If price is not a positive number return error
  if (req.body.data.price < 0 || typeof req.body.data.price !== "number") {
    return next({
      status: 400,
      message: "Field 'price' must be a number above zero",
    });
  }
  next();
}

//Id validation
function isValidId(req, res, next) {
//if current dish id does not match updated dish id return error
  if (req.body.data.id && req.body.data.id !== res.locals.dishId) {
    return next({
      status: 400,
      message: `id ${req.body.data.id} does not match ${res.locals.dishId}`,
    });
  }
  next();
}


function list(req, res) {
  res.json({ data: dishes });
}

function create(req, res) {
  const { data: { name, price, description, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(), //function gives a new id to new dish
    name,
    price,
    description,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res) {
  const { data: { name, price, description, image_url } = {} } = req.body;

  res.locals.dish.name = name;
  res.locals.dish.price = price;
  res.locals.dish.description = description;
  res.locals.dish.image_url = image_url;

  res.json({ data: res.locals.dish });
}

module.exports = {
    list,
    create: [isValidDish, isValidPrice, isValidId, create],
    read: [dishExists, read],
    update: [dishExists, isValidDish, isValidPrice, isValidId, update],
};