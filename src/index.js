import express from "express";
import mongoose from "mongoose";
require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
import resolvers from "./resolvers";
import typeDefs from "./typeDefs";
import Restaurant from "./models/restaurant";
import Review from "./models/review";

const { PORT = 3000, NODE_ENV = "development", DB_PASS, DB_USER } = process.env;

mongoose.connect(
  `mongodb://${DB_USER}:${DB_PASS}@ds245755.mlab.com:45755/restaurant-reviews`
);

// mongoose.connection.on('')

const IN_PROD = NODE_ENV === "production";

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: !IN_PROD,
  context: { Restaurant, Review }
});

server.applyMiddleware({ app });

app.listen({ port: PORT }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  )
);
