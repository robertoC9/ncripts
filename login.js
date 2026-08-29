import { supabase } from './supabase.js';

const emailInput = document.getElementById("emailInput");
const passInput = document.getElementById("passInput");
const status = document.getElementById("status");

const getRedirectUrl = () => {
    const origin = window.location.origin;

    if (origin && origin !== "null") {
        return `${origin}/login.html`;
    }

    return "http://localhost:8000/login.html";
};

document.getElementById("registerBtn").onclick = async () => {
    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    if (!email || !password) {
        status.textContent = "Completa email y contraseña.";
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: getRedirectUrl()
        }
    });

    if (error) {
        status.textContent = error.message;
        return;
    }

    if (data?.user && data.user.identities?.length === 0) {
        status.textContent = "Este email ya está registrado.";
        return;
    }

    status.textContent = "Usuario registrado. Revisa tu correo de verificación.";
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
        status.textContent = "Credenciales incorrectas o la cuenta aún no está verificada.";
    } else {
        window.location.href = "index.html";
    }
};
