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

class FavoriteBtn {
  constructor(el, restaurant) {
    this.restaurant = restaurant;
    this.el = el;
    this.el.setAttribute("role", "switch");
    this.isFavorite = this.restaurant.is_favorite;
    this.render();
  }

  render() {
    if (this.isFavorite) {
      this.el.classList.add("is-favorite");
    } else {
      this.el.classList.remove("is-favorite");
    }

    this.el.setAttribute(
      "title",
      this.isFavorite
        ? `unfavorite ${this.restaurant.name}`
        : `favorite ${this.restaurant.name}`
    );
    this.el.setAttribute("aria-checked", this.isFavorite);
    this.el.setAttribute(
      "aria-label",
      this.isFavorite
        ? `unfavorite ${this.restaurant.name}`
        : `favorite ${this.restaurant.name}`
    );
    this.setClick(this.el, this.updateFavorite.bind(this));
  }

  toggleFavorite(favorite) {
    this.isFavorite = !favorite;
  }

  setClick(target, callback) {
    target.onclick = callback;
  }

  updateFavorite() {
    this.toggleFavorite(this.isFavorite);
    this.restaurant.is_favorite = this.isFavorite;
    requestAnimationFrame(this.render.bind(this));
    mainhelper.updateRestaurant(this.restaurant);
    RestaurantFetch.setFavourite(this.restaurant.id, this.isFavorite);
  }
}

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
        // this.removeNotification(id);
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

/**
 * MainHelper is the central controller of the index page
 */
class MainHelper {
  constructor() {
    this.db = RestaurantsDb;
    this.initMap();
    this.fetchNeighborhoods();
    this.fetchCuisines();
    this.registerServiceWorker();
    this.getFilterButtons();
    this.refreshing = false;
  }

