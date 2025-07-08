document.addEventListener("DOMContentLoaded", () => {
  const visualInput = document.getElementById("visualInput");
  const giveInput = document.getElementById("giveInput");
  const visualRuble = document.getElementById("visualRuble");
  const giveRuble = document.getElementById("giveRuble");
  const realInput = document.getElementById("realInput");

  function formatNumberWithSpaces(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function handleInputChange(fromInput, toInput, fromRuble, toRuble) {
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
  }

  visualInput.addEventListener("input", () => {
    handleInputChange(visualInput, giveInput, visualRuble, giveRuble);
  });

  giveInput.addEventListener("input", () => {
    handleInputChange(giveInput, visualInput, giveRuble, visualRuble);
  });

  [visualInput, giveInput].forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });
  });
});
