import RestaurantFetch from "./restaurantfetch";

export default class FavoriteBtn {
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
