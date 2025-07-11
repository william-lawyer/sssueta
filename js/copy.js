// Используем делегирование событий для обработки кликов на иконки копирования
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("copy-icon")) {
    copyAddress(e.target);
  }
});

// Основная функция копирования адреса
function copyAddress(copyIcon) {
  // Находим ближайший контейнер с адресом
  const addressContainer = copyIcon.closest(".event-adress-container");
  if (!addressContainer) return;

  // Пытаемся найти адрес в разных возможных местах
  let addressText = "";

  // Сначала проверяем ссылку (для динамических элементов)
  const addressLink = addressContainer.querySelector(".event-adress-link a");
  if (addressLink) {
    addressText = addressLink.textContent.trim();
  }
  // Затем проверяем обычный span (для статических элементов)
  else {
    const addressSpan = addressContainer.querySelector(".event-adress-link");
    if (addressSpan) {
      addressText = addressSpan.textContent.trim();
    }
  }

  if (!addressText) return;

  // Копируем текст в буфер обмена
  navigator.clipboard
    .writeText(addressText)
    .then(() => showCopyNotification())
    .catch((err) => {
      console.error("Ошибка при копировании:", err);
      // Альтернативный метод для старых браузеров
      const textarea = document.createElement("textarea");
      textarea.value = addressText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showCopyNotification();
    });
}

// Показываем уведомление о копировании
function showCopyNotification() {
  const notification = document.getElementById("copy-notification");
  if (notification) {
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 2000);
  }
}

// Инициализация для статических элементов при загрузке
document.addEventListener("DOMContentLoaded", function () {
  // Вешаем обработчики на все существующие иконки копирования
  document.querySelectorAll(".copy-icon").forEach((icon) => {
    icon.addEventListener("click", function (e) {
      copyAddress(this);
      e.stopPropagation();
    });
  });
});
