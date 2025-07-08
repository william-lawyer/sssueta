document.querySelectorAll(".copy-icon").forEach((copyIcon, index) => {
  copyIcon.addEventListener("click", () => {
    const adress =
      document.querySelectorAll(".event-adress-link")[index].textContent;

    navigator.clipboard.writeText(adress).then(() => {
      const notif = document.getElementById("copy-notification");
      notif.style.display = "block";

      // Скрыть через 2 секунды
      setTimeout(() => {
        notif.style.display = "none";
      }, 2000);
    });
  });
});
