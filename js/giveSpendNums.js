document.addEventListener("DOMContentLoaded", () => {
  const visualInput = document.getElementById("visualInput");
  const giveInput = document.getElementById("giveInput");
  const visualRuble = document.getElementById("visualRuble");
  const giveRuble = document.getElementById("giveRuble");
  const realInput = document.getElementById("realInput");
  const keyboard = document.getElementById("keyboard");
  const overlay = document.getElementById("overlay");

  let deleteInterval;

  function formatNumberWithSpaces(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function updateFormattedInputs() {
    const raw = realInput.value.replace(/[^\d]/g, "");
    const formatted = formatNumberWithSpaces(raw);

    visualInput.value = formatted;
    giveInput.value = formatted;
    realInput.value = raw;

    const showRuble = raw.length > 0;
    visualRuble.style.display = showRuble ? "inline" : "none";
    giveRuble.style.display = showRuble ? "inline" : "none";
  }

  function deleteChar() {
    realInput.value = realInput.value.slice(0, -1);
    updateFormattedInputs();
  }

  function startDeleting(e) {
    e.preventDefault();
    deleteChar();
    deleteInterval = setInterval(deleteChar, 100);
  }

  function stopDeleting() {
    clearInterval(deleteInterval);
  }

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

  [visualInput, giveInput].forEach((input) => {
    input.addEventListener("click", (e) => {
      e.stopPropagation();
      showKeyboard();
    });

    input.addEventListener("keypress", (e) => {
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener("input", () => {
      const fromInput = input;
      const toInput = input === visualInput ? giveInput : visualInput;
      const fromRuble = input === visualInput ? visualRuble : giveRuble;
      const toRuble = input === visualInput ? giveRuble : visualRuble;
      let raw = fromInput.value.replace(/[^\d]/g, "");

      if (raw.length > 0) {
        const formatted = formatNumberWithSpaces(raw);
        fromInput.value = formatted;
        toInput.value = formatted;
        fromRuble.style.display = "inline";
        toRuble.style.display = "inline";
        realInput.value = raw;
      } else {
        fromInput.value = "";
        toInput.value = "";
        fromRuble.style.display = "none";
        toRuble.style.display = "none";
        realInput.value = "";
      }
    });
  });

  keyboard.querySelectorAll("button").forEach((btn) => {
    const value = btn.textContent;

    if (value === "⌫") {
      btn.addEventListener("mousedown", startDeleting);
      btn.addEventListener("mouseup", stopDeleting);
      btn.addEventListener("mouseleave", stopDeleting);
      btn.addEventListener("touchstart", startDeleting);
      btn.addEventListener("touchend", stopDeleting);
    } else {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (value === "00") {
          realInput.value += "00";
        } else {
          realInput.value += value;
        }
        updateFormattedInputs();
      });
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
});
