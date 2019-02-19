import express from "express";
import mongoose from "mongoose";
import path from "path";
require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
import resolvers from "./resolvers";
import typeDefs from "./typeDefs";
import Restaurant from "./models/restaurant";
import Review from "./models/review";

const { PORT = 4000, NODE_ENV = "development", DB_PASS, DB_USER } = process.env;
const IN_PROD = NODE_ENV === "production";

if (IN_PROD) {
  mongoose.connect(
    `mongodb://${DB_USER}:${DB_PASS}@ds245755.mlab.com:45755/restaurant-reviews`,
    err => {
      if (err) {
        console.log(err);
      }
    }
  );
} else {
  mongoose.connect(
    `mongodb://${DB_USER}:${DB_PASS}@ds341825.mlab.com:41825/restaurant-reviews-dev`,
    err => {
      if (err) {
        console.log(err);
      }
    }
  );
}

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

app.listen(PORT, () =>
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  )
);
