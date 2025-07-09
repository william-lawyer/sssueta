// firebase.js

// ✅ Замените данными из консоли Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB80f5g7oANki4mhGSTtf9BQ_q_FBVoyt0",
  authDomain: "sssueta-club.firebaseapp.com",
  projectId: "sssueta-club",
  storageBucket: "sssueta-club.firebasestorage.app",
  messagingSenderId: "243713908879",
  appId: "1:243713908879:web:36f19a718c7ee7584110fa",
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();

async function loadEvents() {
  const eventContainer = document.querySelector(".event-container");

  try {
    db.collection("events").onSnapshot((snapshot) => {
      if (snapshot.empty) {
        console.log("Нет мероприятий в базе данных.");
        eventContainer.innerHTML = "<p>Нет доступных мероприятий.</p>";
        return;
      }

      // Очищаем контейнер
      eventContainer.innerHTML = "";

      snapshot.forEach((doc) => {
        const event = doc.data();
        const eventId = doc.id;
        const html = `
          <div class="event-item" data-event-id="${eventId}">
            <img src="${event.image_url}" alt="" class="event-image">
            <div class="event-info">
              <div class="event-name-container">
                <span class="event-name">${event.name}</span>
                <span class="event-price">${event.price} ₽</span>
              </div>
              <div class="event-date-container">
                <span class="event-date">Дата проведения: ${event.date}</span>
                <div class="event-adress-container">
                  <span class="event-adress">
                    Адрес: 
                    <span class="event-adress-link">
                      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        event.address
                      )}" target="_blank">
                        ${event.address}
                      </a>
                    </span>
                  </span>
                  <img src="./img/icons/copy.svg" class="copy-icon">
                </div>
              </div>
            </div>
            <button class="buy-button" data-price="${
              event.price
            }">Купить билет</button>
          </div>
        `;
        eventContainer.innerHTML += html;
      });

      // Добавляем обработчики
      addBuyButtonListeners();
    });
  } catch (error) {
    console.error("Ошибка при загрузке мероприятий:", error);
    eventContainer.innerHTML = "<p>Ошибка загрузки мероприятий.</p>";
  }
}

// Функция для покупки билета
async function buyTicket(userId, eventId, price) {
  console.log(
    `Попытка покупки билета: userId=${userId}, eventId=${eventId}, price=${price}`
  );
  try {
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection("users").doc(userId);
      const eventRef = db.collection("events").doc(eventId);
      const purchaseRef = db.collection("purchases").doc();

      const userDoc = await transaction.get(userRef);
      const eventDoc = await transaction.get(eventRef);

      if (!userDoc.exists || !eventDoc.exists) {
        throw new Error("Пользователь или событие не найдены");
      }

      const balance = userDoc.data().balance || 0;
      if (balance < price) {
        throw new Error("Недостаточно средств");
      }

      // Списываем баланс
      transaction.update(userRef, { balance: balance - price });
      // Записываем покупку
      transaction.set(purchaseRef, {
        userId,
        eventId,
        purchaseDate: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
    console.log("Билет успешно куплен");
    return true;
  } catch (error) {
    console.error("Ошибка при покупке билета:", error);
    throw error;
  }
}

// Внутри addBuyButtonListeners
function addBuyButtonListeners() {
  const buttons = document.querySelectorAll(".buy-button");
  console.log(`Найдено кнопок: ${buttons.length}`);
  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      console.log("Клик по кнопке 'Купить билет'");
      const eventItem = button.closest(".event-item");
      const eventId = eventItem.dataset.eventId;
      const price = parseInt(button.dataset.price);
      const userId = window.Telegram.WebApp.initDataUnsafe.user?.id?.toString();

      if (!userId) {
        alert("Пожалуйста, войдите через Telegram");
        return;
      }

      try {
        await buyTicket(userId, eventId, price);
        button.textContent = "Билет куплен";
        button.disabled = true;
        button.classList.add("bought"); // Добавляем класс
      } catch (error) {
        alert(error.message || "Ошибка при покупке билета");
      }
    });
  });
}

loadEvents();
