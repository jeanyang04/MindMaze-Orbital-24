
document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', (event) => {
        const emailInput = form.querySelector('input[name="email"]');
        const passwordInput = form.querySelector('input[name="password"]');
        
        if (!emailInput.value || !passwordInput.value) {
            event.preventDefault();
            alert('Please fill out both the email and password fields.');
        }
    });
});
