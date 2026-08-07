// ============================================================
// Opens the matching .window when a folder (or any element with
// [data-open]) is clicked. Closes it again on the red dot, the
// overlay, or the Escape key. Nothing here needs editing unless
// you want to change *behaviour* — for content, edit index.html.
// ============================================================

const overlay = document.getElementById("overlay");

function openWindow(id) {
  const win = document.getElementById(`window-${id}`);
  if (!win) return;
  win.classList.add("active");
  overlay.classList.add("active");
}

function closeAllWindows() {
  document.querySelectorAll(".window.active").forEach((win) => {
    win.classList.remove("active");
  });
  overlay.classList.remove("active");
}

// Open a window when its folder is clicked
document.querySelectorAll("[data-open]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    openWindow(trigger.dataset.open);
  });
});

// Close a window via its red dot
document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", closeAllWindows);
});

// Close when clicking the dark overlay
overlay.addEventListener("click", closeAllWindows);

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllWindows();
});
