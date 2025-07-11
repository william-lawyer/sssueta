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

// Функция для форматирования баланса
function formatBalance(balance) {
  return balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

async function loadEvents() {
  const eventContainer = document.querySelector(".event-container");

  if (!window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    console.warn(
      "User data is not available. Showing events without user-specific data."
    );

    db.collection("events").onSnapshot((snapshot) => {
      if (snapshot.empty) {
        console.log(
          "No events in the database — showing placeholders from HTML."
        );
        return;
      }

      eventContainer.innerHTML = "";
      snapshot.forEach((doc) => {
        const event = doc.data();
        const eventId = doc.id;
        eventContainer.innerHTML += createEventHTML(event, eventId, false);
        setupCopyButtons();
      });
    });
    return;
  }

  const userId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  const userRef = db.collection("users").doc(userId);

  function setupCopyButtons() {
    // Удаляем старые обработчики, чтобы избежать дублирования
    document.querySelectorAll(".copy-icon").forEach((icon) => {
      icon.replaceWith(icon.cloneNode(true));
    });

    // Добавляем обработчики на новые элементы
    document.querySelectorAll(".copy-icon").forEach((icon) => {
      icon.addEventListener("click", function (e) {
        copyAddress(this);
        e.stopPropagation();
      });
    });
  }

  try {
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    const tickets = userData?.tickets || [];

    db.collection("events").onSnapshot((snapshot) => {
      if (snapshot.empty) {
        console.log(
          "No events in the database — showing placeholders from HTML."
        );
        return;
      }

      eventContainer.innerHTML = "";
      snapshot.forEach((doc) => {
        const event = doc.data();
        const eventId = doc.id;
        const isPurchased = tickets.some(
          (ticket) => ticket.eventId === eventId
        );
        eventContainer.innerHTML += createEventHTML(
          event,
          eventId,
          isPurchased
        );
      });

      addBuyButtonListeners();
    });
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

function createEventHTML(event, eventId, isPurchased) {
  const buttonText = isPurchased ? "Куплено" : "Купить билет";
  const buttonStyle = isPurchased
    ? "background-color: #777777; padding: 2.3vh 14vh;"
    : "background-color: #5541d9;";
  const buttonDisabled = isPurchased ? "disabled" : "";

  return `
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
      <div class="buy-button" style="${buttonStyle}" ${buttonDisabled}>${buttonText}</div>
    </div>
  `;
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
      tickets: [],
    });
  } else {
    await userRef.set({ name, photoUrl }, { merge: true });
  }
}

loadEvents();
