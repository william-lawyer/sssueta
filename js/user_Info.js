// Функция для форматирования даты в "День месяц год" на русском
function formatDate(date) {
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Получаем элементы для замены
const userNameEl = document.getElementById("user-name");
const userPhotoEl = document.getElementById("user-photo");
const regDateEl = document.getElementById("reg-date");

// Работа с датой регистрации
const savedDate = localStorage.getItem("firstVisitDate");
if (!savedDate) {
  // Если даты нет — сохраняем текущую
  const now = new Date();
  localStorage.setItem("firstVisitDate", now.toISOString());
  regDateEl.textContent = "Дата регистрации: " + formatDate(now);
} else {
  // Если есть — показываем сохранённую
  regDateEl.textContent =
    "Дата регистрации: " + formatDate(new Date(savedDate));
}

// Попытка получить данные из Telegram WebApp
try {
  // Подключаем Telegram WebApp
  const tg = window.Telegram.WebApp;

  // Проверяем, есть ли user (данные пользователя)
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;

    // Формируем имя
    let fullName = user.first_name || "";
    if (user.last_name) {
      fullName += " " + user.last_name;
    }

    if (fullName.trim() !== "") {
      userNameEl.textContent = fullName;
    }

    // Заменяем аватар, если есть
    // В Telegram WebApp API нет прямого URL аватарки,
    // но иногда можно получить photo_url, если бот это поддерживает.
    // Если нет, оставляем дефолтный аватар.
    if (user.photo_url) {
      userPhotoEl.src = user.photo_url;
    }
  }
} catch (e) {
  // Если ошибка — ничего не делаем, оставляем как есть
  console.warn("Не удалось получить данные из Telegram:", e);
}
