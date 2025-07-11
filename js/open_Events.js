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

// Добавление обработчиков на кнопки "Купить билет"
// Добавление обработчиков на кнопки "Купить билет"
function addBuyButtonListeners() {
  const buyButtons = document.querySelectorAll(".buy-button");
  buyButtons.forEach((button) => {
    if (button.textContent === "Купить билет" && !button.disabled) {
      const eventItem = button.closest(".event-item");
      const eventId = eventItem.dataset.eventId;
      button.addEventListener("click", () => handleBuyTicket(eventId, button));
    }
  });
}

// Обработка покупки билета
async function handleBuyTicket(eventId, button) {
  const userId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  const db = firebase.firestore();
  const userRef = db.collection("users").doc(userId);
  const eventRef = db.collection("events").doc(eventId);

  try {
    // Получаем данные пользователя и мероприятия
    const [userSnap, eventSnap] = await Promise.all([
      userRef.get(),
      eventRef.get(),
    ]);

    if (!userSnap.exists) {
      alert("Пользователь не найден.");
      return;
    }

    if (!eventSnap.exists) {
      alert("Мероприятие не найдено.");
      return;
    }

    const userData = userSnap.data();
    const eventData = eventSnap.data();
    const balance = userData.balance || 0;
    const price = eventData.price || 0;

    // Проверка на достаточность средств
    if (balance < price) {
      alert("Недостаточно средств для покупки билета.");
      return;
    }

    // Проверка, не куплен ли билет ранее
    const tickets = userData.tickets || [];
    if (tickets.some((ticket) => ticket.eventId === eventId)) {
      alert("Вы уже купили билет на это мероприятие.");
      return;
    }

    // Списываем деньги и добавляем билет
    const newBalance = balance - price;
    const newTicket = { eventId, purchaseDate: new Date().toISOString() };

    await userRef.update({
      balance: newBalance,
      tickets: firebase.firestore.FieldValue.arrayUnion(newTicket),
    });

    // Обновляем интерфейс
    button.textContent = "Куплено";
    button.style.backgroundColor = "#777777";
    button.style.padding = "2.3vh 14vh;";
    button.disabled = true; // Отключаем кнопку, чтобы не нажималась повторно
  } catch (error) {
    console.error("Ошибка при покупке билета:", error);
    alert("Произошла ошибка при покупке билета.");
  }
}
