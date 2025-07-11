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
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase успешно инициализирован");
} catch (error) {
  console.error("Ошибка инициализации Firebase:", error);
}

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
      console.log("Контейнер мероприятий очищен");

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
          console.log("Купленные билеты (eventIds):", purchasedEventIds);
        } else {
          console.log(
            "Пользователь не найден, инициализация пустого массива билетов"
          );
        }
      }

      snapshot.forEach((doc) => {
        const event = doc.data();
        const eventId = doc.id;

        // Проверяем наличие всех необходимых полей
        const requiredFields = [
          "name",
          "price",
          "date",
          "address",
          "image_url",
        ];
        const missingFields = requiredFields.filter((field) => !event[field]);
        if (missingFields.length > 0) {
          console.warn(
            `Мероприятие ${eventId} имеет отсутствующие поля:`,
            missingFields
          );
        }

        const isPurchased = purchasedEventIds.includes(eventId);
        const buttonText = isPurchased ? "Куплено" : "Купить билет";
        const buttonStyle = isPurchased
          ? "background-color: #777777;"
          : "background-color: #5541d9;";

        const html = `
          <div class="event-item">
            <img src="${
              event.image_url || "./img/placeholder.png"
            }" alt="" class="event-image">
            <div class="event-info">
              <div class="event-name-container">
                <span class="event-name">${event.name || "Без названия"}</span>
                <span class="event-price">${
                  event.price ? event.price + " ₽" : "Цена не указана"
                }</span>
              </div>
              <div class="event-date-container">
                <span class="event-date">Дата проведения: ${
                  event.date || "Не указана"
                }</span>
                <div class="event-adress-container">
                  <span class="event-adress">
                    Адрес: 
                    <span class="event-adress-link">
                      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        event.address || ""
                      )}" target="_blank">
                        ${event.address || "Не указан"}
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
            console.log("Пользователь не авторизован через Telegram");
            return;
          }

          const eventId = button.getAttribute("data-event-id");
          const userRef = db.collection("users").doc(userId);
          const eventRef = db.collection("events").doc(eventId);

          try {
            // Получаем данные пользователя и мероприятия
            const userSnap = await userRef.get();
            const eventSnap = await eventRef.get();

            if (!userSnap.exists) {
              alert("Ошибка: пользователь не найден.");
              console.error("Пользователь не найден:", userId);
              return;
            }
            if (!eventSnap.exists) {
              alert("Ошибка: мероприятие не найдено.");
              console.error("Мероприятие не найдено:", eventId);
              return;
            }

            const userData = userSnap.data();
            const eventData = eventSnap.data();
            const eventPrice = eventData.price;
            const userBalance = userData.balance || 0;

            // Проверяем наличие обязательных полей
            const requiredFields = [
              "name",
              "price",
              "date",
              "address",
              "image_url",
            ];
            const missingFields = requiredFields.filter(
              (field) => !eventData[field]
            );
            if (missingFields.length > 0) {
              alert("Ошибка: у мероприятия отсутствуют некоторые данные.");
              console.error(
                `Мероприятие ${eventId} имеет отсутствующие поля:`,
                missingFields
              );
              return;
            }

            // Проверяем, куплен ли билет
            const purchasedTickets = userData.purchasedTickets || [];
            if (purchasedTickets.some((ticket) => ticket.eventId === eventId)) {
              alert("Билет на это мероприятие уже куплен.");
              console.log("Билет уже куплен для eventId:", eventId);
              return;
            }

            // Проверяем баланс
            if (!eventPrice || userBalance < eventPrice) {
              alert(
                "Недостаточно средств на балансе или цена мероприятия не указана."
              );
              console.log(
                "Недостаточно средств: баланс =",
                userBalance,
                ", цена =",
                eventPrice
              );
              return;
            }

            // Формируем объект билета
            const ticket = {
              eventId: eventId,
              name: eventData.name,
              price: eventData.price,
              date: eventData.date,
              address: eventData.address,
              image_url: eventData.image_url,
              purchaseDate: firebase.firestore.FieldValue.serverTimestamp(),
            };

            console.log(
              "Объект билета перед сохранением:",
              JSON.stringify(ticket, null, 2)
            );

            // Списываем деньги и сохраняем билет
            await db.runTransaction(async (transaction) => {
              transaction.update(userRef, {
                balance: userBalance - eventPrice,
                purchasedTickets:
                  firebase.firestore.FieldValue.arrayUnion(ticket),
              });
            });

            // Обновляем кнопку
            button.textContent = "Куплено";
            button.style.backgroundColor = "#777777";
            console.log("Билет успешно куплен для eventId:", eventId);
            alert("Билет успешно куплен!");
          } catch (error) {
            console.error("Ошибка при покупке билета:", error);
            alert("Произошла ошибка при покупке билета: " + error.message);
          }
        });
      });
    });
  } catch (error) {
    console.error("Ошибка при загрузке мероприятий:", error);
    alert("Ошибка при загрузке мероприятий: " + error.message);
  }
}

async function saveUserToFirestore(userId, name, photoUrl, code) {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();

  try {
    if (!doc.exists) {
      await userRef.set({
        name,
        photoUrl,
        code,
        balance: 0,
        purchasedTickets: [],
      });
      console.log("Новый пользователь создан:", userId);
    } else {
      await userRef.set(
        {
          name,
          photoUrl,
        },
        { merge: true }
      );
      console.log("Данные пользователя обновлены:", userId);
    }
  } catch (error) {
    console.error("Ошибка при сохранении пользователя:", error);
    alert("Ошибка при сохранении данных пользователя: " + error.message);
  }
}

loadEvents();