  lazyLoadImages() {
    const lazyImages = [...document.querySelectorAll(".lazy")];
    if ("IntersectionObserver" in window) {
      let lazyImageObserver = new IntersectionObserver(function(
        entries,
        observer
      ) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            let lazyImage = entry.target;
            lazyImage.src = lazyImage.dataset.src;
            lazyImage.srcset = lazyImage.dataset.srcset;
            lazyImage.classList.remove("lazy");
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      });

      lazyImages.forEach(lazyImage => {
        lazyImageObserver.observe(lazyImage);
      });
    } else {
      lazyImages.forEach(lazyImage => {
        lazyImage.src = lazyImage.dataset.src;
        lazyImage.srcset = lazyImage.dataset.srcset;
        lazyImage.classList.remove("lazy");
        console.log(lazyImage, "has been loaded");
      });
    }
  }

  getFilterButtons() {
    const neighborhoodSelect = document.querySelector("#neighborhoods-select");
    const cuisineSelect = document.querySelector("#cuisines-select");

    this.addListener(
      "change",
      neighborhoodSelect,
      this.updateRestaurants.bind(this)
    );
    this.addListener(
      "change",
      cuisineSelect,
      this.updateRestaurants.bind(this)
    );
  }

  addListener(evt, target, callback) {
    target.addEventListener(evt, callback);
  }

  /**
   * Initialize leaflet map, called from HTML.
   */
  initMap() {
    this.newMap = L.map("map", {
      center: [40.722216, -73.987501],
      zoom: 12,
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

    this.updateRestaurants();
  }

  /**
   * Fetch all neighborhoods and set their HTML.
   */
  fetchNeighborhoods() {
    this.db
      .fetchNeighborhoods()
      .then(neighborhoods => {
        this.neighborhoods = neighborhoods;
        this.fillNeighborhoodsHTML();
      })
      .catch(err => console.log(err));
  }

  /**
   * Fetch all cuisines and set their HTML.
   */
  fetchCuisines() {
    this.db
      .fetchCuisines()
      .then(cuisines => {
        this.cuisines = cuisines;
        this.fillCuisinesHTML();
      })
      .catch(err => console.log("could not fetch cuisines"));
  }

  /**
   * Registers serviceWorker
   */
  registerServiceWorker() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register("sw.js", { scope: "/" }).then(reg => {
        let serviceWorker;

        // check worker status
        if (reg.installing) serviceWorker = reg.installing;
        else if (reg.waiting) serviceWorker = reg.waiting;
        else if (reg.active) serviceWorker = reg.active;

        if (serviceWorker) {
          console.log("[service-worker] has been registered");
        }

        // Add listener to track serviceWorker update event
        reg.addEventListener("updatefound", () => {
          this.trackInstalling(reg.installing);
        });
      });
    }
  }

  /**
   * Update page and map for current restaurants.
   */
  updateRestaurants() {
    const cSelect = document.getElementById("cuisines-select");
    const nSelect = document.getElementById("neighborhoods-select");

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    this.db
      .fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
      .then(restaurants => {
        this.resetRestaurants(restaurants);
        this.fillRestaurantsHTML();
      })
      .catch(err =>
        console.error(
          err,
          " :could not fetch restaurant by cuisine and neighbourhood"
        )
      );
  }

  /**
   * function to track update in serviceWorker
   */
  trackInstalling(worker) {
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed") {
        // function to  update to newly installed worker
        this.updateWorker(worker);
      }
    });
  }

  updateWorker(worker) {
    worker.postMessage({ action: "skipWaiting" });
    if (!this.refreshing) this.reloadPage();
    this.refreshing = true;
  }

  /**
   * Set neighborhoods HTML.
   */
  fillNeighborhoodsHTML(neighborhoods = this.neighborhoods) {
    const select = document.getElementById("neighborhoods-select");
    neighborhoods.forEach(neighborhood => {
      const option = document.createElement("option");
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
  }

  /**
   * Set cuisines HTML.
   */
  fillCuisinesHTML(cuisines = this.cuisines) {
    const select = document.getElementById("cuisines-select");
    cuisines.forEach(cuisine => {
      const option = document.createElement("option");
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  }

  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  resetRestaurants(restaurants) {
    // Remove all restaurants
    this.restaurants = [];
    const div = document.getElementById("restaurants-list");
    div.innerHTML = "";

    // Remove all map markers
    if (this.markers) {
      this.markers.forEach(marker => marker.remove());
    }
    this.markers = [];
    this.restaurants = restaurants;
  }

  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  fillRestaurantsHTML(restaurants = this.restaurants) {
    const ul = document.getElementById("restaurants-list");
    restaurants.forEach(restaurant => {
      ul.append(this.createRestaurantHTML(restaurant));
    });
    this.addMarkersToMap();
    this.lazyLoadImages();
  }

  /**
   * Creates restaurant HTML.
   */
  createRestaurantHTML(restaurant) {
    const div = document.createElement("div");
    div.className = "restaurant-card";
    const imageContainer = document.createElement("div");
    imageContainer.className = "restaurant-image--container";
    const image = document.createElement("img");
    image.src = "img/placeholder.jpg";
    image.className = "restaurant-img";
    image.classList.add("lazy");
    image.setAttribute("data-src", `img/${restaurant.photograph}.jpg`);
    image.setAttribute(
      "data-srcset",
      `img/${restaurant.photograph}.jpg 50w, img/${
        restaurant.photograph
      }.jpg 100w`
    );
    image.sizes = `(max-width: 200px) 25vw, (min-width: 200px) 50vw', 100vw`;
    image.alt = restaurant.name;
    imageContainer.appendChild(image);
    div.appendChild(imageContainer);

    const details = document.createElement("div");
    details.className = "restaurant-details";
    const name = document.createElement("h2");
    name.innerHTML = restaurant.name;
    details.append(name);

    const neighborhood = document.createElement("p");
    neighborhood.innerHTML = restaurant.neighborhood;
    details.append(neighborhood);

    const address = document.createElement("p");
    address.innerHTML = restaurant.address;
    details.append(address);

    const more = document.createElement("a");
    more.innerHTML = "View Details";
    more.href = this.db.urlForRestaurant(restaurant);
    details.append(more);
    div.append(details);

    // create favorite button for this particular restaurant
    const favBtn = document.createElement("button");
    favBtn.className = "favorite-btn";
    new FavoriteBtn(favBtn, restaurant);
    div.append(favBtn);

    return div;
  }

  /**
   * Add markers for current restaurants to the map.
   */
  addMarkersToMap(restaurants = this.restaurants) {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = this.db.mapMarkerForRestaurant(restaurant, this.newMap);
      marker.on("click", onClick);
      function onClick() {
        window.location.href = marker.options.url;
      }
      this.markers.push(marker);
    });
  }

  reloadPage() {
    window.location.reload();
  }

  /**
   * Method to update a modified restaurant in the local db;
   */
  updateRestaurant(restaurant) {
    this.db
      .updateRestaurant(restaurant)
      .then(() => console.log("restaurant updated"));
  }
} // class ends here

self.mainhelper = new MainHelper();
