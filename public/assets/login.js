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