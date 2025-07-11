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

  // Check if Telegram user data is available
  if (
    !window.Telegram ||
    !window.Telegram.WebApp ||
    !window.Telegram.WebApp.initDataUnsafe ||
    !window.Telegram.WebApp.initDataUnsafe.user ||
    !window.Telegram.WebApp.initDataUnsafe.user.id
  ) {
    console.warn(
      "User data is not available. Showing events without user-specific data."
    );

    // Load events without user-specific logic
    db.collection("events").onSnapshot((snapshot) => {
      if (snapshot.empty) {
        console.log(
          "No events in the database — showing placeholders from HTML."
        );
        return;
      }

      eventContainer.innerHTML = ""; // Clear the container

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
            <div class="buy-button" style="background-color: #5541d9;">Купить билет</div>
          </div>
        `;
        eventContainer.innerHTML += html;
      });
      // No buy-button listeners added since the user isn’t logged in
    });

    return; // Exit the function early
  }

  // If user data is available, proceed with user-specific logic
  const userId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  const userRef = db.collection("users").doc(userId);

  try {
    // Fetch user data to check purchased tickets
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    const tickets = userData.tickets || [];

    db.collection("events").onSnapshot((snapshot) => {
      if (snapshot.empty) {
        console.log(
          "No events in the database — showing placeholders from HTML."
        );
        return;
      }

      eventContainer.innerHTML = ""; // Clear the container

      snapshot.forEach((doc) => {
        const event = doc.data();
        const eventId = doc.id;
        const isPurchased = tickets.some(
          (ticket) => ticket.eventId === eventId
        );
        const buttonText = isPurchased ? "Куплено" : "Купить билет";
        const buttonStyle = isPurchased
          ? "background-color: #777777;"
          : "background-color: #5541d9;";
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
            <div class="buy-button" style="${buttonStyle}">${buttonText}</div>
          </div>
        `;
        eventContainer.innerHTML += html;
      });

      // Add event listeners to buy buttons (assuming this function exists)
      addBuyButtonListeners();
    });
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

loadEvents();

async function saveUserToFirestore(userId, name, photoUrl, code) {
  const db = firebase.firestore();
  const userRef = db.collection("users").doc(userId);

  const doc = await userRef.get();

  if (!doc.exists) {
    await userRef.set({
      name,
      photoUrl,
      code,
      balance: 0,
      tickets: [], // Добавляем поле для хранения билетов
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
