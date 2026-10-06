let historyData = [];
let currentRecord = null;

/* ==========================
   PAGE LOAD
========================== */

window.addEventListener("DOMContentLoaded", () => {

  loadSchools();

});


/* ==========================
   CHART
========================== */

const chart = new Chart(
  document.getElementById("growthChart"),
  {
    type: "line",

    data: {
      labels: [],

      datasets: [{
        label: "BMI",

        data: [],

        fill: false,

        tension: 0.3
      }]
    },

    options: {
      responsive: true
    }
  }
);


/* ==========================
   CALCULATE BMI
========================== */

function calculateBMI() {

  const childId =
    document.getElementById("childSelect").value;

  if (!childId) {

    alert("Select a child");

    return;
  }

  const children =
    JSON.parse(
      localStorage.getItem("children")
    ) || [];

  const child =
    children.find(c =>
      String(c.id) === String(childId)
    );

  if (!child) {

    alert("Child not found");

    return;
  }

  const heightCm =
    parseFloat(
      document.getElementById("height").value
    );

  const weight =
    parseFloat(
      document.getElementById("weight").value
    );

  if (!heightCm || !weight) {

    alert(
      "Enter height and weight"
    );

    return;
  }

  const height =
    heightCm / 100;

  const bmi =
    (
      weight /
      (height * height)
    ).toFixed(2);


  let status = "";

  let className = "";

  let message = "";


  if (bmi < 18.5) {

    status = "Underweight";

    className = "under";

    message =
      "Needs more nutrition.";

  }

  else if (bmi < 25) {

    status = "Normal";

    className = "normal";

    message =
      "Healthy range.";

  }

  else {

    status = "Overweight";

    className = "over";

    message =
      "Needs monitoring.";
  }


  document.getElementById(
    "bmiValue"
  ).innerText = bmi;


  const badge =
    document.getElementById(
      "statusBadge"
    );

  badge.innerText =
    status;

  badge.className =
    "badge " + className;


  document.getElementById(
    "statusText"
  ).innerText =
    message;


  document.getElementById(
    "profileName"
  ).innerText =
    child.fullName;


  document.getElementById(
    "profileAge"
  ).innerText =
    `Age: ${child.age}`;


  const date =
    new Date()
    .toLocaleDateString();


  currentRecord = {

    id: child.id,

    name: child.fullName,

    age: child.age,

    grade: child.grade,

    gender: child.gender,

    barangay: child.barangay,

    height: heightCm,

    weight: weight,

    bmi: bmi,

    status: status,

    date: date
  };


  updatePreview();
}



/* ==========================
   SAVE DATA
========================== */

function saveData() {

  if (!currentRecord) {
    alert("Calculate BMI first");
    return;
  }

  // Save assessment history
  let assessments =
    JSON.parse(
      localStorage.getItem("assessments")
    ) || [];

  assessments.push(currentRecord);

  localStorage.setItem(
    "assessments",
    JSON.stringify(assessments)
  );

  // Update child record
  let children =
    JSON.parse(
      localStorage.getItem("children")
    ) || [];

  const index =
    children.findIndex(
      child =>
        String(child.id) ===
        String(currentRecord.id)
    );

  if (index !== -1) {

    children[index].status =
      currentRecord.status;

    children[index].bmi =
      currentRecord.bmi;

    children[index].height =
      currentRecord.height;

    children[index].weight =
      currentRecord.weight;

    children[index].lastAssessment =
      currentRecord.date;

    localStorage.setItem(
      "children",
      JSON.stringify(children)
    );
  }

  alert("Saved successfully!");

  loadStudentData(currentRecord.name);
}



/* ==========================
   PREVIEW HISTORY
========================== */

function updatePreview() {

  const temp =
    [...historyData];

  temp.push(
    currentRecord
  );

  updateHistory(
    temp
  );
}



/* ==========================
   HISTORY TABLE
========================== */

