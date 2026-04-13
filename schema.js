// const joi=require('joi');
// const Joi = require('joi');

// module.exports.listingSchema = Joi.object({
//     listing : Joi.object({
//   title : Joi.string().required(),
//    description : Joi.string().required(),
//    location : Joi.string().required(),
//   country: Joi.string().required(),
//    price : Joi.number().required().min(0),
//    img : Joi.string().allow("",null),
// }).required(),

// });

const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    
    // 🍀 PRICE VALIDATION (Allow anything but must be numbers at final)
    price: Joi.string()
      .pattern(/^[0-9]+$/)
      .message("Price must contain only numbers")
      .required()

  }).required()
});

// const Joi = require("joi");

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required()
  }).required()
});

module.exports = { reviewSchema };  // ✅ export as object
