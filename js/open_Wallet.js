const walletContainer = document.querySelector(".wallet-container");
const walletIcon = document.querySelector(".nav-item:nth-child(3)");

// Открытие
walletIcon.addEventListener("click", (e) => {
  e.stopPropagation(); // чтобы не сработал документный клик сразу
  walletContainer.classList.add("active");
});

// Закрытие при клике вне .wallet-container
document.addEventListener("click", (e) => {
  const isInsideWallet = walletContainer.contains(e.target);
  const isWalletIcon = walletIcon.contains(e.target);
  if (!isInsideWallet && !isWalletIcon) {
    walletContainer.classList.remove("active");
  }
});
