class Notifier {
  constructor() {
    this.dom = document.getElementById("notifier-dom");
    this.notifications = [];
    this.trackNum = 0;
  }

  show(message, options = { classname: "success" }, timeout) {
    let id = this.trackNum++;
    let notification = document.createElement("div");
    notification.setAttribute("id", id);
    notification.classList.add("notification", options.classname);
    let span = document.createElement("span");
    span.textContent = message;
    notification.appendChild(span);
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

export default new Notifier();
