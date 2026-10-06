// ==========================
// INIT MAP
// ==========================
const map = L.map("map").setView([14.87, 120.45], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// layers for rerendering
const markerLayer = L.layerGroup().addTo(map);
const overlayLayer = L.layerGroup().addTo(map);

// ==========================
// HARDCODED SCHOOL LOCATIONS
// ==========================
const schoolCoords = {
  "Bangkal Elementary School": [14.8745, 120.4541],
  "Bayan-Bayanan Elementary School": [14.8721, 120.4473],
  "Colo Elementary School": [14.8689, 120.4622],
  "Dalao Elementary School": [14.8650, 120.4480],
  "Dinalupihan Elementary School": [14.8785, 120.4512],
  "Happy Valley Elementary School": [14.8602, 120.4705],
  "Kataasan Elementary School": [14.8710, 120.4601],
  "Layac Elementary School": [14.8842, 120.4398],
  "Luakan Elementary School": [14.8905, 120.4556],
  "Magsaysay Elementary School": [14.8677, 120.4520],
  "Maligaya Elementary School": [14.8699, 120.4467],
  "Naparing Elementary School": [14.8756, 120.4629],
  "Pag-asa Elementary School": [14.8662, 120.4593],
  "Payangan Elementary School": [14.8738, 120.4662],
  "Payumo Elementary School": [14.8705, 120.4700],
  "Pinulot Elementary School": [14.8621, 120.4588],
  "Roosevelt Elementary School": [14.8790, 120.4445],
  "Saguing Elementary School": [14.8719, 120.4732],
  "San Benito Elementary School": [14.8684, 120.4419],
  "San Pablo Elementary School": [14.8763, 120.4681],
  "Tubo-Tubo Elementary School": [14.8647, 120.4635]
};

// ==========================
// LOAD DATA
// ==========================

const children =
JSON.parse(
localStorage.getItem("children")
) || [];

console.log(children);

// ==========================
// RULE SYSTEM
// ==========================
const DEFAULT_RULES = [
  {
    min: 60,
    level: "CRITICAL",
    color: "#b91c1c",
    actions: [
      "Immediate feeding intervention",
      "Medical assessment required",
      "Report to health officer"
    ]
  },
  {
    min: 40,
    level: "HIGH",
    color: "#ef4444",
    actions: [
      "Start feeding program",
      "Increase monitoring frequency"
    ]
  },
  {
    min: 20,
    level: "MEDIUM",
    color: "#f59e0b",
    actions: [
      "Regular monitoring",
      "Nutrition education session"
    ]
  },
  {
    min: 0,
    level: "LOW",
    color: "#22c55e",
    actions: [
      "Maintain current program",
      "Routine check-ups"
    ]
  }
];

function getRules() {
  const stored = localStorage.getItem("riskRules");
  return stored ? JSON.parse(stored) : DEFAULT_RULES;
}

function getActionPlan(rate) {
  const rules = getRules();
  return rules.find(r => rate >= r.min) || rules[rules.length - 1];
}

// ==========================
// HELPERS
// ==========================
function getStatus(name) {

  const child = children.find(
    c =>
      (c.fullName || "").trim().toLowerCase() ===
      (name || "").trim().toLowerCase()
  );

  return child?.status || "Unknown";
}

function getChildColor(status) {
  if (status === "Underweight") return "red";
  if (status === "Normal") return "green";
  if (status === "Overweight") return "orange";
  return "gray";
}

function getSchoolColor(rate) {
  if (rate <= 20) return "green";
  if (rate <= 40) return "orange";
  return "red";
}

function getRiskLabel(rate) {
  if (rate <= 20) return "Low";
  if (rate <= 40) return "Medium";
  return "High";
}

function offsetCoords(coords) {
  const offset = 0.001;
  return [
    coords[0] + (Math.random() - 0.5) * offset,
    coords[1] + (Math.random() - 0.5) * offset
  ];
}

// ==========================
// FILTERS
// ==========================
function populateFilters() {
  const schoolSelect = document.getElementById("filterSchool");
  const gradeSelect = document.getElementById("filterGrade");

  if (!schoolSelect || !gradeSelect) return;

  schoolSelect.innerHTML = `<option value="All">All Schools</option>`;
  gradeSelect.innerHTML = `<option value="All">All Grades</option>`;

  [...new Set(children.map(c => c.barangay).filter(Boolean))]
    .sort()
    .forEach(s => {
      schoolSelect.innerHTML += `<option value="${s}">${s}</option>`;
    });

  [...new Set(children.map(c => c.grade).filter(Boolean))]
    .sort()
    .forEach(g => {
      gradeSelect.innerHTML += `<option value="${g}">${g}</option>`;
    });
}

function getFilteredChildren() {
  const school = document.getElementById("filterSchool")?.value || "All";
  const grade = document.getElementById("filterGrade")?.value || "All";
  const status = document.getElementById("filterStatus")?.value || "All";
  const risk = document.getElementById("filterRisk")?.value || "All";

  return children.filter(child => {
    const childStatus = getStatus(child.fullName);

    if (school !== "All" && child.barangay !== school) return false;
    if (grade !== "All" && child.grade !== grade) return false;
    if (status !== "All" && childStatus !== status) return false;

    if (risk !== "All") {
      const schoolKids = children.filter(c => c.barangay === child.barangay);
      const under = schoolKids.filter(c => getStatus(c.fullName) === "Underweight").length;
      const rate = schoolKids.length ? (under / schoolKids.length) * 100 : 0;
      const label = getRiskLabel(rate);

      if (label !== risk) return false;
    }

    return true;
  });
}

// ==========================
// GROUP BY SCHOOL
// ==========================
function groupBySchool(list = children) {
  const groups = {};

  list.forEach(child => {
    const school = child.barangay || "Unknown";

    if (!groups[school]) {
      groups[school] = {
        children: [],
        underweight: 0,
        normal: 0,
        overweight: 0
      };
    }

    const status = getStatus(child.fullName);

    groups[school].children.push(child);

    if (status === "Underweight") groups[school].underweight++;
    else if (status === "Normal") groups[school].normal++;
    else if (status === "Overweight") groups[school].overweight++;
  });

  return groups;
}

// ==========================
// SUMMARY
// ==========================
function renderSummaryCards(list = children) {
  let normal = 0;
  let under = 0;
  let over = 0;

  list.forEach(child => {
    const status = getStatus(child.fullName);

    if (status === "Normal") normal++;
    else if (status === "Underweight") under++;
    else if (status === "Overweight") over++;
  });

  const groups = groupBySchool(list);
  let highRisk = 0;

  for (const school in groups) {
    const g = groups[school];
    const rate = g.children.length ? (g.underweight / g.children.length) * 100 : 0;
    if (rate > 40) highRisk++;
  }

  document.getElementById("totalChildren").textContent = list.length;
  document.getElementById("totalNormal").textContent = normal;
  document.getElementById("totalUnderweight").textContent = under;
  document.getElementById("totalOverweight").textContent = over;
  document.getElementById("highRiskSchools").textContent = highRisk;
}

// ==========================
// RANKING
// ==========================
function renderRiskRanking(list = children) {
  const schoolGroups = groupBySchool(list);
  const riskList = document.getElementById("riskList");

  let rankings = [];

  for (const school in schoolGroups) {
    const g = schoolGroups[school];
    const total = g.children.length;
    const under = g.underweight;
    const rate = total ? (under / total) * 100 : 0;

    rankings.push({ school, total, under, rate });
  }

  rankings.sort((a, b) => b.rate - a.rate);
  riskList.innerHTML = "";

  rankings.forEach((item, index) => {
    const color = getSchoolColor(item.rate);

    let topClass = "";
    if (index === 0) topClass = "top1";
    if (index === 1) topClass = "top2";
    if (index === 2) topClass = "top3";

    riskList.innerHTML += `
      <div class="rank-item ${topClass}">
        <div class="rank-school">${index + 1}. ${item.school}</div>
        <div class="rank-rate">
          ${item.rate.toFixed(1)}% risk (${item.under}/${item.total})
        </div>
        <div class="rank-bar">
          <div class="rank-fill" style="width:${item.rate}%; background:${color};"></div>
        </div>
      </div>
    `;
  });
}

// ==========================
// STUDENT CARD
// ==========================
function showSchoolStudents(schoolName) {
  const container = document.getElementById("studentCardContainer");
  container.style.display = "flex";

  const schoolStudents = children.filter(c => c.barangay === schoolName);
  const grouped = {};

  schoolStudents.forEach(s => {
    const status = getStatus(s.fullName);
    const grade = s.grade || "Unknown Grade";

    if (!grouped[grade]) grouped[grade] = [];
    grouped[grade].push({
      name: s.fullName,
      status
    });
  });

  let html = `
    <div class="student-card">
      <h2>${schoolName}</h2>
      <p>Total Students: ${schoolStudents.length}</p>
      <hr>
  `;

  for (const grade in grouped) {
    html += `<div class="student-group"><h4>${grade}</h4>`;

    grouped[grade].forEach(st => {
      let color =
        st.status === "Underweight" ? "red" :
        st.status === "Overweight" ? "orange" :
        st.status === "Normal" ? "green" : "gray";

      html += `
        <div class="student-item">
          ${st.name}
          - <span class="student-status" style="color:${color}">
            ${st.status}
          </span>
        </div>
      `;
    });

    html += `</div>`;
  }

  html += `
      <br>
      <button onclick="closeStudentCard()" style="
        padding:8px 12px;
        background:#c62828;
        color:white;
        border:none;
        border-radius:8px;
        cursor:pointer;
      ">
        Close
      </button>
    </div>
  `;

  container.innerHTML = html;
}

function closeStudentCard() {
  document.getElementById("studentCardContainer").style.display = "none";
}

// ==========================
// MAP RENDER
// ==========================
function renderMap(list = children) {
  markerLayer.clearLayers();
  overlayLayer.clearLayers();

  const schoolGroups = groupBySchool(list);

  // child markers
  list.forEach(child => {
    const coords = schoolCoords[child.barangay]
      ? offsetCoords(schoolCoords[child.barangay])
      : [14.87, 120.45];

    const status = getStatus(child.fullName);

    L.circleMarker(coords, {
      radius: 6,
      fillColor: getChildColor(status),
      color: "#333",
      weight: 1,
      fillOpacity: 0.8
    })
      .bindPopup(`
        <b>${child.fullName}</b><br>
        ${child.barangay}<br>
        Status: ${status}
      `)
      .addTo(markerLayer);
  });

  // school overlays
  for (const school in schoolGroups) {
    if (!schoolCoords[school]) continue;

    const g = schoolGroups[school];
    const total = g.children.length;
    const under = g.underweight;
    const normal = g.normal;
    const over = g.overweight;
    const rate = total ? (under / total) * 100 : 0;
    const actionPlan = getActionPlan(rate);
    const center = schoolCoords[school];

    L.circle(center, {
      radius: 250 + (rate * 10),
      color: getSchoolColor(rate),
      weight: 5,
      fillColor: getSchoolColor(rate),
      fillOpacity: 0.08
    }).addTo(overlayLayer);

    L.marker(center, {
      icon: L.divIcon({
        className: "risk-label",
        html: `
          <div style="
            background:${getSchoolColor(rate)};
            color:white;
            padding:6px 12px;
            border-radius:20px;
            font-weight:bold;
            font-size:13px;
            box-shadow:0 3px 10px rgba(0,0,0,.25);
          ">
            ${rate.toFixed(1)}%
          </div>
        `,
        iconSize: [70, 30]
      })
    })
      .bindPopup(`
        <b>${school}</b><br>
        Total Children: ${total}<br><br>

        <div class="popup-bar">
          <div class="popup-seg under" style="width:${total ? (under/total)*100 : 0}%"></div>
          <div class="popup-seg normal" style="width:${total ? (normal/total)*100 : 0}%"></div>
          <div class="popup-seg over" style="width:${total ? (over/total)*100 : 0}%"></div>
        </div>

        🟢 Normal: <b>${normal}</b><br>
        🔴 Underweight: <b>${under}</b><br>
        🟠 Overweight: <b>${over}</b><br><br>

        <b style="color:${actionPlan.color}">
          Risk Level: ${actionPlan.level}
        </b>

        <br><br>

        <b>Recommended Actions:</b>
        <ul style="margin-left:15px;">
          ${actionPlan.actions.map(a => `<li>${a}</li>`).join("")}
        </ul>

        <button onclick="showSchoolStudents('${school}')" style="
          margin-top:10px;
          padding:8px 12px;
          background:#1b5e20;
          color:white;
          border:none;
          border-radius:8px;
          cursor:pointer;
        ">
          View Students
        </button>
      `)
      .addTo(overlayLayer);
  }
}

// ==========================
// APPLY FILTERS
// ==========================
function applyFilters() {
  const filtered = getFilteredChildren();
  renderMap(filtered);
  renderRiskRanking(filtered);
  renderSummaryCards(filtered);
}

// ==========================
// INIT
// ==========================
populateFilters();
applyFilters();

["filterSchool", "filterGrade", "filterStatus", "filterRisk"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", applyFilters);
});

