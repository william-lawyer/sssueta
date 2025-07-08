document.addEventListener("DOMContentLoaded", () => {
  const visualInput = document.getElementById("visualInput");
  const giveInput = document.getElementById("giveInput");
  const realInput = document.getElementById("realInput");

  const rubleHTML = '<span class="ruble-symbol">₽</span>';

  visualInput.setAttribute("data-placeholder", "0");
  giveInput.setAttribute("data-placeholder", "0");

  function formatNumberWithSpaces(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function placeCaretBeforeRuble(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    const textNode = el.firstChild;
    if (textNode) {
      range.setStart(textNode, textNode.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  function updateInputs(fromInput, toInput, value) {
    const digits = value.replace(/[^\d]/g, "");
    if (digits.length > 0) {
      const formatted = formatNumberWithSpaces(digits);
      fromInput.innerHTML = formatted + rubleHTML;
      toInput.innerHTML = formatted + rubleHTML;
      realInput.value = digits;
      placeCaretBeforeRuble(fromInput);
      placeCaretBeforeRuble(toInput);
    } else {
      fromInput.innerHTML = "";
      toInput.innerHTML = "";
      realInput.value = "";
    }
  }

  document.addEventListener("focusin", () => {
    document.body.style.transform = "scale(1)";
    document.body.style.transformOrigin = "0 0";
  });
  document.addEventListener("focusout", () => {
    document.body.style.transform = "";
  });

  visualInput.addEventListener("input", () => {
    updateInputs(visualInput, giveInput, visualInput.textContent);
  });

  giveInput.addEventListener("input", () => {
    updateInputs(giveInput, visualInput, giveInput.textContent);
  });

  // Защита от удаления ₽
  function handleBackspace(e, el) {
    const lastChild = el.lastChild;
    if (
      e.key === "Backspace" &&
      lastChild &&
      lastChild.className === "ruble-symbol" &&
      window.getSelection().anchorOffset === el.textContent.length
    ) {
      e.preventDefault();
      const digits = el.textContent.slice(0, -1).replace(/[^\d]/g, "");
      if (digits.length > 0) {
        const formatted = formatNumberWithSpaces(digits);
        el.innerHTML = formatted + rubleHTML;
        realInput.value = digits;
        placeCaretBeforeRuble(el);
      } else {
        el.innerHTML = "";
        realInput.value = "";
      }
    }
  }

  visualInput.addEventListener("keydown", (e) =>
    handleBackspace(e, visualInput)
  );
  giveInput.addEventListener("keydown", (e) => handleBackspace(e, giveInput));
});
