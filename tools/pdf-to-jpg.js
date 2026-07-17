/* ==========================================
   OfficeMitra PDF to JPG
   Version 1.0
========================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const pdfInput = document.getElementById("pdfInput");
const selectBtn = document.getElementById("selectBtn");
const uploadBox = document.getElementById("uploadBox");

const fileName = document.getElementById("fileName");
const pageCount = document.getElementById("pageCount");
const imageList = document.getElementById("imageList");
const status = document.getElementById("status");

let pdfDoc = null;

// =============================
// Select Button
// =============================

selectBtn.onclick = function () {
    pdfInput.value = "";
    pdfInput.click();
};

// =============================
// File Selected
// =============================

pdfInput.onchange = function () {

    if (this.files.length > 0) {

        loadPDF(this.files[0]);

    }

};

// =============================
// Drag & Drop
// =============================

uploadBox.addEventListener("dragover", function (e) {

    e.preventDefault();

    uploadBox.style.background = "#eef5ff";

});

uploadBox.addEventListener("dragleave", function () {

    uploadBox.style.background = "#fff";

});

uploadBox.addEventListener("drop", function (e) {

    e.preventDefault();

    uploadBox.style.background = "#fff";

    if (e.dataTransfer.files.length > 0) {

        loadPDF(e.dataTransfer.files[0]);

    }

});

// =============================
// Load PDF
// =============================

async function loadPDF(file) {

    try {

        if (file.type !== "application/pdf") {

            alert("Please select PDF file.");

            return;

        }

        status.innerHTML = "Loading PDF...";

        fileName.innerHTML = file.name;

        const buffer = await file.arrayBuffer();

        pdfDoc = await pdfjsLib.getDocument({

            data: buffer

        }).promise;

        pageCount.innerHTML = pdfDoc.numPages;

        imageList.innerHTML = "";

        for (let i = 1; i <= pdfDoc.numPages; i++) {

            const page = await pdfDoc.getPage(i);

            const viewport = page.getViewport({

                scale: 0.6

            });

            const canvas = document.createElement("canvas");

            const ctx = canvas.getContext("2d");

            canvas.width = viewport.width;

            canvas.height = viewport.height;

            await page.render({

                canvasContext: ctx,

                viewport: viewport

            }).promise;

            const card = document.createElement("div");

            card.className = "page-card";

            const number = document.createElement("div");

            number.className = "page-number";

            number.innerHTML = "Page " + i;

            card.appendChild(canvas);

            card.appendChild(number);

            imageList.appendChild(card);

        }

        status.innerHTML = "✅ PDF Loaded Successfully";

    }

    catch (error) {

        console.error(error);

        status.innerHTML = "❌ Error Loading PDF";

        alert(error.message);

    }

}
// =============================
// Convert PDF Pages to JPG
// =============================

const convertBtn = document.getElementById("convertBtn");

convertBtn.addEventListener("click", async function () {

    if (!pdfDoc) {
        alert("Please select a PDF first.");
        return;
    }

    status.innerHTML = "Converting PDF to JPG...";

    const quality = parseFloat(document.getElementById("quality").value);

    for (let i = 1; i <= pdfDoc.numPages; i++) {

        const page = await pdfDoc.getPage(i);

        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;

        const image = canvas.toDataURL("image/jpeg", quality);

        const link = document.createElement("a");
        link.href = image;
        link.download = "Page-" + i + ".jpg";
        link.click();
    }

    status.innerHTML = "✅ JPG files downloaded successfully.";

});
// =============================
// Download All JPG as ZIP
// =============================

const downloadZipBtn = document.getElementById("downloadZipBtn");

downloadZipBtn.addEventListener("click", async () => {

    if (!pdfDoc) {
        alert("Please select a PDF first.");
        return;
    }

    status.innerHTML = "Creating ZIP...";

    const zip = new JSZip();
    const quality = parseFloat(document.getElementById("quality").value);

    for (let i = 1; i <= pdfDoc.numPages; i++) {

        const page = await pdfDoc.getPage(i);

        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;

        const dataURL = canvas.toDataURL("image/jpeg", quality);

        const base64 = dataURL.split(",")[1];

        zip.file(`Page-${i}.jpg`, base64, { base64: true });

    }

    const content = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "OfficeMitra-PDF-to-JPG.zip";
    link.click();

    status.innerHTML = "✅ ZIP Downloaded Successfully";

});