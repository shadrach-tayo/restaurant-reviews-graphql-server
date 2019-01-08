const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    address: String,
    neighborhood: String,
    latlng: {
      lat: Number,
      lng: Number
    },
    cuisine_type: String,
    operating_hours: {
      Monday: String,
      Tuesday: String,
      Wednesday: String,
      Thursday: String,
      Friday: String,
      Saturday: String,
      Sunday: String
    },
    is_favorite: Boolean
  },
  {
    timestamps: true
  }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
