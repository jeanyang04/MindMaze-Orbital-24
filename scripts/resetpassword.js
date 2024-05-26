
document.addEventListener('DOMContentLoaded', event => {
    const form = document.querySelector('form');

    if (form) {
        form.addEventListener('submit', event => {
            const oldPassword = form.querySelector('input[name ="old-password"]');
            const newPassword = form.querySelector('input[name ="new-password"]');
            const confirmNewPassword = form.querySelector('input[name ="confirm-new-password"]');
            if (newPassword.value  === oldPassword.value) {
                event.preventDefault();
                alert("New password cannot be the same as old password");
                return;
            }

            if (confirmNewPassword.value !== newPassword.value) {
                event.preventDefault();
                alert("Password do not match");
                return;
            }
        })
    }
})
