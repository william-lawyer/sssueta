// ✅ Инициализация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB80f5g7oANki4mhGSTtf9BQ_q_FBVoyt0",
  authDomain: "sssueta-club.firebaseapp.com",
  projectId: "sssueta-club",
  storageBucket: "sssueta-club.firebasestorage.app",
  messagingSenderId: "243713908879",
  appId: "1:243713908879:web:36f19a718c7ee7584110fa",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function loadEvents() {
  const eventContainer = document.querySelector(".event-container");

  try {
    db.collection("events").onSnapshot((snapshot) => {
      if (snapshot.empty) {
        console.log(
          "Нет мероприятий в базе данных — показываем затычки из HTML."
        );
        return;
      }

      eventContainer.innerHTML = "";

      snapshot.forEach((doc) => {
        const event = doc.data();
        const html = `
          <div class="event-item">
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
            <div 
              class="buy-button"
              data-event-id="${doc.id}"
              data-event-name="${event.name}"
              data-event-price="${event.price}"
            >
              Купить билет
            </div>
          </div>
        `;
        eventContainer.innerHTML += html;
      });

      // После рендера элементов — вешаем обработчики кнопок
      setTimeout(() => {
        document.querySelectorAll(".buy-button").forEach((button) => {
          button.addEventListener("click", async () => {
            const eventId = button.dataset.eventId;
            const eventName = button.dataset.eventName;
            const eventPrice = parseInt(button.dataset.eventPrice, 10);

            const tg = window.Telegram.WebApp;
            const user = tg.initDataUnsafe.user;

            if (!user || !user.id) {
              showNotification("Вы не авторизованы через Telegram");
              return;
            }

            const userId = user.id.toString();
            const userRef = db.collection("users").doc(userId);
            const userSnap = await userRef.get();

            if (!userSnap.exists) {
              showNotification("Пользователь не найден");
              return;
            }

            const userData = userSnap.data();
            const currentBalance = userData.balance ?? 0;

            if (currentBalance < eventPrice) {
              showNotification("Недостаточно средств на балансе");
              return;
            }

            const tickets = userData.tickets || [];
            const alreadyBought = tickets.some((t) => t.id === eventId);

            if (alreadyBought) {
              showNotification("Вы уже купили билет на это мероприятие");
              return;
            }

            await userRef.update({
              balance: currentBalance - eventPrice,
              tickets: firebase.firestore.FieldValue.arrayUnion({
                id: eventId,
                name: eventName,
                price: eventPrice,
                boughtAt: firebase.firestore.Timestamp.now(),
              }),
            });

            // Обновляем баланс в интерфейсе
            document.querySelector(".balance-value").textContent = `${(
              currentBalance - eventPrice
            ).toLocaleString("ru-RU")} ₽`;

            showNotification(`Вы успешно купили билет на "${eventName}"`);
          });
        });
      }, 100);
    });
  } catch (error) {
    showNotification("Ошибка при загрузке мероприятий:", error);
  }
}

loadEvents();

// (опционально)
async function saveUserToFirestore(userId, name, photoUrl, code) {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    await userRef.set({
      name,
      photoUrl,
      code,
      balance: 0,
    });
  } else {
    await userRef.set({ name, photoUrl }, { merge: true });
  }
}
