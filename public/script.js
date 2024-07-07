// Registration form js
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