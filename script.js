// Existing variables + functions remain same...

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");

  // Change button icon
  document.querySelectorAll(".toggleDarkBtn").forEach(btn => {
    btn.textContent = isDark ? "☀️" : "🌙";
  });
}

// Load saved dark mode
window.onload = () => {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "enabled") {
    document.body.classList.add("dark");
    document.querySelectorAll(".toggleDarkBtn").forEach(btn => btn.textContent = "☀️");
  }
};
