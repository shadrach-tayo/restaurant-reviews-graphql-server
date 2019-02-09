import GraphQLClient from "./graphql-client";

/**
 * class handles Fetching remote resources for the Restaurant app
 */
export default class RestaurantFetch {
  static get getAllRestaurantsQuery() {
    return `
    query {
      getAllRestaurants {
        id
        name
        address
        cuisine_type
        neighborhood
        is_favorite
        photograph
        latlng {
          lat
          lng
        }
        operating_hours {
          Monday
          Tuesday
          Wednesday
          Thursday
          Friday
          Saturday
          Sunday
        }
        createdAt
        updatedAt
      }
    }
    `;
  }

  static get getRestaurantQuery() {
    return `
    query($id: Int!) {
      getRestaurant(id: $id) {
        id
        name
        address
        cuisine_type
        neighborhood
        is_favorite
        photograph
        latlng {
          lat
          lng
        }
        operating_hours {
          Monday
          Tuesday
          Wednesday
          Thursday
          Friday
          Saturday
          Sunday
        }
        createdAt
        updatedAt
      }
    }
    `;
  }

  static get getReviewsQuery() {
    return `
    query($restaurant_id: Int!) {
      getReviews(restaurant_id: $restaurant_id){
        id
        name
        rating
        comments
        createdAt
        updatedAt
        restaurant_id
      }
    }
    `;
  }

  static get getAllReviewsQuery() {
    return `
    query {
      getAllReviews {
        id
        name
        rating
        comments
        createdAt
        updatedAt
        restaurant_id
      }
    }
    `;
  }

  static get setFavouriteMutation() {
    return `
    mutation($id: Int!, $is_favorite: Boolean!) {
      setFavorite(id: $id, is_favorite: $is_favorite) {
        id
        name
        is_favorite
      }
    }
    `;
  }

  static get createReviewQuery() {
    return `
    mutation($name: String!, $restaurant_id: Int!, $rating: Int!, $comments: String!) {
      createReview(name: $name, restaurant_id: $restaurant_id, rating: $rating, comments: $comments) {
        id
        name
        rating
        comments
        restaurant_id
      }
    }
    `;
  }

  static getAllRestaurants() {
    const getAllRestaurants = this.client.request(this.getAllRestaurantsQuery);
    return getAllRestaurants.then(res => {
      return res.data.getAllRestaurants;
    });
  }

  static getRestaurant(id = 0) {
    const getRestaurant = this.client.request(this.getRestaurantQuery, { id });
    return getRestaurant.then(res => {
      return res.data.getRestaurant;
    });
  }

  static getAllReviews() {
    const getAllReviews = this.client.request(this.getAllReviewsQuery);
    return getAllReviews.then(res => {
      return res.data.getAllReviews;
    });
  }

  static getReviews(restaurant_id) {
    const getReviews = this.client.request(this.getReviewsQuery, {
      restaurant_id
    });
    return getReviews.then(res => {
      return res.data.getReviews;
    });
  }

  static createReview(review) {
    const createReview = this.client.request(this.createReviewQuery, review);
    return createReview
      .then(res => {
        return res.data.createReview;
      })
      .catch(err => console.log(err));
  }

  static createReviews(reviews) {
    return Promise.all(reviews.map(review => this.createReview(review))).then(
      responses => responses
    );
  }

  static setFavourite(id, is_favorite) {
    const setFavorite = this.client.request(this.setFavouriteMutation, {
      id,
      is_favorite
    });
    return setFavorite.then(res => {
      return res.data.setFavorite;
    });
  }
}

const port = 4000;
RestaurantFetch.client = new GraphQLClient(`http://localhost:{{PORT}}/graphql`);
