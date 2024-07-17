// Navbar JS
const toggleButton = document.querySelector('.toggle-button');
const navbarLinks = document.querySelector('.navbar-links');

toggleButton.addEventListener('click', () => {
    navbarLinks.classList.toggle('active');
});


// Intersection Observer API JS
document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const targets = document.querySelectorAll(".feature, .benefit, .testimonial");
    targets.forEach(target => observer.observe(target));

    const toggleButton = document.querySelector('.toggle-button');
    const navbarLinks = document.querySelector('.navbar-links');

    toggleButton.addEventListener('click', () => {
        toggleButton.classList.toggle('active');
        navbarLinks.classList.toggle('active');
    });
});

// Register JS
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, confirmPassword })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.href = 'login.html';
        } else {
            alert(result.message);
        }
    });
});

// Login JS
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Login successful');
            // Save token to local storage or cookies
            localStorage.setItem('token', result.token);
            window.location.href = 'dash.html'; // Redirect to home page or dashboard
        } else {
            alert(result.message);
        }
    });
});

// Add Expense
const addExpenseForm = document.getElementById('addExpenseForm');
const successMessage = document.getElementById('successMessage');
const expenseTableBody = document.getElementById('expenseTableBody');

addExpenseForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(addExpenseForm);
    const expenseData = {
        expenseDate: formData.get('expenseDate'),
        category: formData.get('category'),
        amount: formData.get('amount'),
        description: formData.get('description')
    };

    try {
        const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
            throw new Error('Failed to add expense');
        }

        // Clear form fields after successful submission (optional)
        addExpenseForm.reset();

        // Show success message
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);

        // Update expense list dynamically
        fetchExpenseList(); // Implement this function to fetch and update the expense list
    } catch (error) {
        console.error('Error adding expense:', error);
        // Handle error scenario if necessary
    }
});

async function fetchExpenseList() {
    try {
        const response = await fetch('/api/expenses');
        if (!response.ok) {
            throw new Error('Failed to fetch expenses');
        }
        const expenses = await response.json();
        renderExpenseList(expenses); // Implement renderExpenseList function
    } catch (error) {
        console.error('Error fetching expenses:', error);
        // Handle error scenario if necessary
    }
}

function renderExpenseList(expenses) {
    // Clear existing table rows
    expenseTableBody.innerHTML = '';

    // Iterate over expenses and create table rows
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.expenseDate}</td>
            <td>${expense.category}</td>
            <td>${expense.amount}</td>
            <td>${expense.description}</td>
            <td>
                <button onclick="editExpense(${expense.id})">Edit</button>
                <button onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });
}

async function editExpense(expenseId) {
    // Fetch the expense details for the given expenseId
    try {
        const response = await fetch(`/api/expenses/${expenseId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch expense details');
        }
        const expense = await response.json();

        // Populate form fields with expense details for editing
        const editForm = document.getElementById('editExpenseForm');
        editForm.expenseId.value = expense.id;
        editForm.expenseDate.value = expense.expenseDate;
        editForm.category.value = expense.category;
        editForm.amount.value = expense.amount;
        editForm.description.value = expense.description;

        // Show the edit form or implement your own edit UI
        // Example: display edit form in a modal
        // showModal('editExpenseModal');
    } catch (error) {
        console.error('Error fetching expense details:', error);
        // Handle error scenario if necessary
    }
}

async function deleteExpense(expenseId) {
    try {
        const response = await fetch(`/api/expenses/${expenseId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }

        // Update the expense list after successful deletion
        fetchExpenseList();
    } catch (error) {
        console.error('Error deleting expense:', error);
        // Handle error scenario if necessary
    }
}

// Initial fetch of expense list when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchExpenseList();
});