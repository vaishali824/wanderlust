// const mongoose=require("mongoose");
// const Schema =mongoose.Schema;

// const listingSchema=new Schema({
//     title:{
//         type:String,
//         require:true,
//     },

//    description:{
//     type:String,
//     // require:true,
//    },

//     image:{
//         filename:{
//             type:String,
//           default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQobZZGlMRPZQCRH-laZTLrhJgnHhxgIA7VZA&s",
//     },
//         url:{

//       type :String,
//         default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQobZZGlMRPZQCRH-laZTLrhJgnHhxgIA7VZA&s",

//         }
    
//  },
//    price:String,
//     // {
//     //     type: String,
//     //     required: [true, "Price is required"],
//     //     validate: {
//     //         validator: function (value) {
//     //             return /^[0-9]+$/.test(value);  // Only digits allowed
//     //         },
//     //         message: "Price must contain only numbers"
//     //     }
//     // }
//     location:String,
//     country:String,
// });

// const Listing=mongoose.model("Listing",listingSchema);
// module.exports=Listing;



// const mongoose = require("mongoose");

// const listingSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, "Title is required"]
//   },
//   description: {
//     type: String,
//     required: [true, "Description is required"]
//   },
//   image: {
//     url: {
//       type: String,
//       default: "https://images.unsplash.com/photo-default",
//       validate: {
//         validator: (v) => /^https?:\/\//.test(v),
//         message: "Image URL must start with http or https"
//       }
//     }
//   },
//   price: {
//     type: Number,
//     min: [0, "Price cannot be negative"],
//     required: [true, "Price is required"]
//   },
//   location: {
//     type: String,
//     required: [true, "Location is required"]
//   },
//   country: {
//     type: String,
//     required: [true, "Country is required"],
//     validate: {
//       validator: (val) => /^[A-Za-z\s]+$/.test(val),
//       message: "Country must contain only letters"
//     },
//     reviews:{
//         type: Schema.Types.ObjectId,
//         ref:"Review",
//     },
//   },
// });

// module.exports = mongoose.model("Listing", listingSchema);







const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"]
  },

  description: {
    type: String,
    required: [true, "Description is required"]
  },

  image: {
    url: String,
    filename: String
  },

  price: {
    type: Number,
    min: [0, "Price cannot be negative"],
    required: [true, "Price is required"]
  },

  location: {
    type: String,
    required: [true, "Location is required"]
  },

  country: {
    type: String,
    required: [true, "Country is required"],
    validate: {
      validator: (val) => /^[A-Za-z\s]+$/.test(val),
      message: "Country must contain only letters"
    }
  },

  // ✅ reviews must be OUTSIDE country
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing){
   
    await Review.deleteMany({_id: {$in: listing.reviews}});

}
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;