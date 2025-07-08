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
        console.log(
          "Нет мероприятий в базе данных — показываем затычки из HTML."
        );
        return;
      }

      // Очищаем контейнер перед добавлением новых данных
      eventContainer.innerHTML = "";

      snapshot.forEach((doc) => {
        const event = doc.data();
        const html = `
              <div class="event-item">
                <img src="${event.image_url}" alt="" class="event-image">
                <div class="event-info">
                  <div class="event-name-container">
                    <span class="event-name">${event.name}</span>
                    <span class="event-price">${event.price}$</span>
                  </div>
                  <div class="event-date-container">
                    <span class="event-date">Дата проведения: ${
                      event.date
                    }</span>
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
                <div class="buy-button">Купить билет</div>
              </div>
            `;
        eventContainer.innerHTML += html;
      });
    });
  } catch (error) {
    console.error("Ошибка при загрузке мероприятий:", error);
  }
}

loadEvents();
