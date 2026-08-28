import { supabase } from "./supabase.js";

const BUCKET_NAME = "encrypted-files";

/* ------------------------------
   Cargar archivos del bucket
---------------------------------*/

async function loadFiles() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "<p>Cargando archivos...</p>";

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
        window.location.replace("login.html");
        return;
    }

    const userPath = `${userData.user.id}/`;
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(userPath, { limit: 100 });

    if (error) {
        console.error(error);
        fileList.innerHTML = `<p>Error al cargar archivos: ${error.message}</p>`;
        return;
    }

    if (!data || data.length === 0) {
        fileList.innerHTML = "<p>No hay archivos encriptados.</p>";
        return;
    }

    fileList.innerHTML = "";

    data.forEach(file => {
        const item = document.createElement("div");
        item.className = "file-item";

        item.innerHTML = `
            <span class="file-name">${file.name}</span>
            <div class="file-actions">
                <button class="download">Descargar</button>
                <button class="delete">Eliminar</button>
            </div>
        `;

        // Descargar archivo
        const filePath = `${userPath}${file.name}`;

        item.querySelector(".download").onclick = () => downloadFile(filePath, file.name);

        // Eliminar archivo
        item.querySelector(".delete").onclick = () => deleteFile(filePath);

        fileList.appendChild(item);
    });
}

/* ------------------------------
   Descargar archivo
---------------------------------*/

async function downloadFile(filePath, filename) {
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(filePath);

    if (error) {
        console.error(error);
        alert(`Error al descargar archivo: ${error.message}`);
        return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/* ------------------------------
   Eliminar archivo
---------------------------------*/

async function deleteFile(filePath) {
    const filename = filePath.split("/").pop();
    const confirmDelete = confirm(`¿Eliminar archivo "${filename}"?`);

    if (!confirmDelete) return;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
        console.error(error);
        alert(`Error al eliminar archivo: ${error.message}`);
        return;
    }

    alert("Archivo eliminado");
    loadFiles();
}

/* ------------------------------
   Ejecutar al cargar
---------------------------------*/

loadFiles();
