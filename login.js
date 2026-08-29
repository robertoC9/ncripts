import { supabase } from './supabase.js';

const emailInput = document.getElementById("emailInput");
const passInput = document.getElementById("passInput");
const status = document.getElementById("status");

const getRedirectUrl = () => {
    const origin = window.location.origin;

    if (origin && origin !== "null") {
        return `${origin}/login.html`;
    }

    return "https://ncripts.org/login.html";
};

const handleAuthRedirect = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (!error && data.session) {
        window.location.href = "index.html";
        return;
    }

    const url = new URL(window.location.href);
    const params = url.searchParams;
    const hash = window.location.hash || "";

    if (params.get("type") === "signup" || hash.includes("type=signup") || params.get("access_token")) {
        status.textContent = "Correo verificado. Ya puedes iniciar sesión.";
    }
};

const resendVerificationEmail = async () => {
    const email = emailInput.value.trim();

    if (!email) {
        status.textContent = "Introduce tu email para reenviar la verificación.";
        return;
    }

    status.textContent = "Enviando correo de verificación...";

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
            emailRedirectTo: getRedirectUrl()
        }
    });

    if (error) {
        status.textContent = error.message;
        return;
    }

    status.textContent = "Se ha reenviado el correo de verificación.";
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

handleAuthRedirect();

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

document.getElementById("resendBtn").onclick = resendVerificationEmail;
