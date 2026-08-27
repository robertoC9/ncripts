import { supabase } from './supabase.js';

const emailInput = document.getElementById("emailInput");
const passInput = document.getElementById("passInput");
const status = document.getElementById("status");

document.getElementById("registerBtn").onclick = async () => {
    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    if (!email || !password) {
        status.textContent = "Completa email y contraseña.";
        return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
        status.textContent = error.message;
    } else {
        status.textContent = "Usuario registrado. Revisa tu correo.";
    }
};

document.getElementById("loginBtn").onclick = async () => {
    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    if (!email || !password) {
        status.textContent = "Completa email y contraseña.";
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        status.textContent = "Credenciales incorrectas.";
    } else {
        window.location.href = "index.html";
    }
};
