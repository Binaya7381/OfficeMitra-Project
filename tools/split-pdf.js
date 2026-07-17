/* ==========================================
   OfficeMitra - Split PDF
========================================== */

const pdfInput = document.getElementById("pdfInput");
const dropZone = document.getElementById("dropZone");
const pdfInfo = document.getElementById("pdfInfo");
const pageRange = document.getElementById("pageRange");
const splitBtn = document.getElementById("splitBtn");
const progressBar = document.getElementById("progressBar");
const statusText = document.getElementById("status");
const downloadBtn = document.getElementById("downloadBtn");

let selectedFile = null;
let loadedPdf = null;

/* ================= Upload ================= */

dropZone.addEventListener("click", () => {
    pdfInput.click();
});

pdfInput.addEventListener("change", (e) => {

    if (!e.target.files.length) return;

    loadPDF(e.target.files[0]);

});

/* ================= Drag & Drop ================= */

dropZone.addEventListener("dragover", (e) => {

    e.preventDefault();
    dropZone.classList.add("dragover");

});

dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragover");

});

dropZone.addEventListener("drop", (e) => {

    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {

        alert("Please select a PDF file.");
        return;

    }

    loadPDF(file);

});

/* ================= Load PDF ================= */

async function loadPDF(file) {

    try {

        selectedFile = file;

        const bytes = await file.arrayBuffer();

        loadedPdf = await PDFLib.PDFDocument.load(bytes);

        pdfInfo.innerHTML = `
            <h3>${file.name}</h3>
            <p><strong>Total Pages:</strong> ${loadedPdf.getPageCount()}</p>
            <p><strong>File Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        `;

        statusText.innerText = "PDF Loaded Successfully.";

    } catch (err) {

        console.error(err);
        alert("Unable to open PDF.");

    }

}

/* ================= Split ================= */

splitBtn.addEventListener("click", async () => {

    if (!loadedPdf) {

        alert("Please upload a PDF first.");
        return;

    }

    const range = pageRange.value.trim();

    if (!range) {

        alert("Enter page range.");
        return;

    }

    try {

        statusText.innerText = "Splitting PDF...";
        progressBar.style.width = "20%";

        const newPdf = await PDFLib.PDFDocument.create();

        const pages = parseRange(range, loadedPdf.getPageCount());

        if (pages.length === 0) {

            alert("Invalid page range.");
            progressBar.style.width = "0%";
            return;

        }

        for (let i = 0; i < pages.length; i++) {

            const copied = await newPdf.copyPages(
                loadedPdf,
                [pages[i] - 1]
            );

            newPdf.addPage(copied[0]);

            progressBar.style.width =
                ((i + 1) / pages.length) * 90 + "%";

        }

        const bytes = await newPdf.save();

        const blob = new Blob([bytes], {
            type: "application/pdf"
        });

        const url = URL.createObjectURL(blob);

        downloadBtn.href = url;
        downloadBtn.download = "OfficeMitra-Split.pdf";
        downloadBtn.style.display = "inline-block";

        progressBar.style.width = "100%";
        statusText.innerText = "Split Completed Successfully.";

    } catch (err) {

        console.error(err);
        alert("Something went wrong while splitting.");

    }

});

/* ================= Parse Range ================= */

function parseRange(text, totalPages) {

    let result = [];

    const parts = text.split(",");

    parts.forEach(part => {

        part = part.trim();

        if (part.includes("-")) {

            let [start, end] = part.split("-").map(Number);

            if (
                isNaN(start) ||
                isNaN(end)
            ) return;

            if (start > end) {

                [start, end] = [end, start];

            }

            for (let i = start; i <= end; i++) {

                if (i >= 1 && i <= totalPages) {

                    result.push(i);

                }

            }

        } else {

            const page = Number(part);

            if (
                !isNaN(page) &&
                page >= 1 &&
                page <= totalPages
            ) {

                result.push(page);

            }

        }

    });

    result = [...new Set(result)];

    result.sort((a, b) => a - b);

    return result;

}