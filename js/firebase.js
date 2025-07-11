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
  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe.user;
  const userId = user ? user.id.toString() : null;

  try {
    db.collection("events").onSnapshot(async (snapshot) => {
      if (snapshot.empty) {
        console.log(
          "Нет мероприятий в базе данных — показываем затычки из HTML."
        );
        return;
      }

      // Очищаем контейнер перед добавлением новых данных
      eventContainer.innerHTML = "";

      // Получаем данные о купленных билетах пользователя
      let purchasedEventIds = [];
      if (userId) {
        const userRef = db.collection("users").doc(userId);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
          const userData = userSnap.data();
          purchasedEventIds = (userData.purchasedTickets || []).map(
            (ticket) => ticket.eventId
          );
        }
      }

      snapshot.forEach((doc) => {
        const event = doc.data();
        const eventId = doc.id;
        const isPurchased = purchasedEventIds.includes(eventId);
        const buttonText = isPurchased ? "Куплено" : "Купить билет";
        const buttonStyle = isPurchased
          ? "background-color: #777777;"
          : "background-color: #5541d9;";

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
            <div class="buy-button" data-event-id="${eventId}" style="${buttonStyle}">${buttonText}</div>
          </div>
        `;
        eventContainer.innerHTML += html;
      });

      // Добавляем обработчики для кнопок покупки
      document.querySelectorAll(".buy-button").forEach((button) => {
        button.addEventListener("click", async () => {
          if (!userId) {
            alert("Пожалуйста, войдите через Telegram.");
            return;
          }

          const eventId = button.getAttribute("data-event-id");
          const userRef = db.collection("users").doc(userId);
          const eventRef = db.collection("events").doc(eventId);

          // Получаем данные пользователя и мероприятия
          const userSnap = await userRef.get();
          const eventSnap = await eventRef.get();

          if (!userSnap.exists || !eventSnap.exists) {
            alert("Ошибка: пользователь или мероприятие не найдены.");
            return;
          }

          const userData = userSnap.data();
          const eventData = eventSnap.data();
          const eventPrice = eventData.price;
          const userBalance = userData.balance || 0;

          // Проверяем, куплен ли билет
          const purchasedTickets = userData.purchasedTickets || [];
          if (purchasedTickets.some((ticket) => ticket.eventId === eventId)) {
            alert("Билет на это мероприятие уже куплен.");
            return;
          }

          // Проверяем баланс
          if (userBalance < eventPrice) {
            alert("Недостаточно средств на балансе.");
            return;
          }

          // Формируем объект билета
          const ticket = {
            eventId,
            name: eventData.name,
            price: eventData.price,
            date: eventData.date,
            address: eventData.address,
            image_url: eventData.image_url,
            purchaseDate: firebase.firestore.FieldValue.serverTimestamp(),
          };

          // Списываем деньги и сохраняем билет
          try {
            await db.runTransaction(async (transaction) => {
              // Списываем баланс
              transaction.update(userRef, {
                balance: userBalance - eventPrice,
                purchasedTickets:
                  firebase.firestore.FieldValue.arrayUnion(ticket),
              });
            });

            // Обновляем кнопку
            button.textContent = "Куплено";
            button.style.backgroundColor = "#777777";
            alert("Билет успешно куплен!");
          } catch (error) {
            console.error("Ошибка при покупке билета:", error);
            alert("Произошла ошибка при покупке билета.");
          }
        });
      });
    });
  } catch (error) {
    console.error("Ошибка при загрузке мероприятий:", error);
  }
}

async function saveUserToFirestore(userId, name, photoUrl, code) {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    await userRef.set({
      name,
      photoUrl,
      code,
      balance: 0,
      purchasedTickets: [], // Инициализируем массив для купленных билетов
    });
  } else {
    await userRef.set(
      {
        name,
        photoUrl,
      },
      { merge: true }
    );
  }
}

loadEvents();
