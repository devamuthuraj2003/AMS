document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorMessage = document.getElementById('error-message');
    
    if (email === 'admin@gmail.com' && password === 'admin') {
        window.location.href = '../html/admin-dashboard.html';
    } else {
        errorMessage.style.display = 'block';
    }
});
