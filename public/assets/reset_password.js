document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    document.getElementById('token').value = token;

    const form = document.getElementById('resetPasswordForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const token = document.getElementById('token').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Password reset successful') {
                alert('Password reset successful');
                window.location.href = 'login.html';
            } else {
                alert(data.message);
            }
        });
    });
});