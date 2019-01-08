const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: String,
    id: Number,
    comments: String,
    rating: Number,
    restaurant_id: Number
  },
  {
    timestamps: true
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
