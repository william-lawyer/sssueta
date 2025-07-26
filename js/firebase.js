const firebaseConfig = {
  apiKey: "AIzaSyB80f5g7oANki4mhGSTtf9BQ_q_FBVoyt0",
  authDomain: "sssueta-club.firebaseapp.com",
  projectId: "sssueta-club",
  storageBucket: "sssueta-club.appspot.com",
  messagingSenderId: "243713908879",
  appId: "1:243713908879:web:36f19a718c7ee7584110fa",
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Функция для форматирования баланса
function formatBalance(balance) {
  return balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Функция для создания платежа
async function createPayment(userId, username, amount) {
  try {
    const paymentRef = await db.collection("payments").add({
      userId: userId,
      username: username,
      amount: parseInt(amount),
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return paymentRef.id;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

// Функция для обновления статуса платежа
async function updatePaymentStatus(paymentId, status) {
  try {
    await db.collection("payments").doc(paymentId).update({
      status: status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
}

// Функция для загрузки мероприятий
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

// Остальные функции из вашего исходного firebase.js
// ... (остальной код остается без изменений)

// Экспортируем функции для использования в других файлах
window.firebaseHelpers = {
  db,
  formatBalance,
  createPayment,
  updatePaymentStatus,
  loadEvents,
};
