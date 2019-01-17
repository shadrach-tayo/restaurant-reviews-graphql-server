const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const reviewSchema = new mongoose.Schema(
  {
    name: String,
    comments: String,
    rating: Number,
    restaurant_id: Number
  },
  {
    timestamps: true
  }
);

reviewSchema.plugin(AutoIncrement, { inc_field: "id" });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
