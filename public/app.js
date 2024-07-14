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