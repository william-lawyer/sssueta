document.querySelectorAll(".copy-icon").forEach((copyIcon, index) => {
  copyIcon.addEventListener("click", () => {
    const adress =
      document.querySelectorAll(".event-adress-link")[index].textContent;

    navigator.clipboard.writeText(adress).then(() => {
      const notif = document.getElementById("copy-notification");
      notif.style.display = "block";

      // Скрыть через 2 секунды
      setTimeout(() => {
        notif.style.display = "none";
      }, 2000);
    });
  });
});

function setupCopyButtons() {
  document.querySelectorAll(".copy-icon").forEach((copyIcon) => {
    // Удаляем существующие обработчики, чтобы избежать дублирования
    copyIcon.replaceWith(copyIcon.cloneNode(true));
  });

  document.querySelectorAll(".copy-icon").forEach((copyIcon) => {
    copyIcon.addEventListener("click", (e) => {
      // Находим ближайший элемент с адресом
      const addressElement = copyIcon
        .closest(".event-adress-container")
        .querySelector(".event-adress-link");
      const address = addressElement.textContent.trim();

      navigator.clipboard.writeText(address).then(() => {
        const notif = document.getElementById("copy-notification");
        notif.style.display = "block";

        // Скрыть через 2 секунды
        setTimeout(() => {
          notif.style.display = "none";
        }, 2000);
      });

      // Останавливаем всплытие события, чтобы оно не мешало другим обработчикам
      e.stopPropagation();
    });
  });
}

// Вызываем функцию при загрузке страницы
document.addEventListener("DOMContentLoaded", setupCopyButtons);
