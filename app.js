import { supabase } from './supabase.js';

const fileInput = document.getElementById("fileInput");
const passwordInput = document.getElementById("passwordInput");
const status = document.getElementById("status");
const logoutBtn = document.getElementById("logoutBtn");

/* ============================
   PROTEGER LA PÁGINA
============================ */
(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
        window.location.replace("login.html");
    }
})();

/* ============================
   GENERAR CLAVE AES
============================ */
async function getKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

/* ============================
   SUBIR ARCHIVO AL BUCKET
============================ */
async function uploadEncryptedFile(fileBlob, filename) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user.id;

    const filePath = `${userId}/${filename}`;

    const { data, error } = await supabase.storage
        .from("ENCRYPTED-FILES")
        .upload(filePath, fileBlob, {
            upsert: true
        });

    if (error) {
        console.error(error);
        status.textContent = "Error subiendo archivo.";
        return null;
    }

    status.textContent = "Archivo subido correctamente.";
    return filePath;
}

/* ============================
   DESCARGAR ARCHIVO DEL BUCKET
============================ */
async function downloadEncryptedFile(filePath) {
    const { data, error } = await supabase.storage
        .from("ENCRYPTED-FILES")
        .download(filePath);

    if (error) {
        console.error(error);
        status.textContent = "Error descargando archivo.";
        return null;
    }

    return data; // Blob
}

/* ============================
   LISTAR ARCHIVOS DEL USUARIO
============================ */
async function listUserFiles() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user.id;

    const { data, error } = await supabase.storage
        .from("ENCRYPTED-FILES")
        .list(userId + "/");

    if (error) {
        console.error(error);
        status.textContent = "Error listando archivos.";
        return [];
    }

    return data;
}

/* ============================
   ENCRIPTAR ARCHIVO
============================ */
document.getElementById("encryptBtn").onclick = async () => {
    const file = fileInput.files[0];
    const password = passwordInput.value;

    if (!file || !password) {
        status.textContent = "Selecciona archivo y contraseña.";
        return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        arrayBuffer
    );

    const blob = new Blob([salt, iv, new Uint8Array(encrypted)], {
        type: "application/octet-stream"
    });

    const encryptedName = file.name + ".enc";

    // SUBIR AL BUCKET
    await uploadEncryptedFile(blob, encryptedName);

    // DESCARGAR LOCAL (opcional)
    download(blob, encryptedName);

    status.textContent = "Archivo encriptado y subido.";
};

/* ============================
   DESENCRIPTAR ARCHIVO
============================ */
document.getElementById("decryptBtn").onclick = async () => {
    let file = fileInput.files[0];
    const password = passwordInput.value;

    if (!password) {
        status.textContent = "Escribe la contraseña.";
        return;
    }

    // Si NO seleccionó archivo, lo buscamos en Supabase
    if (!file) {
        const files = await listUserFiles();

        if (files.length === 0) {
            status.textContent = "No hay archivos en Supabase.";
            return;
        }

        const userId = (await supabase.auth.getUser()).data.user.id;
        const filePath = `${userId}/${files[0].name}`;
        const blob = await downloadEncryptedFile(filePath);

        file = new File([blob], files[0].name);
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const salt = buffer.slice(0, 16);
    const iv = buffer.slice(16, 28);
    const data = buffer.slice(28);

    const key = await getKey(password, salt);

    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );

        const blob = new Blob([decrypted]);
        const originalName = file.name.replace(".enc", "");
        download(blob, originalName);

        status.textContent = "Archivo desencriptado.";
    } catch {
        status.textContent = "Contraseña incorrecta o archivo corrupto.";
    }
};

/* ============================
   DESCARGA LOCAL
============================ */
function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/* ============================
   LOGOUT
============================ */
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await supabase.auth.signOut();
        window.location.href = "login.html";
    };
}
 
function updateFooterTime() {
    const footerTime = document.getElementById("footerTime");
    if (!footerTime) return;

    const now = new Date();

    // Hora local según la región del usuario
    const formatted = now.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "medium"
    });

    footerTime.textContent = `Hora local: ${formatted}`;
}

// Actualiza cada segundo
setInterval(updateFooterTime, 1000);

// Ejecuta al cargar la página
updateFooterTime();
