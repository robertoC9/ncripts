import { supabase } from "./supabase.js";

/* ------------------------------
   Cargar archivos del bucket
---------------------------------*/

async function loadFiles() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "<p>Cargando archivos...</p>";

    const { data, error } = await supabase.storage
        .from("encrypted-files")
        .list("", { limit: 100 });

    if (error) {
        fileList.innerHTML = "<p>Error al cargar archivos.</p>";
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
        item.querySelector(".download").onclick = () => downloadFile(file.name);

        // Eliminar archivo
        item.querySelector(".delete").onclick = () => deleteFile(file.name);

        fileList.appendChild(item);
    });
}

/* ------------------------------
   Descargar archivo
---------------------------------*/

async function downloadFile(filename) {
    const { data, error } = await supabase.storage
        .from("encrypted-files")
        .download(filename);

    if (error) {
        alert("Error al descargar archivo");
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

async function deleteFile(filename) {
    const confirmDelete = confirm(`¿Eliminar archivo "${filename}"?`);

    if (!confirmDelete) return;

    const { error } = await supabase.storage
        .from("encrypted-files")
        .remove([filename]);

    if (error) {
        alert("Error al eliminar archivo");
        return;
    }

    alert("Archivo eliminado");
    loadFiles();
}

/* ------------------------------
   Ejecutar al cargar
---------------------------------*/

loadFiles();
