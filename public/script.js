// Validate Registration Form
document.getElementById("registerForm").addEventListener("submit", function(event) {
    let valid = true;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    if (name.trim() === "") {
        alert("Name is required");
        valid = false;
    }
    if (email.trim() === "") {
        alert("Email is required");
        valid = false;
    }
    if (phone.trim() === "") {
        alert("Phone number is required");
        valid = false;
    }
    if (password.trim() === "") {
        alert("Password is required");
        valid = false;
    }

    if (!valid) {
        event.preventDefault();
    }
});

// Add Expense
document.getElementById("addExpenseForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const expenseName = document.getElementById("expenseName").value;
    const expenseAmount = document.getElementById("expenseAmount").value;
    const expenseDate = document.getElementById("expenseDate").value;

    if (expenseName && expenseAmount && expenseDate) {
        const expenseTable = document.getElementById("expenseTable");
        const newRow = expenseTable.insertRow();

        const nameCell = newRow.insertCell(0);
        const amountCell = newRow.insertCell(1);
        const dateCell = newRow.insertCell(2);

        nameCell.textContent = expenseName;
        amountCell.textContent = expenseAmount;
        dateCell.textContent = expenseDate;

        // Clear form fields
        document.getElementById("expenseName").value = "";
        document.getElementById("expenseAmount").value = "";
        document.getElementById("expenseDate").value = "";
    } else {
        alert("Please fill in all fields");
    }
});

// Edit Expense
document.getElementById("expenseTable").addEventListener("click", function(event) {
    if (event.target.classList.contains("edit-btn")) {
        const row = event.target.closest("tr");
        const nameCell = row.cells[0];
        const amountCell = row.cells[1];
        const dateCell = row.cells[2];

        const newName = prompt("Edit Expense Name", nameCell.textContent);
        const newAmount = prompt("Edit Expense Amount", amountCell.textContent);
        const newDate = prompt("Edit Expense Date", dateCell.textContent);

        if (newName && newAmount && newDate) {
            nameCell.textContent = newName;
            amountCell.textContent = newAmount;
            dateCell.textContent = newDate;
        }
    }
});

// Delete Expense
document.getElementById("expenseTable").addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-btn")) {
        const row = event.target.closest("tr");
        row.remove();
    }
});

// Search Expenses
document.getElementById("searchInput").addEventListener("input", function() {
    const filter = this.value.toLowerCase();
    const rows = document.getElementById("expenseTable").getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let match = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j].textContent.toLowerCase().includes(filter)) {
                match = true;
                break;
            }
        }

        rows[i].style.display = match ? "" : "none";
    }
});

// Calculate Total Expenses
function calculateTotalExpenses() {
    const rows = document.getElementById("expenseTable").getElementsByTagName("tr");
    let total = 0;

    for (let i = 1; i < rows.length; i++) {
        const amountCell = rows[i].cells[1];
        total += parseFloat(amountCell.textContent);
    }

    document.getElementById("totalExpenses").textContent = `Total Expenses: $${total.toFixed(2)}`;
}

document.getElementById("addExpenseForm").addEventListener("submit", calculateTotalExpenses);
document.getElementById("expenseTable").addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-btn")) {
        calculateTotalExpenses();
    }
});
