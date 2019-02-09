import ReviewsForm from "./reviewsform";
import RestaurantsDb from "./restaurantdb";
/**
 * RestaurantInfo -> controller for the restaurant page
 */
class RestaurantInfo {
  constructor() {
    this.initMap();
    this.reviewList = document.getElementById("reviews-list");
  }

  /**
   * Initialize leaflet map
   */
  initMap() {
    this.fetchRestaurantFromURL()
      .then(restaurant => {
        this.restaurant = restaurant;

        // calling method to create new reviews to access the restaurant id props
        this.initReviewsForm(
          this,
          restaurant.id,
          document.querySelector(".reviews-form--container")
        );

        this.newMap = L.map("map", {
          center: [restaurant.latlng.lat, restaurant.latlng.lng],
          zoom: 16,
          scrollWheelZoom: false
        });
        L.tileLayer(
          "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",
          {
            mapboxToken:
              "pk.eyJ1Ijoic2hhZHJhY2gxOTk5IiwiYSI6ImNqa2VxamJyNjAwOWgzamw3NTVrbnczYTAifQ.9XTn2MpN632TEngZkjqOPA",
            maxZoom: 18,
            attribution:
              'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
              '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: "mapbox.streets"
          }
        ).addTo(this.newMap);
        this.fillBreadcrumb();
        RestaurantsDb.mapMarkerForRestaurant(this.restaurant, this.newMap);
      })
      .catch(err => console.error(err, "could not fetch restaurant from url"));
  }

  /**
   * Initialize new reviews form for the restaurant
   */
  initReviewsForm(restaurantInfo = this, restaurant_id, formContainer) {
    this.reviewsForm = new ReviewsForm(
      restaurantInfo,
      restaurant_id,
      formContainer
    );
  }

  /**
   * Method to get current restaurant from page URL.
   */
  fetchRestaurantFromURL() {
    return new Promise((resolve, reject) => {
      if (this.restaurant) {
        // restaurant already fetched!
        resolve(this.restaurant);
        return;
      }
      const id = Number(this.getParameterByName("id"));
      if (!id) {
        // no id found in URL
        let error = "No restaurant id in URL";
        reject(error);
      } else {
        return RestaurantsDb.fetchRestaurantById(id)
          .then(restaurant => {
            this.restaurant = restaurant;
            this.fillRestaurantHTML();
            resolve(restaurant);
          })
          .catch(err => reject(err));
      }
    });
  }

  /**
   * Create restaurant HTML and add it to the webpage
   */
  fillRestaurantHTML(restaurant = this.restaurant) {
    const name = document.getElementById("restaurant-name");
    name.innerHTML = restaurant.name;

    const address = document.getElementById("restaurant-address");
    address.innerHTML = restaurant.address;

    const image = document.getElementById("restaurant-img");
    image.className = "restaurant-img";
    image.src = `img/${restaurant.photograph}_small.jpg`;
    image.sizes = `(min-width: 600px) 50vw, (min-width: 500px) 100vw', 100vw`;
    image.srcset = `img/${restaurant.photograph}_small.jpg 100w, img/${
      restaurant.photograph
    }.jpg 200w`;
    image.alt = restaurant.name;

    const cuisine = document.getElementById("restaurant-cuisine");
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
      this.fillRestaurantHoursHTML();
    }
    // fill reviews
    this.fillReviewsHTML();
  }

  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  fillRestaurantHoursHTML(operatingHours = this.restaurant.operating_hours) {
    const hours = document.getElementById("restaurant-hours");
    for (let key in operatingHours) {
      const row = document.createElement("tr");

      const day = document.createElement("td");
      day.innerHTML = key;
      row.appendChild(day);

      const time = document.createElement("td");
      time.innerHTML = operatingHours[key];
      row.appendChild(time);

      hours.appendChild(row);
    }
  }

  /**
   * Create all reviews HTML and add them to the webpage.
   */
  fillReviewsHTML(id = this.restaurant.id) {
    const getReviews = this.fetchReviews(id);
    getReviews.then(async reviews => {
      const pendingReviews = await this.getPendingReviews();
      const container = document.getElementById("reviews-container");
      const title = document.createElement("h2");
      title.innerHTML = "Reviews";
      container.appendChild(title);

      if (reviews.length === 0) {
        const noReviews = document.createElement("p");
        noReviews.innerHTML = "No reviews yet!";
        container.appendChild(noReviews);
        return;
      }

      // concat the reviews and pending review before rendering
      reviews = reviews.concat(pendingReviews);

      reviews.forEach(review => {
        this.reviewList.appendChild(this.createReviewHTML(review));
      });
      container.appendChild(this.reviewList);
    });
  }

  /**
   * Get Restaurant Pending reviews in the database if there is?
   */
  getPendingReviews() {
    return RestaurantsDb.getPendingReviews(this.restaurant.id);
  }

  /**
   * Method to display review and add to database
   */
  addReview(review) {
    this.renderReview(review);
    RestaurantsDb.saveReview(review);
  }

  /**
   * Method to render newly created review
   */
  renderReview(review) {
    this.reviewList.appendChild(this.createReviewHTML(review));
  }

  /**
   * Fetch Restaurant Review from Database
   */
  fetchReviews(id) {
    return RestaurantsDb.fetchReviews(id);
  }

  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML(review) {
    const li = document.createElement("li");
    const listHead = document.createElement("div");
    listHead.classList.add("reviews-list__heading");
    const name = document.createElement("p");
    name.classList.add("reviews-list__name");
    name.innerHTML = review.name[0].toUpperCase() + review.name.substr(1);
    listHead.appendChild(name);

    const date = document.createElement("p");
    const updatedAt = review.updatedAt || new Date();
    let d = new Date(updatedAt);
    date.innerHTML = d.toString().substr(0, 15);
    date.classList.add("reviews-list__date");
    listHead.appendChild(date);
    li.appendChild(listHead);

    const listBody = document.createElement("div");
    listBody.classList.add("reviews-list__body");
    const rating = document.createElement("p");
    rating.innerHTML = `Rating: ${review.rating}`;
    rating.classList.add("reviews-list__rating");
    listBody.appendChild(rating);

    const comments = document.createElement("p");
    comments.innerHTML = review.comments;
    listBody.appendChild(comments);
    li.appendChild(listBody);
    return li;
  }

  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb(restaurant = this.restaurant) {
    const breadcrumb = document.getElementById("breadcrumb");
    const li = document.createElement("li");
    li.setAttribute("aria-current", "page");
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
  }

  /**
   * Get a parameter by name from page URL.
   */
  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  // class ends here
}
const restaurantInfo = new RestaurantInfo();
