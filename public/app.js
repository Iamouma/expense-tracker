// Nav JS
const toggleButton = document.querySelector('.toggle-button');
const navbarLinks = document.querySelector('.navbar-links');

toggleButton.addEventListener('click', () => {
    navbarLinks.classList.toggle('active');
});


// Add Expense JS
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#addExpenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const expense = {
            user_id: 1, // Replace with dynamic user data if needed
            amount: document.querySelector('#amount').value,
            category: document.querySelector('#category').value,
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

            if (newExpense.success) {
                // Show success message
                const successMessage = document.querySelector('#successMessage');
                successMessage.style.display = 'block';

                // Redirect to view page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'view_expense.html';
                }, 2000);
            } else {
                alert('Error adding expense: ' + newExpense.message);
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Error adding expense');
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
                <td>${expense.category}</td>
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

// view_expenses.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/expenses')
        .then(response => response.json())
        .then(data => {
            const expensesList = document.getElementById('expensesList');
            data.expenses.forEach(expense => {
                const expenseItem = document.createElement('div');
                expenseItem.className = 'expense-item';
                expenseItem.innerHTML = `
                    <p>Date: ${expense.expenseDate}</p>
                    <p>Category: ${expense.category}</p>
                    <p>Amount: ${expense.amount}</p>
                    <p>Description: ${expense.description}</p>
                `;
                expensesList.appendChild(expenseItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching expenses');
        });
});