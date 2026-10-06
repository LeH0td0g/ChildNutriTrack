const tableBody = document.querySelector("#parentTable tbody");

window.addEventListener("DOMContentLoaded", loadParents);

function getParents() {
  return JSON.parse(localStorage.getItem("parents")) || [];
}

function addParent() {

  let parents = getParents();

  const name = document.getElementById("parentName").value.trim();
  const phone = document.getElementById("parentPhone").value.trim();
  const email = document.getElementById("parentEmail").value.trim().toLowerCase();

  if (!name || !email) {
    alert("Please complete required fields.");
    return;
  }

  if (parents.some(p => p.email === email)) {
    alert("Parent already exists.");
    return;
  }

  parents.push({
    id: Date.now(),
    name,
    phone,
    email,
    password: "1234"
  });

  localStorage.setItem("parents", JSON.stringify(parents));

  document.getElementById("parentName").value = "";
  document.getElementById("parentPhone").value = "";
  document.getElementById("parentEmail").value = "";

  loadParents();
}

function loadParents() {

  const parents = getParents();

  tableBody.innerHTML = "";

  parents.forEach((parent, index) => {

    tableBody.innerHTML += `
      <tr>
        <td>${parent.name}</td>
        <td>${parent.phone}</td>
        <td>${parent.email}</td>
        <td>
          <button onclick="archiveParent(${index})">
            Archive
          </button>
        </td>
        <td>
          <button onclick="editParent(${index})">
          Edit
          </button>
      </tr>
    `;
  });
}

function restoreParent(index) {

    let parents = getParents();

    parents[index].archived = false;

    localStorage.setItem(
        "parents",
        JSON.stringify(parents)
    );

    loadArchivedParents();
}

function logout() {
  if (!confirm("Logout?")) return;
  window.location.href = "../signin.html";
} 