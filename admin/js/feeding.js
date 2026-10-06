// ==========================
// STORAGE KEYS
// ==========================
const FEEDING_KEY = "feedingProgram";
const MEALS_KEY = "feedingMeals";

let editIndex = null;

// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", () => {
    loadChildrenDropdown();
    loadParticipants();
    loadMeals();
    loadSchoolSummary();
    populateSchoolFilter();
    updateStats();
});

// ==========================
// DATA HELPERS
// ==========================
function getChildren() {
  return JSON.parse(localStorage.getItem("children")) || [];
}

function getParticipants() {
  return JSON.parse(localStorage.getItem(FEEDING_KEY)) || [];
}

function getMeals() {
  return JSON.parse(localStorage.getItem(MEALS_KEY)) || [];
}

// ==========================
// LOAD CHILDREN
// ==========================
function loadChildrenDropdown() {

  const select = document.getElementById("childSelect");

  if (!select) return;

  const children = getChildren();

  select.innerHTML =
    `<option value="">Select Child</option>`;

  children.forEach(child => {

    select.innerHTML += `
      <option value="${child.id}">
        ${child.fullName}
      </option>
    `;
  });
}

// ==========================
// ENROLL CHILD
// ==========================
function enrollChild() {

  const childId =
    document.getElementById("childSelect").value;

  const status =
    document.getElementById("programStatus").value;

  const startDate =
    document.getElementById("startDate").value;

  const startWeight =
    document.getElementById("startWeight").value;

  if (
    !childId ||
    !startDate ||
    !startWeight
  ) {
    alert("Please complete all fields.");
    return;
  }

  const children = getChildren();
  const participants = getParticipants();

  const child = children.find(
    c => String(c.id) === String(childId)
  );

  if (!child) {
    alert("Child not found.");
    return;
  }

  const exists = participants.find(
    p => String(p.childId) === String(childId)
  );

  if (exists) {
    alert("Child already enrolled.");
    return;
  }

  participants.push({
  childId: child.id,
  childName: child.fullName,
  school: child.barangay,

  nutritionStatus:
    getNutritionStatus(child.fullName),

  status,
  startDate,

  startWeight: Number(startWeight),
  currentWeight: Number(startWeight)
});

  localStorage.setItem(
    FEEDING_KEY,
    JSON.stringify(participants)
  );

  alert("Child enrolled successfully.");

  document.getElementById("childSelect").value = "";
  document.getElementById("startDate").value = "";
  document.getElementById("startWeight").value = "";

  loadParticipants();
  updateStats();
}

