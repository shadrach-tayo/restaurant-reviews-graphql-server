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

export default new Notifier();
