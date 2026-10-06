// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  refreshDashboard();
});

// ==========================
// MAIN REFRESH FUNCTION
// ==========================
function refreshDashboard() {
  loadStats();
  loadUpcoming();
  initDashboardMap();
}

// ==========================
// ALERT BUTTON
// ==========================
// ==========================
// NOTIFICATION SYSTEM
// ==========================
function checkNotifications() {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

  const badge = document.getElementById("alertBadge");

  if (notifications.length > 0) {
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// CALL ON LOAD
document.addEventListener("DOMContentLoaded", () => {
  checkNotifications();
});

// ==========================
// ALERT CLICK (MARK AS READ)
// ==========================
function showAlert() {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

  if (notifications.length === 0) {
    alert("No new notifications.");
    return;
  }

  // Show latest notification
  alert(notifications[0]);

  // Clear notifications (mark as read)
  localStorage.setItem("notifications", JSON.stringify([]));

  // Hide badge
  document.getElementById("alertBadge").classList.add("hidden");
}

// ==========================
// SAFE STORAGE READ
// ==========================
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    console.error("Invalid JSON in", key);
    return [];
  }
}

// ==========================
// CLEAN STATUS NORMALIZER (IMPORTANT FIX)
// ==========================
function normalizeStatus(status) {
  return (status || "")
    .toString()
    .toLowerCase()
    .trim();
}

// ==========================
// REMOVE DUPLICATES (SAFE)
// ==========================
function uniqueStudents(students) {
  const map = new Map();

  students.forEach(s => {
    const key = (s.name || s.fullName || "").toLowerCase().trim();
    map.set(key, s);
  });

  return Array.from(map.values());
}

// ==========================
// STATS (FIXED AT-RISK ISSUE)
// ==========================
function loadStats() {
  const children = getData("children");
  let students = uniqueStudents(getData("students"));

  console.log("STUDENTS RAW:", students); // DEBUG LINE

  const cards = document.querySelectorAll(".stats-grid .card p");
  if (cards.length < 4) return;

  // TOTAL CHILDREN
  cards[0].innerText = children.length;

  // AT RISK (FULLY RELIABLE CHECK)
  const atRiskList = students.filter(s => {
    const status = normalizeStatus(s.status);

    return status === "underweight" || status === "overweight";
  });

  console.log("AT RISK LIST:", atRiskList); // DEBUG LINE

  cards[1].innerText = atRiskList.length;

  // BARANGAYS
  const barangays = [...new Set(children.map(c => c.barangay))];
  cards[2].innerText = barangays.length;

  // SMS (placeholder)
  cards[3].innerText = 0;
}

// ==========================
// UPCOMING SCHEDULES
// ==========================
function loadUpcoming() {
  const events = getData("calendarEvents");

  const container = document.querySelector(".schedule-card");
  if (!container) return;

  const old = container.querySelector(".schedule-list");
  if (old) old.remove();

  const list = document.createElement("ul");
  list.className = "schedule-list";

  const today = new Date();

  const upcoming = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (upcoming.length === 0) {
    list.innerHTML = `<li>No upcoming schedules</li>`;
  } else {
    upcoming.forEach(e => {
      const d = new Date(e.date);

      const formatted = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });

      list.innerHTML += `
        <li>
          <span class="date">${formatted}</span>
          <span>${e.title}</span>
        </li>
      `;
    });
  }

  container.appendChild(list);
}

// ==========================
// MAP
// ==========================
function initDashboardMap() {
  const map = L.map("map").setView([14.87, 120.45], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  const children = getData("children");
  const students = uniqueStudents(getData("students"));

  function getStatus(name) {
    const found = students.find(s =>
      (s.name || s.fullName || "").toLowerCase().trim() ===
      (name || "").toLowerCase().trim()
    );

    return found ? found.status : "Unknown";
  }

  function getColor(status) {
    const s = normalizeStatus(status);

    if (s === "underweight") return "red";
    if (s === "normal") return "green";
    if (s === "overweight") return "orange";
    return "gray";
  }

  const markers = [];

  children.forEach(child => {
    if (!child.lat || !child.lng) return;

    const status = getStatus(child.fullName);
    const color = getColor(status);

    const marker = L.circleMarker([child.lat, child.lng], {
      radius: 7,
      fillColor: color,
      color: "#333",
      weight: 1,
      fillOpacity: 0.9
    }).addTo(map);

    marker.bindPopup(`
      <b>${child.fullName}</b><br>
      ${child.address || ""}<br>
      ${child.barangay || ""}<br>
      Status: ${status}
    `);

    markers.push(marker);
  });

  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [20, 20] });
  }

  setTimeout(() => map.invalidateSize(), 300);
}

document.querySelectorAll(".feature-box").forEach(box => {
  box.addEventListener("click", () => {
    const text = box.innerText.trim();

    if (text === "Feeding Process") {
      window.location.href = "feeding.html";
    }

    else if (text === "Assessment") {
      window.location.href = "assessment.html";
    }

    else if (text === "Scheduling") {
      window.location.href = "scheduling.html";
    }

    else if (text === "Alerts") {
      window.location.href = "mainpage.html";
    }

    else if (text === "Direct Message") {
      window.location.href = "messages.html";
    }

    else if (text === "SMS Notification") {
      window.location.href = "sms.html";
    }
  });
});

// ==========================
// NOTIFICATION SYSTEM
// ==========================
function checkNotifications() {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

  const badge = document.getElementById("alertBadge");

  if (notifications.length > 0) {
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// CALL ON LOAD
document.addEventListener("DOMContentLoaded", () => {
  checkNotifications();
});

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