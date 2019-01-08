import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    getReviews: [Review!]
    getReview(id: String!): Review
  }

  extend type Mutation {
    createReview(
      restaurant_id: Int!
      name: String!
      rating: Int!
      comments: String!
    ): Review

    createReviews(reviews: [ReviewInput]): [Review]
  }

  type Review {
    id: Int
    rating: Int
    name: String
    _id: ObjectID
    createdAt: Date
    updatedAt: Date
    comments: String
    restaurant_id: Int
  }

  input ReviewInput {
    id: Int
    rating: Int
    name: String
    updatedAt: Date
    comments: String
    restaurant_id: Int
  }
`;
