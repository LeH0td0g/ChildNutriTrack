const calendar = document.getElementById("calendar");
const modal = document.getElementById("eventModal");

let currentDate = new Date();
let draggedId = null;

// INIT
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
});

// ==========================
// RENDER CALENDAR
// ==========================
function renderCalendar() {
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById("monthYear").innerText =
    currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // EMPTY SPACES
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    calendar.appendChild(empty);
  }

  // DAYS
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = formatDate(year, month, d);
    const events = getEvents(dateStr);

    const day = document.createElement("div");
    day.className = "day";

    // 🔥 FIX: CLICK ALWAYS WORKS
    day.addEventListener("click", () => openModal(dateStr));

    day.ondragover = (e) => e.preventDefault();
    day.ondrop = () => dropEvent(dateStr);

    const dateLabel = document.createElement("div");
    dateLabel.className = "date";
    dateLabel.textContent = d;

    const eventsContainer = document.createElement("div");
    eventsContainer.className = "events";

    events.forEach(ev => {
      const eventDiv = document.createElement("div");

      eventDiv.className =
        `event grade-${ev.grade.replace(" ", "")} bar-${ev.barangay}`;

      eventDiv.textContent = ev.title;
      eventDiv.draggable = true;

      // DRAG
      eventDiv.addEventListener("dragstart", () => {
        draggedId = ev.id;
      });

      // 🔥 IMPORTANT FIX
      eventDiv.addEventListener("click", (e) => {
        e.stopPropagation(); // prevents blocking day click
        showDetails(ev);
      });

      eventsContainer.appendChild(eventDiv);
    });

    day.appendChild(dateLabel);
    day.appendChild(eventsContainer);
    calendar.appendChild(day);
  }
}

// ==========================
// MODAL
// ==========================
function openModal(date) {
  document.getElementById("eventDate").value = date;
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

// ==========================
// SAVE EVENT
// ==========================
function saveEvent() {
  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value;
  const grade = document.getElementById("eventGrade").value;
  const barangay = document.getElementById("eventBarangay").value;

  if (!title || !date) {
    alert("Please fill required fields");
    return;
  }

  const events = getAllEvents();

  events.push({
    id: Date.now().toString(),
    title,
    date,
    grade,
    barangay
  });

  localStorage.setItem("calendarEvents", JSON.stringify(events));

  closeModal();
  renderCalendar();
}

// ==========================
// EVENT DETAILS
// ==========================
function showDetails(ev) {
  const confirmDelete = confirm(
    `Event: ${ev.title}
Date: ${ev.date}
Grade: ${ev.grade}
Barangay: ${ev.barangay}

Delete this event?`
  );

  if (confirmDelete) {
    deleteEvent(ev.id);
  }
}

function deleteEvent(id) {
  let events = getAllEvents();

  events = events.filter(e => e.id !== id);

  localStorage.setItem("calendarEvents", JSON.stringify(events));

  renderCalendar();
}

// ==========================
// DRAG & DROP
// ==========================
function dropEvent(newDate) {
  let events = getAllEvents();

  events = events.map(e => {
    if (e.id === draggedId) {
      e.date = newDate;
    }
    return e;
  });

  localStorage.setItem("calendarEvents", JSON.stringify(events));
  renderCalendar();
}

// ==========================
// HELPERS
// ==========================
function getAllEvents() {
  return JSON.parse(localStorage.getItem("calendarEvents")) || [];
}

function getEvents(date) {
  return getAllEvents().filter(e => e.date === date);
}

function formatDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// ==========================
// NAVIGATION
// ==========================
function next() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

function prev() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

// (optional for your buttons)
function setView() {
  // not used yet (safe placeholder)
}

function logout() {
  const confirmLogout = confirm("Are you sure you want to logout?");

  if (!confirmLogout) return;

  // Clear session-related data
  localStorage.removeItem("currentUser");
  sessionStorage.clear();

  // Optional: clear everything if your system is simple
  // localStorage.clear();

  // Redirect to login page
  window.location.href = "../signin.html";
}