// ==========================
// INIT
// ==========================
const tableBody = document.querySelector("#childTable tbody");

window.addEventListener("DOMContentLoaded", () => {
  loadChildren();
});

// ==========================
// GET DATA
// ==========================
function getChildren() {
  return JSON.parse(localStorage.getItem("children")) || [];
}

function getParents() {
  return JSON.parse(localStorage.getItem("parents")) || [];
}

// ==========================
// SEARCH PARENTS
// ==========================
function searchParents() {
  const keyword = document
    .getElementById("parentSearch")
    .value
    .toLowerCase()
    .trim();

  const results = document.getElementById("parentResults");
  const parents = getParents();

  results.innerHTML = "";

  if (!keyword) return;

  const matches = parents.filter(parent =>
    parent.name.toLowerCase().includes(keyword)
  );

  matches.forEach(parent => {
    const div = document.createElement("div");

    div.className = "parent-option";
    div.innerHTML = `
      <strong>${parent.name}</strong><br>
      <small>${parent.phone}</small>
    `;

    div.onclick = () => {
      document.getElementById("parentSearch").value = parent.name;
      document.getElementById("selectedParentId").value = parent.id;
      results.innerHTML = "";
    };

    results.appendChild(div);
  });
}

// ==========================
// ADD CHILD
// ==========================
function addChild() {
  let children = getChildren();

  const firstName = document.getElementById("firstName").value.trim();
  const middleName = document.getElementById("middleName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();

  const fullName = `${firstName} ${middleName} ${lastName}`
    .replace(/\s+/g, " ")
    .trim();

  const age = document.getElementById("age").value;
  const address = document.getElementById("address").value;
  const gender = document.getElementById("gender").value;
  const grade = document.getElementById("grade").value;
  const barangay = document.getElementById("barangay").value;

  const selectedParentId =
    Number(document.getElementById("selectedParentId")?.value) || null;

  if (
    !firstName ||
    !lastName ||
    !age ||
    !address ||
    !gender ||
    !grade ||
    !barangay
  ) {
    alert("Please fill all required fields.");
    return;
  }

  const child = {
    id: Date.now(),
    fullName,
    age,
    address,
    gender,
    grade,
    barangay,
    parentId: selectedParentId
  };

  children.push(child);

  localStorage.setItem("children", JSON.stringify(children));

  alert("Child saved successfully!");

  clearForm();
  loadChildren();
}

// ==========================
// LOAD CHILDREN
// ==========================
function loadChildren() {
  const children = getChildren();
  const parents = getParents();

  tableBody.innerHTML = "";

  children.forEach((child, index) => {
    const parent = parents.find(
      p => Number(p.id) === Number(child.parentId)
    );

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${child.fullName}</td>
      <td>${child.age}</td>
      <td>${child.grade}</td>
      <td>${child.barangay}</td>
      <td>${child.gender}</td>
      <td>${child.address}</td>

      <td>
        <select
          class="parent-select"
          onchange="assignParent(${child.id}, this.value)"
        >
          <option value="">Assign Parent</option>

          ${parents
            .map(
              p => `
              <option
                value="${p.id}"
                ${
                  Number(p.id) === Number(child.parentId)
                    ? "selected"
                    : ""
                }
              >
                ${p.name}
              </option>
            `
            )
            .join("")}
        </select>
      </td>

      <td class="contact-info">
        ${
          parent
            ? `
          📞 ${parent.phone || "N/A"}<br>
          📧 ${parent.email || "N/A"}
        `
            : "No parent"
        }
      </td>

      <td>
        <button onclick="editChild(${index})">Edit</button>
        <button onclick="deleteChild(${index})">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// ==========================
// ASSIGN PARENT
// ==========================
function assignParent(childId, parentId) {
  let children = getChildren();

  children = children.map(child => {
    if (child.id === childId) {
      child.parentId = Number(parentId) || null;
    }
    return child;
  });

  localStorage.setItem("children", JSON.stringify(children));

  loadChildren();
}

// ==========================
// DELETE CHILD
// ==========================
function deleteChild(index) {
  let children = getChildren();

  if (!confirm("Delete this child?")) return;

  children.splice(index, 1);

  localStorage.setItem("children", JSON.stringify(children));

  loadChildren();
}

// ==========================
// EDIT CHILD
// ==========================
let editIndex = null;

function editChild(index) {
  const children = getChildren();
  const child = children[index];

  editIndex = index;

  const nameParts = child.fullName.split(" ");

  document.getElementById("editFirstName").value =
    nameParts[0] || "";

  document.getElementById("editMiddleName").value =
    nameParts.length > 2 ? nameParts[1] : "";

  document.getElementById("editLastName").value =
    nameParts.length > 2
      ? nameParts.slice(2).join(" ")
      : nameParts[1] || "";

  document.getElementById("editAge").value = child.age;
  document.getElementById("editAddress").value = child.address;
  document.getElementById("editGender").value = child.gender;
  document.getElementById("editGrade").value = child.grade;
  document.getElementById("editBarangay").value = child.barangay;

  document.getElementById("editCard").style.display = "flex";
}

function updateChild() {
  let children = getChildren();

  const fullName = `
    ${document.getElementById("editFirstName").value}
    ${document.getElementById("editMiddleName").value}
    ${document.getElementById("editLastName").value}
  `
    .replace(/\s+/g, " ")
    .trim();

  children[editIndex] = {
    ...children[editIndex],
    fullName,
    age: document.getElementById("editAge").value,
    address: document.getElementById("editAddress").value,
    gender: document.getElementById("editGender").value,
    grade: document.getElementById("editGrade").value,
    barangay: document.getElementById("editBarangay").value
  };

  localStorage.setItem("children", JSON.stringify(children));

  closeEdit();
  loadChildren();
}

function closeEdit() {
  document.getElementById("editCard").style.display = "none";
}

// ==========================
// CLEAR FORM
// ==========================
function clearForm() {
  document.getElementById("firstName").value = "";
  document.getElementById("middleName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("age").value = "";
  document.getElementById("address").value = "";
  document.getElementById("gender").value = "";
  document.getElementById("grade").value = "";
  document.getElementById("barangay").value = "";

  const parentSearch = document.getElementById("parentSearch");
  const selectedParentId = document.getElementById("selectedParentId");
  const parentResults = document.getElementById("parentResults");

  if (parentSearch) parentSearch.value = "";
  if (selectedParentId) selectedParentId.value = "";
  if (parentResults) parentResults.innerHTML = "";
}

// ==========================
// LOGOUT
// ==========================
function logout() {
  if (!confirm("Logout?")) return;

  window.location.href = "../signin.html";
}