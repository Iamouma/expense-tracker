// Nav JS
const toggleButton = document.querySelector('.toggle-button');
const navbarLinks = document.querySelector('.navbar-links');

toggleButton.addEventListener('click', () => {
    navbarLinks.classList.toggle('active');
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#addExpenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const expense = {
            user_id: 1, // Replace with dynamic user data if needed
            amount: document.querySelector('#amount').value,
            description: document.querySelector('#description').value,
            date: document.querySelector('#expenseDate').value
        };

        console.log('Form data to be sent:', expense); // Log form data

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expense)
            });

            const newExpense = await response.json();
            console.log('Expense added:', newExpense); // Log response from server

            // Update the DOM or fetch the updated expenses list
            fetchExpenses();
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    });

    async function fetchExpenses() {
        try {
            const response = await fetch('/api/expenses');
            const expenses = await response.json();
            console.log(expenses);
            displayExpenses(expenses);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    }

    function displayExpenses(expenses) {
        const expenseTableBody = document.querySelector('#expenseTable tbody');
        expenseTableBody.innerHTML = '';
        expenses.forEach(expense => {
            const expenseRow = document.createElement('tr');
            expenseRow.innerHTML = `
                <td>${expense.date}</td>
                <td>${expense.user_id}</td>
                <td>${expense.amount}</td>
                <td>${expense.description}</td>
            `;
            expenseTableBody.appendChild(expenseRow);
        });

        // Update total expenses
        const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
        document.querySelector('#totalExpenses').textContent = `Total Expenses: $${totalExpenses.toFixed(2)}`;
    }

    // Fetch expenses on page load
    fetchExpenses();
});


// Register JS
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.querySelector('#username').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        const confirmPassword = document.querySelector('#confirmPassword').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const userData = {
            username,
            email,
            password
        };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const newUser = await response.json();
                console.log('Registered user:', newUser);
                alert('Registration successful! Please log in.');
                window.location.href = 'login.html'; // Redirect to login page
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Registration failed. Please try again later.');
        }
    });
});

// Login JS
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const { token } = await response.json();
        localStorage.setItem('token', token); // Store token in localStorage

        // Redirect to dashboard.html or any other page
        window.location.href = '/dash.html';

    } catch (error) {
        console.error('Error logging in:', error);
        // Handle error or display message to user
    }
});

// Edit expense JS
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const expenseId = urlParams.get('id');

    if (expenseId) {
        try {
            console.log('Fetching expense with ID:', expenseId);
            const response = await fetch(`/api/expenses/${expenseId}`);
            const expense = await response.json();
            console.log('Fetched expense:', expense);

            const expenseIdField = document.getElementById('expenseId');
            const dateField = document.getElementById('date');
            const amountField = document.getElementById('amount');
            const descriptionField = document.getElementById('description');

            if (expenseIdField && dateField && amountField && descriptionField) {
                expenseIdField.value = expense.expense_id;
                dateField.value = expense.date;
                amountField.value = expense.amount;
                descriptionField.value = expense.description;
            } else {
                console.error('One or more form elements not found');
            }
        } catch (error) {
            console.error('Error fetching expense:', error);
        }
    }
});

// View expense JS
document.addEventListener('DOMContentLoaded', async () => {
    const expenseTableBody = document.querySelector('#expenseTable');
    if (expenseTableBody) {
        try {
            console.log('Fetching expenses...');
            const response = await fetch('/api/expenses');
            const expenses = await response.json();
            console.log('Fetched expenses:', expenses);

            expenses.forEach(expense => {
                const row = expenseTableBody.insertRow();

                const dateCell = row.insertCell(0);
                dateCell.textContent = expense.date;

                const amountCell = row.insertCell(1);
                amountCell.textContent = expense.amount;

                const descriptionCell = row.insertCell(2);
                descriptionCell.textContent = expense.description;

                const actionsCell = row.insertCell(3);
                const editLink = document.createElement('a');
                editLink.href = `edit_expense.html?id=${expense.expense_id}`;
                editLink.textContent = 'Edit';
                actionsCell.appendChild(editLink);
            });
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    } else {
        console.error('Expense table body not found');
    }
});

function logout() {
    // Clear localStorage or sessionStorage
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');

    // Redirect to login page
    window.location.href = 'login.html';
}
