// Expense Tracker - frontend logic

// PHASE 2
// Your backend from Phase 1 is already running, with real expenses in the
// database (from schema.sql). Build this page directly against it with
// fetch and async/await - there is no in-memory or localStorage stage
// this time, and no sample data file.
//
// A possible structure (change it if you have a better idea):
//   - async function getExpenses()          fetch(API_URL), return the JSON
//   - async function addExpense(data)       fetch(API_URL, { method: "POST", ... })
//   - async function updateExpense(id,data) fetch(API_URL + "/" + id, { method: "PUT", ... })
//   - async function deleteExpense(id)      fetch(API_URL + "/" + id, { method: "DELETE" })
//   - async function refresh()              get the list, then call renderTable and renderSummary
//   - renderTable(list)                     build the table rows from the array the API returned
//   - renderSummary(list)                   update the summary cards
//   - applyFilter()                         re-render with the list filtered by category
//
// Don't forget:
//   - Show a Bootstrap spinner while a request is in flight.
//   - Wrap every fetch call in try/catch, and show a Bootstrap alert on failure.
//   - After add, edit, or delete, call refresh() so the page always shows
//     what the server actually saved - never update the table by hand.
//   - The API is at http://localhost:3000/api/expenses (see the Roadmap).

const API_URL = "http://localhost:3000/api/expenses";
let allExpenses = [];

function showLoading() {
  document.getElementById("loading").classList.remove("d-none");
}

function hideLoading() {
  document.getElementById("loading").classList.add("d-none");
}

function showAlert(message, type) {
  const alertBox = document.getElementById("alertBox");

  alertBox.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
}

async function getExpenses() {
  showLoading();

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to get expenses");
    }

    const expenses = await response.json();

    allExpenses = expenses;

renderSummary(expenses);

    renderTable(expenses);

    hideLoading();

  } catch (error) {
    hideLoading();
    showAlert("Server is not available. Please try again.", "danger");
  }
}

function getCategoryClass(category) {
  if (category === "Food") {
    return "bg-success";
  }

  if (category === "Transport") {
    return "bg-primary";
  }

  if (category === "Bills") {
    return "bg-warning text-dark";
  }

  if (category === "Entertainment") {
    return "bg-danger";
  }

  return "bg-secondary";
}

function renderTable(expenses) {
  const tableBody = document.getElementById("tableBody");

  tableBody.innerHTML = "";

  expenses.forEach(function(expense) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${expense.title}</td>
      <td>${expense.amount}</td>
      <td>
        <span class="badge ${getCategoryClass(expense.category)}">
          ${expense.category}
        </span>
      </td>
      <td>${expense.date}</td>
      <td>
        <button class="btn btn-primary edit-btn" data-id="${expense.id}">
          Edit
        </button>
      </td>
      <td>
        <button class="btn btn-danger delete-btn" data-id="${expense.id}">
          Delete
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}
function renderSummary(expenses) {
  const totalAmount = expenses.reduce((sum, expense) => {
    return sum + Number(expense.amount);
  }, 0);

  const highestExpense = Math.max(
    ...expenses.map(expense => Number(expense.amount))
  );

  document.getElementById("totalAmount").textContent = totalAmount;
  document.getElementById("expenseCount").textContent = expenses.length;
  document.getElementById("highestExpense").textContent = highestExpense;
}
async function refresh() {

  await getExpenses();

}
getExpenses();

const expenseForm = document.getElementById("expenseForm");

expenseForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const title = document.getElementById("title").value;
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  document.getElementById("titleError").innerHTML = "";
  document.getElementById("amountError").innerHTML = "";
  document.getElementById("categoryError").innerHTML = "";
  document.getElementById("dateError").innerHTML = "";

  if (title === "" || !isNaN(title)) {
    document.getElementById("titleError").innerHTML = `
      <div class="alert alert-danger mt-2">
        Please enter a title or make sure the value is valid
      </div>
    `;
    return;
  }

  if (amount === "" || Number(amount) <= 0) {
    document.getElementById("amountError").innerHTML = `
      <div class="alert alert-danger mt-2">
        Please enter a valid amount
      </div>
    `;
    return;
  }

  if (category === "") {
    document.getElementById("categoryError").innerHTML = `
      <div class="alert alert-danger mt-2">
        Please select a category
      </div>
    `;
    return;
  }

  if (date === "") {
    document.getElementById("dateError").innerHTML = `
      <div class="alert alert-danger mt-2">
        Please select a date
      </div>
    `;
    return;
  }

  //post


  showLoading();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        amount: Number(amount),
        category: category,
        date: date
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.message || "Failed to add expense", "danger");
      hideLoading();
      return;
    }

    showAlert("Expense added successfully", "success");

    expenseForm.reset();

    refresh();

  } catch (error) {
    hideLoading();
    showAlert("Failed to add expense. Please try again.", "danger");
  }
});

//filter
const categoryFilter = document.getElementById("categoryFilter");

categoryFilter.addEventListener("change", function() {

  const selectedCategory = categoryFilter.value;

  const filteredExpenses = allExpenses.filter(function(expense) {

    if (selectedCategory === "All") {
      return true;
    }

    return expense.category === selectedCategory;
  });

  renderTable(filteredExpenses); });

//for delete
const tableBody = document.getElementById("tableBody");

tableBody.addEventListener("click", async function(event) {

  if (event.target.classList.contains("delete-btn")) {

    const id = event.target.dataset.id;

    const confirmDelete = confirm("Are you sure you want to delete this expense?");

    if (!confirmDelete) {
      return;
    }

    showLoading();

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(data.message || "Failed to delete expense", "danger");
        hideLoading();
        return;
      }

      showAlert("Expense deleted successfully", "success");

      refresh();

    } catch (error) {
      hideLoading();
      showAlert("Failed to delete expense. Please try again.", "danger");
    }
  }

});

//for edit

let editId;

tableBody.addEventListener("click", function(event) {

  if (event.target.classList.contains("edit-btn")) {

    editId = event.target.getAttribute("data-id");

    const expense = allExpenses.find(function(item) {
      return item.id == editId;
    });

    const titleInput = document.getElementById("editTitle");
    const amountInput = document.getElementById("editAmount");
    const categoryInput = document.getElementById("editCategory");
    const dateInput = document.getElementById("editDate");

    titleInput.value = expense.title;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    dateInput.value = expense.date;

    const editModal = new bootstrap.Modal(
      document.getElementById("editModal")
    );

    editModal.show();
  }

});

document.getElementById("saveEditBtn").addEventListener("click", async function() {

  const title = document.getElementById("editTitle").value;
  const amount = document.getElementById("editAmount").value;
  const category = document.getElementById("editCategory").value;
  const date = document.getElementById("editDate").value;

  showLoading();

  try {

    const response = await fetch(`${API_URL}/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        amount: Number(amount),
        category: category,
        date: date
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.message || "Failed to update expense", "danger");
      hideLoading();
      return;
    }

    showAlert("Expense updated successfully", "success");

   refresh();

  } catch (error) {
    hideLoading();
    showAlert("Failed to update expense. Please try again.", "danger");
  }
});

// To add Export CSV
exportBtn.addEventListener("click", function() {

  let csv = "Title,Amount,Category,Date\n";

  allExpenses.forEach(function(expense) {
    csv += `${expense.title},${expense.amount},${expense.category},${expense.date}\n`;
  });
const blob = new Blob([csv], { type: "text/csv" });

const url = URL.createObjectURL(blob);

const link = document.createElement("a");

link.href = url;
link.download = "expenses.csv";

link.click();

URL.revokeObjectURL(url);
});