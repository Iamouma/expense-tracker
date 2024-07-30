const form = document.getElementById('forgotPasswordForm');
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;

            fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
            });
        });