document.addEventListener("DOMContentLoaded", () => {
  const visualInput = document.getElementById("visualInput");
  const giveInput = document.getElementById("giveInput");
  const visualR = document.getElementById("visualRuble");
  const giveR = document.getElementById("giveRuble");
  const realInput = document.getElementById("realInput");

  function formatNumberWithSpaces(str) {
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function syncFields(src, dst, srcR, dstR) {
    // Оставляем только цифры
    const digits = src.value.replace(/[^\d]/g, "");
    if (digits) {
      const formatted = formatNumberWithSpaces(digits);
      src.value = formatted;
      dst.value = formatted;
      realInput.value = digits;
    } else {
      src.value = "";
      dst.value = "";
      realInput.value = "";
    }
  }

  // На ввод в любое поле — синхронизируем оба
  visualInput.addEventListener("input", () => {
    syncFields(visualInput, giveInput, visualR, giveR);
  });
  giveInput.addEventListener("input", () => {
    syncFields(giveInput, visualInput, giveR, visualR);
  });

  // Блокируем не-цифры (кроме функциональных клавиш)
  [visualInput, giveInput].forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (
        !/\d/.test(e.key) &&
        !["Backspace", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
      }
    });
  });
});
