const eventContainer = document.querySelector(".event-container");
const appsIcon = document.querySelector(".nav-item:nth-child(2)");
let touchStartY = 0;
let touchEndY = 0;

// Открытие по нажатию на иконку
appsIcon.addEventListener("click", () => {
  eventContainer.classList.add("active");
});

// Закрытие по клику вне eventContainer
document.addEventListener("click", (e) => {
  const isInside = eventContainer.contains(e.target);
  const isAppsIcon = appsIcon.contains(e.target);
  if (!isInside && !isAppsIcon && eventContainer.classList.contains("active")) {
    eventContainer.classList.remove("active");
  }
});
