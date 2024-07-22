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

// Logout JS
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');

    if (logoutButton) {
        logoutButton.addEventListener('click', function (event) {
            event.preventDefault();
            logout();
        });
    }
});

function logout() {
    // Remove the token from localStorage or sessionStorage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Redirect to the login page
    window.location.href = 'login.html';
}

// Edit Expense JS
document.addEventListener('DOMContentLoaded', () => {
    const editExpenseForm = document.getElementById('editExpenseForm');
    const successMessage = document.getElementById('successMessage');

    // Extract expense ID from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const expenseId = urlParams.get('id');

    // Fetch expense data and populate the form
    fetch(`/api/expenses/${expenseId}`, {
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('expenseId').value = data.id;
        document.getElementById('expenseDate').value = data.expenseDate.split('T')[0];
        document.getElementById('category').value = data.category;
        document.getElementById('amount').value = data.amount;
        document.getElementById('description').value = data.description;
    })
    .catch(error => console.error('Error fetching expense data:', error));

    editExpenseForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(editExpenseForm);
        const expenseData = {
            expenseDate: formData.get('expenseDate'),
            category: formData.get('category'),
            amount: formData.get('amount'),
            description: formData.get('description')
        };

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`/api/expenses/${expenseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(expenseData)
            });

            if (!response.ok) {
                throw new Error('Failed to update expense');
            }

            // Show success message
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
                window.location.href = 'view_expense.html'; // Redirect to view expense page
            }, 3000);
        } catch (error) {
            console.error('Error updating expense:', error);
            // Handle error scenario if necessary
        }
    });

    function logout() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
});