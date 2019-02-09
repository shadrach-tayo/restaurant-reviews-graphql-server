import RestaurantFetch from "./restaurantfetch";
import RestaurantsDb from "./restaurantdb";

export default class ReviewsForm {
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
