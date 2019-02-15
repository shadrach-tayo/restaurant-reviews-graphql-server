import express from "express";
import mongoose from "mongoose";
import path from "path";
require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
import resolvers from "./resolvers";
import typeDefs from "./typeDefs";
import Restaurant from "./models/restaurant";
import Review from "./models/review";

const { port = 3000, NODE_ENV = "development", DB_PASS, DB_USER } = process.env;

console.log(DB_PASS, DB_USER);

mongoose.connect(
  `mongodb://${DB_USER}:${DB_PASS}@ds245755.mlab.com:45755/restaurant-reviews`,
  err => {
    if (err) {
      console.log(error);
    }
  }
);

const IN_PROD = NODE_ENV === "production";

const app = express();

app.use(express.static(path.join(__dirname, "../client/dist")));
const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: !IN_PROD,
  debug: !IN_PROD,
  context: { Restaurant, Review }
});

server.applyMiddleware({ app });

app.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  )
);
