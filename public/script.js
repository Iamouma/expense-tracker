// Registration form JS
document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const formData = {
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            password: document.getElementById("password").value
        };

        fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Registration successful!");
                window.location.href = "login.html";
            } else {
                alert("Registration failed: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("An error occurred while registering.");
        });
    });
});

// Login Form JS
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Login successful!");
            // redirect to another page
            window.location.href = "index.html";
        } else {
            alert("Login failed: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
});


// Add expense JS
document.getElementById('addExpenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const expenseName = document.getElementById('expenseName').value;
    const expenseAmount = document.getElementById('expenseAmount').value;
    const expenseDate = document.getElementById('expenseDate').value;

    // Send a POST request to the backend to add the expense
    const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: expenseName, amount: expenseAmount, date: expenseDate })
    });

    if (response.ok) {
        alert('Expense added successfully!');
        // update the UI or redirect to another page
        window.location.href = 'view_expense.html';
    } else {
        alert('Failed to add expense.');
    }
});

// Fetch the expense details from the backend and populate the form
async function fetchExpenseDetails(expenseId) {
    const response = await fetch(`/api/expenses/${expenseId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const expense = await response.json();
    document.getElementById('expenseId').value = expense.id;
    document.getElementById('date').value = expense.date;
    document.getElementById('category').value = expense.category;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('description').value = expense.description;
}

// Handle form submission to update the expense
document.getElementById('editExpenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const expenseId = document.getElementById('expenseId').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;

    const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ date, category, amount, description })
    });

    if (response.ok) {
        alert('Expense updated successfully!');
        // Optionally, redirect to the view expenses page
        window.location.href = 'view_expense.html';
    } else {
        alert('Failed to update expense.');
    }
});

// Example: Fetch the details of an expense with ID 1 when the page loads
fetchExpenseDetails(1);


// Fetch expenses from backend
async function fetchExpenses() {
    const response = await fetch('/api/expenses', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const expenses = await response.json();
    const expenseTableBody = document.querySelector('#expenseTable tbody');

    expenses.forEach(expense => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td data-label="Date">${expense.date}</td>
            <td data-label="Category">${expense.category}</td>
            <td data-label="Amount">$${expense.amount.toFixed(2)}</td>
            <td data-label="Description">${expense.description}</td>
            <td data-label="Actions">
                <a href="edit_expense.html?id=${expense.id}">Edit</a>
                <a href="#" onclick="deleteExpense(${expense.id})">Delete</a>
            </td>
        `;

        expenseTableBody.appendChild(row);
    });
}

// Delete expense
async function deleteExpense(id) {
    const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        alert('Expense deleted successfully!');
        location.reload();  // Reload to update the expense list
    } else {
        alert('Failed to delete expense.');
    }
}

// Fetch expenses when the page loads
document.addEventListener('DOMContentLoaded', fetchExpenses);