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


document.addEventListener('DOMContentLoaded', () => {
    fetchExpenses();
});

async function fetchExpenses() {
    try {
        const token = localStorage.getItem('token'); // Get token from local storage
        const response = await fetch('/api/expenses', {
            headers: {
                'Authorization': `Bearer ${token}` // Send token in header
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch expenses');
        }

        const expenses = await response.json();
        renderExpenseList(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        // Handle error scenario if necessary
    }
}

function renderExpenseList(expenses) {
    const expenseTableBody = document.getElementById('expenseTableBody');
    expenseTableBody.innerHTML = '';

    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.expenseDate}</td>
            <td>${expense.category}</td>
            <td>${expense.amount}</td>
            <td>${expense.description}</td>
        `;
        expenseTableBody.appendChild(row);
    });
}