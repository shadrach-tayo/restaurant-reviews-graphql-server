class GraphQLClient {
  constructor(baseURI, options = {}) {
    this.url = baseURI;
    this.options = Object.assign({}, options, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      }
    });
  }

  request(query, variables = {}) {
    const { method, headers, ...rest } = this.options;
    const objParam = Object.assign(
      {},
      {
        method,
        headers,
        body: JSON.stringify({ query, variables }),
        ...rest
      }
    );

    const f = fetch(this.url, objParam)
      .then(res => res.json())
      .then(res => {
        if (!res.error && res.data) {
          return res;
        } else {
          return res.error;
        }
      });

    return f;
  }
}

/**
 * class handles Fetching remote resources for the Restaurant app
 */
class RestaurantFetch {
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
RestaurantFetch.client = new GraphQLClient(`${window.location.origin}/graphql`);

class Notifier {
  constructor() {
    this.dom = document.getElementById("notifier-dom");
    this.notifications = [];
    this.trackNum = 0;
  }

  show(message, { classname } = { classname: "success" }, timeout) {
    const id = this.trackNum++;
    const notification = document.createElement("div");
    notification.setAttribute("id", id);
    notification.classList.add("notification", classname);
    const notificationImage = document.createElement("img");
    notificationImage.src = `../img/network${classname}.svg`;
    notificationImage.alt =
      classname == "success"
        ? "Network connection is restored"
        : "No network connection";
    notificationImage.classList.add("notification--image");
    const imageContainer = document.createElement("div");
    imageContainer.appendChild(notificationImage);
    const p = document.createElement("p");
    p.textContent = message;
    notification.appendChild(imageContainer);
    notification.appendChild(p);
    if (!timeout) {
      let dismissBtn = document.createElement("button");
      dismissBtn.textContent = "dismiss";
      dismissBtn.addEventListener(
        "click",
        () => {
          this.removeNotification(id);
        },
        false
      );
      notification.appendChild(dismissBtn);
    } else {
      setTimeout(() => {
        this.removeNotification(id);
      }, timeout);
    }
    this.notifications.push(notification);
    this.dom.insertBefore(notification, this.dom.firstChild);
  }

  removeNotification(id) {
    let notificationToRemove = this.notifications.filter(
      r => r.getAttribute("id") == id
    )[0];
    this.notifications = this.notifications.filter(
      n => n != notificationToRemove
    );
    this.dom.removeChild(notificationToRemove);
    this.trackNum--;
  }
}

var Notifier$1 = new Notifier();

/**
 * Common database helper functions.
 */
class RestaurantsDb {
  static get DBNAME() {
    return "restaurants-store";
  }

  static get RESTAURANTS_STORE() {
    return "restaurants";
  }

  static get REVIEWS_STORE() {
    return "reviews";
  }

  static get PENDING_REVIEWS_STORE() {
    return "pending-reviews";
  }

  static get ID_INDEX() {
    return "id";
  }

  static get REVIEWS_INDEX() {
    return "restaurant_id";
  }

