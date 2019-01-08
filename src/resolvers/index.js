import { GraphQLScalarType } from "graphql";
import mongoose from "mongoose";
const { kind } = require("graphql/language");

const { ObjectID } = mongoose.Types;

export default {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date type",
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === kind.INT) {
        return new Date(ast.value);
      }
      return null;
    }
  }),

  ObjectID: new GraphQLScalarType({
    name: "ObjectID",
    description:
      "The `ObjectID` scalar type represents a [`BSON`](https://en.wikipedia.org/wiki/BSON) ID commonly used in `mongodb`.",
    serialize(_id) {
      if (typeof _id !== "string") {
        return _id;
      } else if (_id instanceof ObjectID) {
        return _id.toHexString();
      } else {
        throw new Error(
          `${
            Object.getPrototypeOf(_id).constructor.name
          } not convertible to ObjectID`
        );
      }
    },
    parseValue(_id) {
      if (typeof _id === "string") {
        return ObjectID.createFromHexString(_id);
      }
      throw new Error(`${typeof _id} not convertible to ObjectID`);
    },
    parseLiteral(ast) {
      if (ast.kind === kind.STRING) {
        return ObjectID.createFromHexString(_id);
      }
      throw new Error(`${ast.kind} not convertible to ObjectID`);
    }
  }),

  Query: {
    getRestaurants: async (parent, args, { Restaurant }) => {
      let restaurants = await Restaurant.find();
      restaurants = restaurants.map(restaurant => ({
        _id: restaurant._id.toString(),
        ...restaurant
      }));
      return restaurants;
    },

    getRestaurant: async (parent, { id }, { Restaurant }) => {
      const restaurant = Restaurant.findById(id);

      return restaurant;
    },

    getReviews: async (parent, args, { Review }) => {
      let reviews = await Review.find();
      reviews = reviews.map(review => {
        review._id = review._id.toString();
        return review;
      });
      return reviews;
    },

    getReview: async (parent, { id }, { Review }) => {
      const review = Review.findById(id);
      return review;
    }
  },

  Mutation: {
    createRestaurant: async (parent, args, { Restaurant }) => {
      let restaurant = await new Restaurant(args).save();
      return restaurant;
    },

    createRestaurants: async (parent, { restaurants }, { Restaurant }) => {
      const promise = await Promise.all(
        restaurants.map(restaurant => new Restaurant(restaurant).save())
      );
      return promise;
    },

    createReview: async (
      parent,
      { name, rating, restaurant_id, comments },
      { Review }
    ) => {
      let review = await new Review({
        name,
        rating,
        restaurant_id,
        comments
      }).save();
      return review;
    },

    createReviews: async (parent, { reviews }, { Review }) => {
      const promise = await Promise.all(
        reviews.map(review => new Review(review).save())
      );
      return promise;
    }
  }
};