function updateHistory(
  records = historyData
) {

  const table =
    document.getElementById(
      "historyTable"
    );

  table.innerHTML = "";


  records.forEach(item => {

    table.innerHTML += `

      <tr>

        <td>${item.date}</td>

        <td>${item.age}</td>

        <td>${item.height}</td>

        <td>${item.weight}</td>

        <td>${item.bmi}</td>

        <td>${item.status}</td>

      </tr>

    `;
  });
}



/* ==========================
   LOAD SAVED HISTORY
========================== */

function loadStudentData(
  name
) {

  const assessments =

    JSON.parse(
      localStorage.getItem(
        "assessments"
      )
    ) || [];


  historyData =

    assessments.filter(

      item =>

      item.name
      .toLowerCase()

      ===

      name
      .toLowerCase()
    );


  chart.data.labels = [];

  chart.data.datasets[0].data = [];


  historyData.forEach(

    item => {

      chart.data.labels.push(

        item.date

      );

      chart.data.datasets[0].data.push(

        item.bmi

      );
    }
  );


  chart.update();

  updateHistory();
}



/* ==========================
   LOAD SCHOOLS
========================== */

function loadSchools() {

  const children =

    JSON.parse(
      localStorage.getItem(
        "children"
      )
    ) || [];


  const schoolSelect =

    document.getElementById(
      "schoolSelect"
    );


  const schools =

    [...new Set(

      children.map(

        c => c.barangay

      )

    )];


  schoolSelect.innerHTML =

    '<option value="">Select School</option>';


  schools.forEach(

    school => {

      schoolSelect.innerHTML += `

        <option value="${school}">

          ${school}

        </option>

      `;
    }
  );
}



/* ==========================
   LOAD CHILDREN
========================== */

function loadSchoolChildren() {

  const school =

    document.getElementById(
      "schoolSelect"
    ).value;


  const children =

    JSON.parse(
      localStorage.getItem(
        "children"
      )
    ) || [];


  const filtered =

    children.filter(

      child =>

      child.barangay === school
    );


  const childSelect =

    document.getElementById(
      "childSelect"
    );


  childSelect.innerHTML =

    '<option value="">Select Child</option>';


  filtered.forEach(

    child => {

      childSelect.innerHTML += `

      <option value="${child.id}">

        ${child.fullName}

      </option>

      `;
    }
  );
}



/* ==========================
   LOAD CHILD INFO
========================== */

function loadChildInfo() {

  const childId =

    document.getElementById(
      "childSelect"
    ).value;


  if (!childId)
    return;


  const children =

    JSON.parse(
      localStorage.getItem(
        "children"
      )
    ) || [];


  const child =

    children.find(

      c =>

      String(c.id)

      ===

      String(childId)
    );


  if (!child)
    return;


  document.getElementById(
    "age"
  ).value =
    child.age || "";


  document.getElementById(
    "grade"
  ).value =
    child.grade || "";


  document.getElementById(
    "gender"
  ).value =
    child.gender || "";


  document.getElementById(
    "profileName"
  ).innerText =
    child.fullName;


  document.getElementById(
    "profileAge"
  ).innerText =
    `Age: ${child.age}`;


  loadStudentData(
    child.fullName
  );
}



/* ==========================
   LOGOUT
========================== */

function logout() {

  if (
    !confirm(
      "Are you sure you want to logout?"
    )
  ) return;


  localStorage.removeItem(
    "currentUser"
  );


  sessionStorage.clear();


  window.location.href =
    "../signin.html";
}

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

function addRow(record) {
  const row = document.createElement("tr");

  let statusClass = "";
  if (record.status === "Underweight") statusClass = "under";
  if (record.status === "Normal") statusClass = "normal";
  if (record.status === "Overweight") statusClass = "over";

  row.innerHTML = `
    <td>${record.name || ''}</td>
    <td>${record.barangay || ''}</td>
    <td>${record.grade || ''}</td>
    <td>${record.height || ''}</td>
    <td>${record.weight || ''}</td>
    <td>${record.bmi || ''}</td>
    <td class="${statusClass}">${record.status || ''}</td>
    <td>
      <div class="action-buttons">
        <button class="trend-btn" onclick="viewTrend('${record.name}')">📈 Trend</button>
      </div>
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