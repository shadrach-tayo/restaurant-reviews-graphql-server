## Restaurant Reviews Progressive Web App

---

Restaurants reviews PWA final project for Udacity Mobile web specialist Nanodegree Using GraphQL (no dependencies)

## Motivation

---

After learning how to use GraphQL in both backend and frontend use cases and building little projects following the [how to graphql](https://www.howtographql.com/) tutorial, I felt the implement what I have learnt both server-side and client-side for the knowledge to stick.
so I rewrote the [server](https://github.com/shadrach-tayo/restaurant-reviews-graphql-server) for scratch using GraphQL then i needed to re-implement the client to be compatible with the new server. So i wrote my own tiny vanilla-js GraphQL client library which is just a wrapper around fetch the used it in the [RestaurantFetch](https://github.com/shadrach-tayo/mws-stage-3/blob/graphql/js/restaurantfetch.js) Class responsible for fetching remote resources in the PWA.

## Tech / Frameworks used

---

- [Idb](https://github.com/jakearchibald/idb)

## Installation

---

To get this server running locally in your terminal:

- `git clone https://github.com/shadrach-tayo/restaurant-reviews-graphql-server.git` to clone the repo.
- `npm start` to start client server
