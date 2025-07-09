const visualInput = document.getElementById("visualInput");
const giveInput = document.getElementById("giveInput");
const realInput = document.getElementById("realInput");
const keyboard = document.getElementById("keyboard");
const overlay = document.getElementById("overlay");
// walletContainer и walletIcon уже определены в open_Wallet.js

function showKeyboard() {
  if (walletContainer.classList.contains("active")) {
    keyboard.classList.add("active");
    overlay.classList.add("active");
    walletContainer.classList.add("keyboard-active");
  }
}

function hideKeyboard() {
  keyboard.classList.remove("active");
  overlay.classList.remove("active");
  walletContainer.classList.remove("keyboard-active");
}

// Показ клавиатуры при клике на инпуты
[visualInput, giveInput].forEach((input) => {
  input.addEventListener("click", (e) => {
    e.stopPropagation();
    showKeyboard();
  });
});

// Логика кнопок клавиатуры
keyboard.addEventListener("click", (e) => {
  e.stopPropagation();
  if (e.target.tagName === "BUTTON") {
    const value = e.target.textContent;
    if (value === "⌫") {
      realInput.value = realInput.value.slice(0, -1);
    } else if (value === "00") {
      realInput.value += "00";
    } else if (value) {
      realInput.value += value;
    }
    visualInput.value = realInput.value;
    giveInput.value = realInput.value;
  }
});

// Закрытие клавиатуры при клике вне её
document.addEventListener("click", (e) => {
  const isClickInsideKeyboard = keyboard.contains(e.target);
  const isClickOnInput =
    visualInput.contains(e.target) || giveInput.contains(e.target);
  if (!isClickInsideKeyboard && !isClickOnInput) {
    hideKeyboard();
  }
});

// Закрытие wallet-container при клике вне его и клавиатуры
document.addEventListener("click", (e) => {
  const isClickInsideWallet = walletContainer.contains(e.target);
  const isClickOnWalletNav = walletIcon.contains(e.target);
  const isClickInsideKeyboard = keyboard.contains(e.target);
  const isClickOnInput =
    visualInput.contains(e.target) || giveInput.contains(e.target);
  if (
    !isClickInsideWallet &&
    !isClickOnWalletNav &&
    !isClickInsideKeyboard &&
    !isClickOnInput
  ) {
    walletContainer.classList.remove("active");
    hideKeyboard();
  }
});
