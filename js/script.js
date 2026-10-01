// ============================================================
// WINDOW MANAGER
// Handles opening/closing the "folder" pop-up windows. Windows can
// stack on top of each other (e.g. clicking a project inside
// my-work opens a project window without closing my-work behind
// it), so closing the top window reveals the one underneath.
// ============================================================

const overlay = document.getElementById("overlay");

// Windows currently open, in the order they were opened.
// The last item in the array is the one on top.
let openStack = [];

// Remembers which button opened each window, so focus can go back
// to it when the window closes (keyboard/screen-reader users).
const openers = new Map();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const BASE_Z = 50;
const STACK_OFFSET_PX = 18; // how far each stacked window peeks out

function getWindow(id) {
  return document.getElementById(`window-${id}`);
}

function restackWindows() {
  openStack.forEach((win, index) => {
    win.style.zIndex = BASE_Z + index;
    const offset = index * STACK_OFFSET_PX;
    win.style.setProperty("--stack-offset", `${offset}px`);
  });
}

function openWindow(id, opener) {
  const win = getWindow(id);
  if (!win) return;

  if (opener && !openers.has(win)) openers.set(win, opener);

  // The CV iframe only gets its src the first time it's opened, so the
  // PDF isn't downloaded on page load.
  win.querySelectorAll("iframe[data-src]").forEach((frame) => {
    frame.src = frame.dataset.src;
    frame.removeAttribute("data-src");
  });

  // Already open? just bring it to the front instead of duplicating it.
  if (openStack.includes(win)) {
    openStack = openStack.filter((w) => w !== win);
  }

  win.classList.add("active");
  openStack.push(win);
  restackWindows();
  overlay.classList.add("active");

  // Move focus into the window so keyboard users land inside it.
  win.querySelector("[data-close]")?.focus({ preventScroll: true });

  // Device-mockup videos only load/play while their window is open,
  // since the clips are large and there's no point streaming them
  // in the background. Skipped when the user prefers reduced motion.
  if (!reduceMotion.matches) {
    win.querySelectorAll(".device-screen").forEach((video) => {
      video.play().catch(() => {});
    });
  }
}

function closeWindow(win) {
  if (!win) return;
  win.classList.remove("active");
  win.style.removeProperty("--stack-offset");
  openStack = openStack.filter((w) => w !== win);
  restackWindows();

  win.querySelectorAll(".device-screen").forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });

  if (openStack.length === 0) {
    overlay.classList.remove("active");
  }

  openers.get(win)?.focus({ preventScroll: true });
  openers.delete(win);
}

function closeTopWindow() {
  const topWindow = openStack[openStack.length - 1];
  closeWindow(topWindow);
}

// ---------- Event delegation ----------

// Anything with data-open="some-id" opens #window-some-id; the red
// dot (data-close) closes only its own window.
document.addEventListener("click", (event) => {
  const opener = event.target.closest("[data-open]");
  if (opener) {
    openWindow(opener.dataset.open, opener);
    return;
  }

  const closer = event.target.closest("[data-close]");
  if (closer) {
    closeWindow(closer.closest(".window"));
  }
});

// Clicking the dimmed overlay closes the top-most window (i.e. "go back")
overlay.addEventListener("click", () => {
  closeTopWindow();
});

// Escape closes the top-most window
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTopWindow();
  }
});
