import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    getAllReviews: [Review!]!
    getReviews(restaurant_id: Int!): [Review!]!
  }

  extend type Mutation {
    createReview(
      restaurant_id: Int!
      name: String!
      rating: Int!
      comments: String!
    ): Review

    createReviews(reviews: [ReviewInput!]!): [Review!]!

    updateReview(update: UpdateReviewInput): Review
  }

  type Review {
    id: Int!
    rating: Int
    name: String!
    _id: ObjectID
    createdAt: Date
    updatedAt: Date
    comments: String!
    restaurant_id: Int!
  }

  input ReviewInput {
    rating: Int!
    name: String!
    comments: String!
    restaurant_id: Int!
  }

  input UpdateReviewInput {
    id: Int!
    rating: Int
    name: String
    comments: String
  }
`;