  /*
   * Method to open Database
   */
  static openDatabase() {
    if (!navigator.serviceWorker) {
      console.warn("[service-worker] is not supported in this browser");
      return;
    }
    return idb.open(this.DBNAME, 1, upgradeDb => {
      if (!upgradeDb.objectStoreNames.contains(this.RESTAURANTS_STORE)) {
        const store = upgradeDb.createObjectStore(this.RESTAURANTS_STORE, {
          keyPath: this.ID_INDEX
        });
        store.createIndex(this.ID_INDEX, this.ID_INDEX);
      }

      if (!upgradeDb.objectStoreNames.contains(this.REVIEWS_STORE)) {
        const objs = upgradeDb.createObjectStore(this.REVIEWS_STORE, {
          keyPath: this.ID_INDEX
        });
        objs.createIndex(this.ID_INDEX, this.REVIEWS_INDEX);
      }

      if (!upgradeDb.objectStoreNames.contains(this.PENDING_REVIEWS_STORE)) {
        const objs = upgradeDb.createObjectStore(this.PENDING_REVIEWS_STORE, {
          autoIncrement: true
        });
      }
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    // get the database instance and open a transaction in the
    // this.RESTAURANTS_STORE object store and return all;
    // first attempt to fetch from database
    // if not successfull, try fetch from the network
    return this.dbPromise
      .then(db => {
        let tx = db.transaction(this.RESTAURANTS_STORE);
        let store = tx.objectStore(this.RESTAURANTS_STORE);
        return store.getAll();
      })
      .then(response => {
        if (response.length > 0) return response;
        return RestaurantFetch.getAllRestaurants();
      })
      .then(response => {
        this.addRestaurantsToDb(response);
        return response;
      })
      .catch(err => console.error(err));
  }

  /**
   * Fetch a single restaurant by id
   */
  static fetchRestaurant(id = 0) {
    return this.dbPromise.then(async db => {
      const store = db
        .transaction(this.RESTAURANTS_STORE)
        .objectStore(this.RESTAURANTS_STORE);
      const idIndex = store.index("id");
      // +id --> coerce the value of id to type Number if it's a string
      return idIndex.get(+id);
    });
  }

  /**
   * Method to get all restaurants the database
   */

  static fetchRestaurantsFromDb() {
    return this.dbPromise.then(async db => {
      let tx = db.transaction(this.RESTAURANTS_STORE);
      let store = tx.objectStore(this.RESTAURANTS_STORE);
      return store.getAll();
    });
  }

  /**
   * Method to Add restaurants to Database
   */
  static addRestaurantsToDb(restaurants) {
    this.dbPromise.then(async db => {
      let tx = db.transaction(this.RESTAURANTS_STORE, "readwrite");
      let store = tx.objectStore(this.RESTAURANTS_STORE);
      await restaurants.forEach(res => store.put(res));
      return tx.complete;
    });
  }

  /**
   * Fetch a restaurant by its ID.
   * TODO: change to query data from database by id
   */
  static fetchRestaurantById(id) {
    return this.fetchRestaurant(id)
      .then(restaurant => {
        if (restaurant !== undefined) {
          return restaurant;
        } else {
          return RestaurantFetch.getRestaurant(id);
        }
      })
      .catch(err => console.log(err));
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    // Fetch all restaurants  with proper error handling
    this.fetchRestaurants()
      .then(restaurants => {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      })
      .catch(err => err);
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    return this.fetchRestaurants()
      .then(restaurants => {
        // filter restaurants to have only given neighbourhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        return results;
      })
      .catch(err => console.log(err));
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    // Fetch all restaurants
    return this.fetchRestaurants()
      .then(restaurants => {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        return results;
      })
      .catch(err => console.log(err));
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {
    // Fetch all restaurants
    return this.fetchRestaurants()
      .then(restaurants => {
        // Get all neigbhourhoods from the restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // filter to remove unique neigbhourhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        return uniqueNeighborhoods;
      })
      .catch(err => console.error(err, " : couldn't fetch neighbourhoods"));
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines() {
    // Fetch all restaurants
    return this.fetchRestaurants()
      .then(restaurants => {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        return uniqueCuisines;
      })
      .catch(err => console.log(err));
  }

  /**
   * Fetch review from database
   * @param {string} id
   */
  static fetchReviews(id) {
    return this.dbPromise
      .then(db => {
        return db
          .transaction(this.REVIEWS_STORE)
          .objectStore(this.REVIEWS_STORE)
          .index(this.ID_INDEX)
          .getAll(+id);
      })
      .then(reviews => {
        if (reviews === undefined || reviews.length === 0)
          return this.fetchReviewsFromNetwork(id);
        return reviews;
      });
  }

  /**
   * Fetch review from network
   * @param {string} id
   */
  static fetchReviewsFromNetwork(id) {
    return RestaurantFetch.getReviews(id)
      .then(reviews => {
        this.saveReviews(reviews);
        return reviews;
      })
      .catch(err => console.log("fetch review failed: ", err));
  }

  /**
   * Method to clear pending reviews objectstore in the database
   */
  static clearPendingReviews() {
    this.dbPromise.then(db => {
      return db
        .transaction(this.PENDING_REVIEWS_STORE, "readwrite")
        .objectStore(this.PENDING_REVIEWS_STORE)
        .clear();
    });
  }

  static saveReviews(reviews) {
    this.dbPromise.then(db => {
      let store = db
        .transaction(this.REVIEWS_STORE, "readwrite")
        .objectStore(this.REVIEWS_STORE);
      reviews.forEach(review => store.put(review));
    });
  }

  /**
   * Method to save single review
   */
  static saveReview(review) {
    this.dbPromise.then(db => {
      return db
        .transaction(this.REVIEWS_STORE, "readwrite")
        .objectStore(this.REVIEWS_STORE)
        .put(review);
    });
  }

  /**
   * Saves an array of review objects to the reviews object store at once
   */
  static saveReviews(reviews) {
    return Promise.all(reviews.map(review => this.saveReview(review)));
  }

  static savePendingReview(review) {
    this.dbPromise.then(db => {
      return db
        .transaction(this.PENDING_REVIEWS_STORE, "readwrite")
        .objectStore(this.PENDING_REVIEWS_STORE)
        .put(review);
    });
  }

  static sendPendingReviews() {
    let pendingReviews = [];
    this.dbPromise
      .then(db => {
        return db
          .transaction(this.PENDING_REVIEWS_STORE)
          .objectStore(this.PENDING_REVIEWS_STORE)
          .getAll();
      })
      .then(async reviews => {
        if (reviews.length > 0) {
          pendingReviews = pendingReviews.concat(reviews);
          const netReviews = await RestaurantFetch.createReviews(
            pendingReviews
          );

          return netReviews;
        }
        return;
      })
      .then(async reviews => {
        if (reviews) {
          await this.saveReviews(reviews);
          await this.clearPendingReviews();
        }
      });
  }

  static getPendingReviews(id) {
    return this.dbPromise
      .then(db => {
        return db
          .transaction(this.PENDING_REVIEWS_STORE)
          .objectStore(this.PENDING_REVIEWS_STORE)
          .getAll();
      })
      .then(pending => {
        if (pending) {
          pending = pending.filter(review => review.restaurant_id === +id);
        }
        return pending;
      });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return restaurant.photograph;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, newMap) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: this.urlForRestaurant(restaurant)
      }
    );
    marker.addTo(newMap);
    return marker;
  }

  static updateRestaurant(restaurant) {
    return this.dbPromise.then(db => {
      db.transaction(this.RESTAURANTS_STORE, "readwrite")
        .objectStore(this.RESTAURANTS_STORE)
        .put(restaurant);
    });
  }
}

RestaurantsDb.dbPromise = RestaurantsDb.openDatabase();
if (navigator.connection) {
  navigator.connection.onchange = function networkChanged() {
    if (navigator.onLine) {
      RestaurantsDb.sendPendingReviews();
      Notifier$1.show("Seems you're back online", { classname: "success" }, 3000);
    } else {
      Notifier$1.show("Seems you're offline", { classname: "error" }, 3000);
    }
  };
}

class ReviewsForm {
  constructor(context, restaurantId, formContainer) {
    this.context = context;
    this.restaurant_id = restaurantId;
    this.formContainer = formContainer;
    this.form = formContainer.querySelector("#reviews-form");
    this.formOverlay = formContainer.querySelector(".reviews-form--overlay");
    this.addReviewButton = document.querySelector(".add-review--button");
    this.name = document.querySelector("#reviews-name");
    this.rating = document.querySelector("#reviews-rating");
    this.comments = document.querySelector("#reviews-comment");
    this.submitBtn = document.querySelector("#reviews-submit");
    this.closeBtn = document.querySelector("#js-close-btn");

    // form animation keys
    this.formAnimationKeys = [
      { display: "grid", transform: "scale(.5)", opacity: "0" },
      {
        display: "grid",
        transform: "scale(1)",
        opacity: "1",
        easing: "cubic-bezier(.35,.97,.13,1.14)"
      }
    ];

    // create form animation and pause it
    this.formAnimation = this.form.animate(this.formAnimationKeys, {
      duration: 200
    });
    this.formAnimation.pause();
    this.setListener(this.addReviewButton, "click", this.showReviewForm);

    // Add listener to form and submit button
  }

