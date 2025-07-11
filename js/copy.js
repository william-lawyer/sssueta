// Делегирование событий для работы с динамическими элементами
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("copy-icon")) {
    const addressContainer = e.target.closest(".event-adress-container");
    if (addressContainer) {
      const addressLink = addressContainer.querySelector(
        ".event-adress-link a"
      );
      const address = addressLink
        ? addressLink.textContent.trim()
        : addressContainer
            .querySelector(".event-adress-link")
            .textContent.trim();

      navigator.clipboard
        .writeText(address)
        .then(() => {
          showCopyNotification();
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  }
});

function showCopyNotification() {
  const notif = document.getElementById("copy-notification");
  if (notif) {
    notif.style.display = "block";
    setTimeout(() => {
      notif.style.display = "none";
    }, 2000);
  }
}

// Инициализация для статических элементов при загрузке
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".copy-icon").forEach((icon) => {
    icon.addEventListener("click", handleCopyClick);
  });
});

function handleCopyClick(e) {
  const addressContainer = e.target.closest(".event-adress-container");
  if (addressContainer) {
    const addressLink = addressContainer.querySelector(".event-adress-link a");
    const address = addressLink
      ? addressLink.textContent.trim()
      : addressContainer.querySelector(".event-adress-link").textContent.trim();

    navigator.clipboard
      .writeText(address)
      .then(() => {
        showCopyNotification();
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }
  e.stopPropagation();
}
