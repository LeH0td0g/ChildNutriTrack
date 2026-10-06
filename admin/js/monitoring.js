const tableBody = document.querySelector("#studentTable tbody");

window.addEventListener("DOMContentLoaded", loadMonitoring);

// LOAD DATA
function loadMonitoring() {
  const data = JSON.parse(localStorage.getItem("assessments")) || [];

  tableBody.innerHTML = "";

  // get latest record per student
  const latestRecords = {};

  data.forEach(record => {
    const name = record.name;

    if (!latestRecords[name]) {
      latestRecords[name] = record;
    } else {
      // replace if newer
      const existingDate = new Date(latestRecords[name].date);
      const newDate = new Date(record.date);

      if (newDate > existingDate) {
        latestRecords[name] = record;
      }
    }
  });

  const recordsArray = Object.values(latestRecords);

  recordsArray.forEach(record => {
    addRow(record);
  });

  toggleEmpty(recordsArray.length);
}

// ADD ROW
function addRow(record) {
  const row = document.createElement("tr");

  let statusClass = "";
  if (record.status === "Underweight") statusClass = "under";
  if (record.status === "Normal") statusClass = "normal";
  if (record.status === "Overweight") statusClass = "over";

  row.innerHTML = `
    <td>${record.name}</td>
    <td>${record.barangay}</td>
    <td>${record.grade}</td>
    <td>${record.height}</td>
    <td>${record.weight}</td>
    <td>${record.bmi}</td>
    <td class="${statusClass}">${record.status}</td>
    <td>
      <button onclick="viewTrend('${record.name}')">Trend</button>
      <button class="delete-btn" onclick="deleteRecord('${record.name}')">Delete</button>
    </td>
  `;

  tableBody.appendChild(row);
}

// FILTER
function filterTable() {
  const search = document.getElementById("search").value.toLowerCase();
  const barangay = document.getElementById("barangay").value;
  const grade = document.getElementById("grade").value;

  const rows = document.querySelectorAll("#studentTable tbody tr");
  let visible = 0;

  rows.forEach(row => {
    const name = row.cells[0].innerText.toLowerCase();
    const rowBarangay = row.cells[1].innerText;
    const rowGrade = row.cells[2].innerText;

    const match =
      name.includes(search) &&
      (barangay === "" || barangay === rowBarangay) &&
      (grade === "" || grade === rowGrade);

    row.style.display = match ? "" : "none";

    if (match) visible++;
  });

  toggleEmpty(visible);
}

// EMPTY STATE
function toggleEmpty(count) {
  document.getElementById("emptyState").style.display =
    count === 0 ? "block" : "none";
}

function deleteRecord(name) {
  if (!confirm("Delete all records for this student?")) return;

  let data = JSON.parse(localStorage.getItem("assessments")) || [];

  // remove all records of that student
  data = data.filter(record => record.name !== name);

  localStorage.setItem("assessments", JSON.stringify(data));

  loadMonitoring();
}

let trendChart = null;

function viewTrend(name) {
  const data = JSON.parse(localStorage.getItem("assessments")) || [];

  const records = data
    .filter(r => r.name === name)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (records.length === 0) {
    alert("No data found.");
    return;
  }

  const labels = records.map(r => r.date);
  const bmiValues = records.map(r => parseFloat(r.bmi));

  document.getElementById("trendTitle").innerText = name + " - BMI Trend";
  document.getElementById("trendModal").style.display = "flex";

  // destroy old chart if exists
  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "BMI",
        data: bmiValues,
        fill: false,
        tension: 0.3
      }]
    }
  });
}

function closeTrend() {
  document.getElementById("trendModal").style.display = "none";
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