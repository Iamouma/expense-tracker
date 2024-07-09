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
// Example handling in script.js

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

// Logout Session
function logout() {
    localStorage.clear(); // Clear all items from localStorage
    sessionStorage.clear(); // Clear all items from sessionStorage
    window.location.href = 'login.html'; // Redirect to login page
}

