document.addEventListener("DOMContentLoaded", () => {
  const vi = document.getElementById("visualInput");
  const gi = document.getElementById("giveInput");
  const vr = document.getElementById("visualRuble");
  const gr = document.getElementById("giveRuble");
  const ri = document.getElementById("realInput");

  const fmt = (str) => str.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  function sync(src, dst, srcR, dstR) {
    // оставляем только цифры
    const digits = src.value.replace(/[^\d]/g, "");
    if (digits) {
      const f = fmt(digits);
      src.value = f;
      dst.value = f;
      srcR.style.display = dstR.style.display = "inline";
      ri.value = digits;
    } else {
      src.value = dst.value = "";
      srcR.style.display = dstR.style.display = "none";
      ri.value = "";
    }
  }

  vi.addEventListener("input", () => sync(vi, gi, vr, gr));
  gi.addEventListener("input", () => sync(gi, vi, gr, vr));

  document.addEventListener(
    "focus",
    function () {
      document
        .querySelector('meta[name="viewport"]')
        .setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        );
    },
    true
  );

  // Блокируем не‑цифры
  [vi, gi].forEach((el) => {
    el.addEventListener("keypress", (e) => {
      if (
        !/\d/.test(e.key) &&
        !["Backspace", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
      }
    });
  });
});
