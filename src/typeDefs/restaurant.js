import { gql } from "apollo-server-express";

export default gql`
  scalar Date
  scalar ObjectID

  extend type Query {
    getRestaurants: [Restaurant!]!
    getRestaurant(id: ID!): Restaurant
  }

  input LocationInput {
    lat: Float
    lng: Float
  }

  input HoursInput {
    Monday: String
    Tuesday: String
    Wednesday: String
    Thursday: String
    Friday: String
    Saturday: String
    Sunday: String
  }

  input RestaurantInput {
    id: Int
    name: String
    neighborhood: String
    address: String
    latlng: LocationInput
    cuisine_type: String
    operating_hours: HoursInput
    createdAt: Date
    updatedAt: Date
    is_favorite: Boolean
    photograph: String
  }

  extend type Mutation {
    createRestaurant(
      name: String
      neighborhood: String
      address: String
      latlng: LocationInput
    ): Restaurant
    createRestaurants(restaurants: [RestaurantInput]): [Restaurant]
  }

  type Restaurant {
    _id: ObjectID
    id: Int
    name: String
    neighborhood: String
    address: String
    latlng: Location
    cuisine_type: String
    operating_hours: Hours
    createdAt: Date
    updatedAt: Date
    is_favorite: Boolean
    photograph: String
  }

  type Location {
    lat: Float
    lng: Float
  }

  type Hours {
    Monday: String
    Tuesday: String
    Wednesday: String
    Thursday: String
    Friday: String
    Saturday: String
    Sunday: String
  }
`;
