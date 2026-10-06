document.addEventListener("DOMContentLoaded", () => {
  loadChildSwitcher();
  loadActiveChild();
  loadSchedule();
});

// ==========================
// GET PARENT
// ==========================
function getParent() {
  return JSON.parse(localStorage.getItem("currentParent"));
}

// ==========================
// CHILD SWITCHER
// ==========================
function loadChildSwitcher() {
  const parent = getParent();
  const children = JSON.parse(localStorage.getItem("children")) || [];
  const box = document.getElementById("childSwitcher");

  if (!parent) return;

  const myChildren = children.filter(c => c.parentId === parent.id);

  box.innerHTML = "";

  myChildren.forEach(child => {
    const div = document.createElement("div");
    div.className = "child-item";

    if (localStorage.getItem("activeChild") == child.id) {
      div.classList.add("active");
    }

    div.innerHTML = `
      <div class="child-name">${child.fullName}</div>
      <div class="child-meta">${child.grade || ""} ${child.barangay || ""}</div>
    `;

    div.onclick = () => {
      localStorage.setItem("activeChild", child.id);
      loadActiveChild();
      loadChildSwitcher();
      loadSchedule();
    };

    box.appendChild(div);
  });
}

// ==========================
// LOAD ACTIVE CHILD
// ==========================
function loadActiveChild() {
  const children = JSON.parse(localStorage.getItem("children")) || [];
  const students = JSON.parse(localStorage.getItem("students")) || [];

  const activeId = localStorage.getItem("activeChild");

  const child = children.find(c => c.id == activeId);

  if (!child) return;

  document.getElementById("childName").innerText = child.fullName;
  document.getElementById("childAge").innerText = "Age: " + child.age;
  document.getElementById("childBarangay").innerText = "School: " + child.barangay;

  const record = students.find(s =>
    (s.name || "").toLowerCase() === child.fullName.toLowerCase()
  );

  document.getElementById("childStatus").innerText =
    record ? record.status : "No data";
}

// ==========================
// SCHEDULE
// ==========================
function loadSchedule() {
  const list = document.getElementById("scheduleList");
  const events = JSON.parse(localStorage.getItem("calendarEvents")) || [];

  const today = new Date();

  const upcoming = events
    .filter(e => new Date(e.date) >= today)
    .slice(0, 5);

  list.innerHTML = "";

  if (upcoming.length === 0) {
    list.innerHTML = "<li>No schedule</li>";
    return;
  }

  upcoming.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.date} - ${e.title}`;
    list.appendChild(li);
  });
}

// ==========================
// NAV
// ==========================
function goTo(page) {
  window.location.href = page;
}

// ==========================
// LOGOUT FIX (NO AUTO LOGOUT BUG)
// ==========================
function logout(event) {
  if (event) event.preventDefault();

  const confirmLogout = confirm("Are you sure you want to logout?");
  if (!confirmLogout) return;

  localStorage.removeItem("currentParent");
  localStorage.removeItem("activeChild");

  window.location.href = "../signin.html";
}