document.addEventListener("DOMContentLoaded", () => {
  const visualInput = document.getElementById("visualInput");
  const giveInput = document.getElementById("giveInput");
  const visualRuble = document.getElementById("visualRuble");
  const giveRuble = document.getElementById("giveRuble");
  const realInput = document.getElementById("realInput");

  let isSyncing = false;

  function formatNumberWithSpaces(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function handleInputChange(source, target, sourceRuble, targetRuble) {
    if (isSyncing) return;
    isSyncing = true;

    let raw = source.value.replace(/[^\d]/g, "");
    const formatted = raw.length > 0 ? formatNumberWithSpaces(raw) : "";

    source.value = formatted;
    target.value = formatted;

    if (raw.length > 0) {
      sourceRuble.style.display = "inline";
      targetRuble.style.display = "inline";
      realInput.value = raw;
    } else {
      sourceRuble.style.display = "none";
      targetRuble.style.display = "none";
      realInput.value = "";
    }

    isSyncing = false;
  }

  visualInput.addEventListener("input", () =>
    handleInputChange(visualInput, giveInput, visualRuble, giveRuble)
  );

  giveInput.addEventListener("input", () =>
    handleInputChange(giveInput, visualInput, giveRuble, visualRuble)
  );

  [visualInput, giveInput].forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });
  });
});