const clearBtn = document.getElementById("clearFilters");
if (clearBtn) {
  clearBtn.onclick = () => {
    document.getElementById("filterSchool").value = "All";
    document.getElementById("filterGrade").value = "All";
    document.getElementById("filterStatus").value = "All";
    document.getElementById("filterRisk").value = "All";
    applyFilters();
  };
}

// ==========================
// LOGOUT
// ==========================
function logout() {
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (!confirmLogout) return;

  localStorage.removeItem("currentUser");
  sessionStorage.clear();
  window.location.href = "../signin.html";
}


let trendChart;

function renderTrendChart() {
    const ctx = document.getElementById("trendChart");
    if (!ctx) return;

    const school = document.getElementById("trendSchool")?.value || "All";

    let filtered = [...children];

    if (school !== "All") {
        filtered = filtered.filter(c => c.barangay === school);
    }

    const monthly = {};

    filtered.forEach(child => {
        const date = new Date(child.dateAdded || new Date());
        const month = date.toLocaleString("default", {
            month: "short"
        });

        if (!monthly[month]) {
            monthly[month] = {
                normal: 0,
                under: 0,
                over: 0
            };
        }

        const status = getStatus(child.fullName);

        if (status === "Normal") monthly[month].normal++;
        if (status === "Underweight") monthly[month].under++;
        if (status === "Overweight") monthly[month].over++;
    });

    const labels = Object.keys(monthly);
    const normalData = labels.map(m => monthly[m].normal);
    const underData = labels.map(m => monthly[m].under);
    const overData = labels.map(m => monthly[m].over);

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Normal",
                    data: normalData,
                    borderColor: "green",
                    backgroundColor: "transparent",
                    tension: .4
                },
                {
                    label: "Underweight",
                    data: underData,
                    borderColor: "red",
                    backgroundColor: "transparent",
                    tension: .4
                },
                {
                    label: "Overweight",
                    data: overData,
                    borderColor: "orange",
                    backgroundColor: "transparent",
                    tension: .4
                }
            ]
        },
        options: {
            responsive:true,
            plugins:{
                legend:{
                    position:"top"
                }
            }
        }
    });
}

function populateTrendSchool() {
    const select = document.getElementById("trendSchool");
    if (!select) return;

    [...new Set(children.map(c => c.barangay))]
        .sort()
        .forEach(s=>{
            select.innerHTML += `<option value="${s}">${s}</option>`;
        });
}

document
.getElementById("trendSchool")
?.addEventListener("change", renderTrendChart);

populateTrendSchool();
renderTrendChart();