// ==========================
// LOAD PARTICIPANTS
// ==========================
function loadParticipants() {

  const participants = getParticipants().sort((a, b) =>
    a.school.localeCompare(b.school)
  );

  const tbody =
    document.querySelector("#feedingTable tbody");

  if (!tbody) return;

  tbody.innerHTML = "";

  // ==========================
  // GROUP BY SCHOOL
  // ==========================
  const grouped = {};

  participants.forEach(participant => {

    if (!grouped[participant.school]) {
      grouped[participant.school] = [];
    }

    grouped[participant.school].push(participant);

  });

  const schools = Object.keys(grouped).sort();

  // ==========================
  // RENDER EACH SCHOOL
  // ==========================
  schools.forEach(school => {

    tbody.innerHTML += `
      <tr class="school-row">
        <td colspan="10">
          🏫 <strong>${school}</strong>
          (${grouped[school].length} Participants)
        </td>
      </tr>
    `;

    grouped[school].forEach(participant => {

      const gain =
        participant.currentWeight -
        participant.startWeight;

      let badge = "";

      if (participant.status === "Active") {
        badge =
          '<span class="status-active">Active</span>';
      }

      if (participant.status === "Completed") {
        badge =
          '<span class="status-completed">Completed</span>';
      }

      if (participant.status === "Dropped") {
        badge =
          '<span class="status-dropped">Dropped</span>';
      }

      const priority =
        getPriority(participant.nutritionStatus);

      const nutritionBadge = `
        <span class="
          nutrition-badge
          nutrition-${(participant.nutritionStatus || "unknown")
            .toLowerCase()
            .replace(/\s+/g, "-")}
        ">
          ${participant.nutritionStatus || "Unknown"}
        </span>
      `;

      const priorityBadge = `
        <span
          class="priority-badge"
          style="
            background:${priority.color};
            color:white;
            padding:5px 10px;
            border-radius:20px;
            font-size:12px;
            font-weight:600;
          "
        >
          ${priority.level}
        </span>
      `;

      tbody.innerHTML += `
        <tr>

          <td>${participant.childName}</td>

          <td>${participant.school}</td>

          <td>${nutritionBadge}</td>

          <td>${priorityBadge}</td>

          <td>${badge}</td>

          <td>${participant.startDate}</td>

          <td>${participant.startWeight} kg</td>

          <td>${participant.currentWeight} kg</td>

          <td>${gain.toFixed(1)} kg</td>

          <td>

            <button
              class="edit-btn"
              onclick="editParticipant(${participants.indexOf(participant)})">
              Edit
            </button>

            <button
              class="delete-btn"
              onclick="deleteParticipant(${participants.indexOf(participant)})">
              Delete
            </button>

          </td>

        </tr>
      `;

    });

  });

}
// ==========================
// EDIT PARTICIPANT
// ==========================
function editParticipant(index) {

  const participants = getParticipants();

  editIndex = index;

  document.getElementById("editWeight").value =
    participants[index].currentWeight;

  document.getElementById("editStatus").value =
    participants[index].status;

  document.getElementById("editCard").style.display =
    "flex";
}

// ==========================
// UPDATE PARTICIPANT
// ==========================
function updateParticipant() {

  const participants = getParticipants();

  participants[editIndex].currentWeight =
    Number(
      document.getElementById("editWeight").value
    );

  participants[editIndex].status =
    document.getElementById("editStatus").value;

  localStorage.setItem(
    FEEDING_KEY,
    JSON.stringify(participants)
  );

  closeEdit();

  loadParticipants();
  updateStats();
}

// ==========================
// CLOSE MODAL
// ==========================
function closeEdit() {

  document.getElementById("editCard").style.display =
    "none";
}

// ==========================
// DELETE
// ==========================
function deleteParticipant(index) {

  if (
    !confirm(
      "Remove participant from feeding program?"
    )
  ) {
    return;
  }

  const participants = getParticipants();

  participants.splice(index, 1);

  localStorage.setItem(
    FEEDING_KEY,
    JSON.stringify(participants)
  );

  loadParticipants();
  updateStats();
}

// ==========================
// RECORD MEAL
// ==========================
function recordMeal() {

  const date =
    document.getElementById("mealDate").value;

  const meal =
    document.getElementById("mealServed").value;

  const count =
    document.getElementById("mealCount").value;

  if (!date || !meal || !count) {

    alert("Please complete meal details.");

    return;
  }

  const meals = getMeals();

  meals.push({
    date,
    meal,
    count: Number(count)
  });

  localStorage.setItem(
    MEALS_KEY,
    JSON.stringify(meals)
  );

  document.getElementById("mealDate").value = "";
  document.getElementById("mealServed").value = "";
  document.getElementById("mealCount").value = "";

  loadMeals();
  updateStats();
}

// ==========================
// LOAD MEALS
// ==========================
function loadMeals() {

  const meals = getMeals();

  const tbody =
    document.querySelector("#mealTable tbody");

  if (!tbody) return;

  tbody.innerHTML = "";

  meals.forEach(record => {

    tbody.innerHTML += `
      <tr>

        <td>${record.date}</td>

        <td>${record.meal}</td>

        <td>${record.count}</td>

      </tr>
    `;
  });
}

