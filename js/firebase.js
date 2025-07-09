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

// Заведём глобально userId сразу после инициализации Telegram WebApp
// (Этот код можно переместить в index.html, прямо после tg.initDataUnsafe.user)
if (window.Telegram && Telegram.WebApp) {
  const tg = Telegram.WebApp;
  const user = tg.initDataUnsafe.user;
  window.userId = user && user.id ? user.id.toString() : null;
  if (!window.userId) {
    console.warn("Не удалось получить userId из Telegram WebApp");
  }
} else {
  window.userId = null;
  console.warn("Telegram WebApp не доступен");
}

async function loadEvents() {
  const eventContainer = document.querySelector(".event-container");

  try {
    db.collection("events").onSnapshot((snapshot) => {
      // Очищаем контейнер
      eventContainer.innerHTML = "";

      if (snapshot.empty) {
        console.log("Нет мероприятий в базе — показываем статики из HTML.");
        return;
      }

      // Рендерим события
      snapshot.forEach((doc) => {
        const e = doc.data();
        const html = `
          <div class="event-item">
            <img src="${e.image_url}" alt="" class="event-image">
            <div class="event-info">
              <div class="event-name-container">
                <span class="event-name">${e.name}</span>
                <span class="event-price">${e.price} ₽</span>
              </div>
              <div class="event-date-container">
                <span class="event-date">Дата проведения: ${e.date}</span>
                <div class="event-adress-container">
                  <span class="event-adress">
                    Адрес:
                    <span class="event-adress-link">
                      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        e.address
                      )}" target="_blank">
                        ${e.address}
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
              data-price="${e.price}"
            >
              Купить билет
            </div>
          </div>
        `;
        eventContainer.innerHTML += html;
      });

      // Навешиваем логику покупки
      initBuyButtons();
    });
  } catch (error) {
    console.error("Ошибка при загрузке мероприятий:", error);
  }
}

loadEvents();

async function saveUserToFirestore(userId, name, photoUrl, code) {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    await userRef.set({ name, photoUrl, code, balance: 0 });
  } else {
    await userRef.set({ name, photoUrl }, { merge: true });
  }
}

function initBuyButtons() {
  const userId = window.userId;
  if (!userId) return; // выходим, если нет ID

  const userRef = db.collection("users").doc(userId);
  const ticketsRef = userRef.collection("tickets");

  document.querySelectorAll(".buy-button").forEach((button) => {
    const eventId = button.dataset.eventId;
    const price = parseInt(button.dataset.price, 10);

    // уже куплен?
    if (button.dataset.purchased === "true") {
      button.style.backgroundColor = "#777777";
      button.textContent = "Билет куплен";
      button.disabled = true;
      return;
    }

    button.addEventListener("click", async () => {
      try {
        await db.runTransaction(async (tx) => {
          const userDoc = await tx.get(userRef);
          const data = userDoc.data();
          if (!data || data.balance < price) {
            throw new Error("INSUFFICIENT_FUNDS");
          }
          // списываем баланс
          tx.update(userRef, {
            balance: data.balance - price,
          });
          // сохраняем билет
          tx.set(ticketsRef.doc(), {
            eventId,
            price,
            purchasedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        });

        // обновляем UI
        button.style.backgroundColor = "#777777";
        button.textContent = "Билет куплен";
        button.disabled = true;
        button.dataset.purchased = "true";
      } catch (err) {
        if (err.message === "INSUFFICIENT_FUNDS") {
          alert("На вашем балансе недостаточно средств.");
        } else {
          console.error("Ошибка покупки билета:", err);
          alert("Не удалось купить билет. Попробуйте позже.");
        }
      }
    });
  });
}