  clear() {
    [this.name, this.rating, this.comments].map(node => (node.value = ""));
  }

  hideReviewForm() {
    this.addReviewButton.classList.remove("hidden");
    this.formAnimation.playblackRate = -1;
    this.formAnimation.play();
    this.lastActive.focus();
    this.formContainer.classList.add("hidden");
    this.removeListeners();
  }

  setListener(target, evt, callback, passEvt = false) {
    target.addEventListener(
      evt,
      e => {
        // check if passEvt is true, call callback with event as the first argument
        if (passEvt) {
          callback.call(this, e);
        } else {
          callback.call(this);
        }
      },
      false
    );
  }

  setListeners() {
    this.setListener(this.form, "submit", this.submitReview, true);
    this.setListener(this.form, "keydown", this.trapTabKey, true);
    this.setListener(this.submitBtn, "submit", this.submitReview, true);
    this.setListener(this.closeBtn, "click", this.hideReviewForm);
    this.setListener(this.formOverlay, "click", this.hideReviewForm);
  }

  trapTabKey(evt) {
    const focusableElementsString =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    const focusableElements = [
      ...this.form.querySelectorAll(focusableElementsString)
    ];
    const firstTabStop = focusableElements[0];
    const lastTabStop = focusableElements[focusableElements.length - 1];

    // TAB
    if (evt.keyCode === 9) {
      // SHIFT + TAB
      if (evt.shiftKey) {
        if (document.activeElement === firstTabStop) {
          evt.preventDefault();
          lastTabStop.focus();
        }
      } else {
        if (document.activeElement === lastTabStop) {
          evt.preventDefault();
          firstTabStop.focus();
        }
      }
    }
    if (evt.keyCode === 27) {
      this.hideReviewForm();
    }
  }

