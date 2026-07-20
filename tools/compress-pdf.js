// ======================================================
// OfficeMitra - Compress PDF Tool
// Part 1 : Setup, DOM, Validation & Utility Functions
// ======================================================

// ------------------------------
// Backend API
// ------------------------------

const API_URL = "http://localhost:5000/api/compress";

// ------------------------------
// DOM Elements
// ------------------------------

const chooseBtn = document.getElementById("chooseBtn");
const fileInput = document.getElementById("pdfFile");
const dropZone = document.getElementById("dropZone");

const fileName = document.getElementById("fileName");
const originalSize = document.getElementById("originalSize");
const pageCount = document.getElementById("pageCount");

const compressionLevel = document.getElementById("compressionLevel");

const compressBtn = document.getElementById("compressBtn");
const downloadBtn = document.getElementById("downloadBtn");

const progressBar = document.getElementById("progressBar");
const status = document.getElementById("status");

const compressedSize = document.getElementById("compressedSize");
const savedPercent = document.getElementById("savedPercent");

// ------------------------------
// Global Variables
// ------------------------------

let selectedFile = null;
let compressedBlob = null;

// ------------------------------
// Helper Functions
// ------------------------------

function formatSize(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function updateStatus(message) {
    status.textContent = message;
}

function resetUI() {

    compressedBlob = null;

    compressedSize.textContent = "0 MB";
    savedPercent.textContent = "0%";

    progressBar.style.width = "0%";

    downloadBtn.disabled = true;

}

function setLoading(isLoading) {

    compressBtn.disabled = isLoading;

    compressBtn.textContent = isLoading
        ? "Compressing..."
        : "Compress PDF";

}

function validatePDF(file) {

    if (!file) {

        alert("Please select a PDF file.");

        return false;

    }

    if (file.type !== "application/pdf") {

        alert("Only PDF files are allowed.");

        return false;

    }

    if (file.size > 100 * 1024 * 1024) {

        alert("Maximum file size is 100 MB.");

        return false;

    }

    return true;

}

// ------------------------------
// Progress Animation
// ------------------------------

function startProgress() {

    let progress = 0;

    progressBar.style.width = "0%";

    return setInterval(() => {

        if (progress < 90) {

            progress += Math.random() * 8;

            if (progress > 90)
                progress = 90;

            progressBar.style.width = progress + "%";

        }

    }, 180);

}

// ------------------------------
// File Selection
// ------------------------------

chooseBtn.addEventListener("click", () => {

    fileInput.click();

});

fileInput.addEventListener("change", () => {

    if (fileInput.files.length) {

        loadPDF(fileInput.files[0]);

    }

});

// ------------------------------
// Drag & Drop
// ------------------------------

dropZone.addEventListener("dragover", (e) => {

    e.preventDefault();

    dropZone.classList.add("dragging");

});

dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragging");

});

dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.classList.remove("dragging");

    if (e.dataTransfer.files.length) {

        loadPDF(e.dataTransfer.files[0]);

    }

});
// ======================================================
// Part 2 : Load PDF & Display Information
// ======================================================

async function loadPDF(file) {

    // Validate file
    if (!validatePDF(file)) {
        return;
    }

    try {

        selectedFile = file;

        resetUI();

        updateStatus("Reading PDF...");

        // File Name
        fileName.textContent = file.name;

        // Original Size
        originalSize.textContent = formatSize(file.size);

        // Read PDF using pdf.js
        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
            data: arrayBuffer
        }).promise;

        // Total Pages
        pageCount.textContent = pdf.numPages;

        updateStatus("Ready for compression.");

    }
    catch (error) {

        console.error(error);

        selectedFile = null;

        fileName.textContent = "No File Selected";
        originalSize.textContent = "0 MB";
        pageCount.textContent = "0";

        updateStatus("Invalid PDF File");

        alert("Unable to read this PDF.");

    }

}
// ======================================================
// Part 3 : Compress PDF using Backend API
// ======================================================

compressBtn.addEventListener("click", async () => {

    if (!selectedFile) {
        alert("Please select a PDF first.");
        return;
    }

    setLoading(true);

    resetUI();

    updateStatus("Uploading PDF...");

    const timer = startProgress();

    try {

        const formData = new FormData();

        formData.append("pdf", selectedFile);
        formData.append("level", compressionLevel.value);

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        clearInterval(timer);

        if (!response.ok) {

            let message = "Compression failed.";

            try {
                const error = await response.json();
                message = error.message || message;
            } catch {}

            throw new Error(message);
        }

        compressedBlob = await response.blob();

        progressBar.style.width = "100%";

        updateStatus("Compression Completed");

        // Calculate Sizes

        const originalBytes = selectedFile.size;

        const compressedBytes = compressedBlob.size;

        compressedSize.textContent = formatSize(compressedBytes);

        let saved = ((originalBytes - compressedBytes) / originalBytes) * 100;

        if (saved < 0) saved = 0;

        savedPercent.textContent = saved.toFixed(1) + "%";

        downloadBtn.disabled = false;

    }
    catch (err) {

        clearInterval(timer);

        progressBar.style.width = "0%";

        updateStatus("Compression Failed");

        console.error(err);

        alert(
            "Compression failed.\n\n" +
            err.message
        );

    }
    finally {

        setLoading(false);

    }

});
// ======================================================
// Part 4 : Download Compressed PDF
// ======================================================

downloadBtn.addEventListener("click", () => {

    if (!compressedBlob) {
        alert("No compressed PDF available.");
        return;
    }

    const url = URL.createObjectURL(compressedBlob);

    const link = document.createElement("a");

    const originalName = selectedFile.name.replace(/\.pdf$/i, "");

    const today = new Date();

    const dateStamp =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

    link.href = url;

    link.download = `${originalName}-compressed-${dateStamp}.pdf`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(() => {

        URL.revokeObjectURL(url);

    }, 1000);

});

// ======================================================
// Initialize UI
// ======================================================

resetUI();

updateStatus("Waiting for PDF...");