// ==========================
// FILTER
// ==========================
function filterProgram() {

    const search =
        document.getElementById("searchProgram")
        .value
        .toLowerCase();

    const school =
        document.getElementById("filterSchool")
        .value;

    const rows =
        document.querySelectorAll(
            "#feedingTable tbody tr"
        );

    rows.forEach(row => {

        const text =
            row.textContent.toLowerCase();

        const rowSchool =
            row.children[1].textContent;

        const matchesSearch =
            text.includes(search);

        const matchesSchool =
            !school ||
            rowSchool === school;

        row.style.display =
            matchesSearch && matchesSchool
                ? ""
                : "none";
    });
}
///////////////
//SCHOOL FILTER
///////////////
function populateSchoolFilter() {

    const select =
        document.getElementById("filterSchool");

    if (!select) return;

    const schools =
        [...new Set(
            getParticipants().map(
                p => p.school
            )
        )];

    select.innerHTML =
        '<option value="">All Schools</option>';

    schools
        .sort()
        .forEach(school => {

            select.innerHTML += `
                <option value="${school}">
                    ${school}
                </option>
            `;
        });
}

// ==========================
// DASHBOARD STATS
// ==========================
function updateStats() {

  const participants =
    getParticipants();

  const meals =
    getMeals();

  const total =
    participants.length;

  const active =
    participants.filter(
      p => p.status === "Active"
    ).length;

  const completed =
    participants.filter(
      p => p.status === "Completed"
    ).length;

  const mealsServed =
    meals.reduce(
      (sum, meal) => sum + meal.count,
      0
    );

  document.getElementById(
    "totalEnrolled"
  ).textContent = total;

  document.getElementById(
    "activeParticipants"
  ).textContent = active;

  document.getElementById(
    "completedParticipants"
  ).textContent = completed;

  document.getElementById(
    "mealsServed"
  ).textContent = mealsServed;

  updateProgressBar(total, completed);
}

// ==========================
// PROGRESS BAR
// ==========================
function updateProgressBar(
  total,
  completed
) {

  const fill =
    document.getElementById(
      "progressFill"
    );

  const text =
    document.getElementById(
      "progressText"
    );

  if (!fill || !text) return;

  const percent =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  fill.style.width =
    percent + "%";

  text.textContent =
    `${percent}% Program Completion`;
}

function loadSchoolSummary() {

    const participants = getParticipants();

    const tbody =
        document.querySelector("#schoolSummaryTable tbody");

    if (!tbody) return;

    tbody.innerHTML = "";

    const schools = {};

    participants.forEach(p => {

        if (!schools[p.school]) {
            schools[p.school] = {
                total: 0,
                active: 0,
                completed: 0,
                dropped: 0
            };
        }

        schools[p.school].total++;

        if (p.status === "Active")
            schools[p.school].active++;

        if (p.status === "Completed")
            schools[p.school].completed++;

        if (p.status === "Dropped")
            schools[p.school].dropped++;
    });

    Object.keys(schools)
        .sort()
        .forEach(school => {

            const data = schools[school];

            tbody.innerHTML += `
                <tr>
                    <td>${school}</td>
                    <td>${data.total}</td>
                    <td>${data.active}</td>
                    <td>${data.completed}</td>
                    <td>${data.dropped}</td>
                </tr>
            `;
        });
}

// ================
// NUTRITION STATUS
// ================
function getNutritionStatus(childName) {

  const students =
    JSON.parse(localStorage.getItem("students")) || [];

  const assessment = students.find(s =>
    (s.name || "").toLowerCase().trim() ===
    childName.toLowerCase().trim()
  );

  return assessment
    ? assessment.status
    : "No Assessment";
}

//===============
//PRIOTIRY STATUS
//===============
function getPriority(status) {

  switch(status){

    case "Underweight":
      return {
        level: "Priority",
        color: "#dc2626"
      };

    case "Overweight":
      return {
        level: "Monitor",
        color: "#f59e0b"
      };

    case "Normal":
      return {
        level: "Low",
        color: "#22c55e"
      };

    default:
      return {
        level: "Unknown",
        color: "#64748b"
      };
  }

}


// ==========================
// LOGOUT
// ==========================
function logout() {

  if (!confirm("Logout?")) return;

  window.location.href =
    "../signin.html";
}