  removeListener(target, evt, callback) {
    target.removeEventListener(evt, callback);
  }

  removeListeners() {
    this.removeListener(this.form, "submit", this.submitReview);
    this.removeListener(this.form, "keydown", this.trapTabKey);
    this.removeListener(this.submitBtn, "click", this.submitReview);
    this.removeListener(this.closeBtn, "click", this.hideReviewForm);
    this.removeListener(this.formOverlay, "click", this.hideReviewForm);

    this.form.removeEventListener("keydown", this.trapTabKey);
  }

  showReviewForm() {
    this.lastActive = document.activeElement;
    this.formContainer.classList.remove("hidden");
    this.addReviewButton.classList.add("hidden");
    this.formAnimation.playblackRate = 1;
    this.formAnimation.play();
    this.form.querySelector("input").focus();
    this.setListeners();
  }

  submitReview(e) {
    e.preventDefault();
    let isValid = this.validateForm();

    if (isValid) {
      const review = {
        restaurant_id: this.restaurant_id,
        name: this.name.value,
        rating: Number(this.rating.value),
        comments: this.comments.value
      };

      // clear the form values
      this.clear();

      // hide the form in the next frame
      this.hideReviewForm();

      RestaurantFetch.createReview(review)
        .then(review => {
          this.context.addReview(review);
        })
        .catch(error => {
          console.log(error);
          const offlineReview = { ...review };
          this.context.addReview(offlineReview);
          this.saveReviewOffline(offlineReview);
        });
    }
  }

  saveReviewOffline(review) {
    RestaurantsDb.savePendingReview(review);
  }

  validateForm() {
    if (
      this.name.value.length > 0 &&
      this.rating.value &&
      this.comments.value.length > 0
    ) {
      return true;
    }
    return false;
  }
}

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
