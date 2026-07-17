/* ==========================================
   OfficeMitra - Delete PDF Pages
   Part 1 : Upload + Preview
========================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const pdfFile = document.getElementById("pdfFile");
const chooseBtn = document.getElementById("chooseBtn");
const dropZone = document.getElementById("dropZone");

const fileName = document.getElementById("fileName");
const pageCount = document.getElementById("pageCount");

const pageGrid = document.getElementById("pageGrid");
const status = document.getElementById("status");

let pdfDoc = null;
let originalPdfBytes = null;

let selectedPages = [];
let deletedPages = [];

/* ===========================
   Choose Button
=========================== */

chooseBtn.addEventListener("click", () => {
    pdfFile.click();
});

pdfFile.addEventListener("change", (e) => {

    if (e.target.files.length === 0) return;

    loadPDF(e.target.files[0]);

});

/* ===========================
   Drag & Drop
=========================== */

dropZone.addEventListener("dragover", (e) => {

    e.preventDefault();

    dropZone.style.background = "#ffeaea";

});

dropZone.addEventListener("dragleave", () => {

    dropZone.style.background = "";

});

dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.style.background = "";

    if (e.dataTransfer.files.length === 0) return;

    loadPDF(e.dataTransfer.files[0]);

});

/* ===========================
   Load PDF
=========================== */

async function loadPDF(file){

    try{

        status.innerText = "Loading PDF...";

        originalPdfBytes = await file.arrayBuffer();

        pdfDoc = await pdfjsLib.getDocument({
            data: originalPdfBytes
        }).promise;

        fileName.innerText = file.name;

        pageCount.innerText = pdfDoc.numPages;

        selectedPages = [];
        deletedPages = [];

        renderAllPages();

    }

    catch(err){

        console.error(err);

        status.innerText = "Invalid PDF File.";

    }

}

/* ===========================
   Render All Pages
=========================== */

async function renderAllPages(){

    pageGrid.innerHTML = "";

    for(let pageNum=1; pageNum<=pdfDoc.numPages; pageNum++){

        if(deletedPages.includes(pageNum))
            continue;

        const page = await pdfDoc.getPage(pageNum);

        const viewport = page.getViewport({
            scale:1
        });

        const canvas = document.createElement("canvas");

        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({

            canvasContext:ctx,
            viewport:viewport

        }).promise;

        const card = document.createElement("div");
        card.className = "page-card";

        const body = document.createElement("div");
        body.className = "card-body";

        const title = document.createElement("h3");
        title.innerText = "Page " + pageNum;

        const wrapper = document.createElement("div");
        wrapper.className = "page-select";

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.dataset.page = pageNum;

        checkbox.checked = selectedPages.includes(pageNum);

        checkbox.addEventListener("change", function(){

            const page = Number(this.dataset.page);

            if(this.checked){

                if(!selectedPages.includes(page))
                    selectedPages.push(page);

            }else{

                selectedPages =
                    selectedPages.filter(p => p !== page);

            }

        });

        wrapper.appendChild(checkbox);

        body.appendChild(title);
        body.appendChild(wrapper);

        card.appendChild(canvas);
        card.appendChild(body);

        pageGrid.appendChild(card);

    }

    status.innerText =
        "PDF Loaded Successfully.";

}
/* ==========================================
   OfficeMitra - Delete PDF Pages
   Part 2 : Selection Tools
========================================== */

const selectAllBtn = document.getElementById("selectAllBtn");
const clearSelectionBtn = document.getElementById("clearSelectionBtn");
const deleteOddBtn = document.getElementById("deleteOddBtn");
const deleteEvenBtn = document.getElementById("deleteEvenBtn");
const deleteRangeBtn = document.getElementById("deleteRangeBtn");

const startPage = document.getElementById("startPage");
const endPage = document.getElementById("endPage");

/* ===========================
   Refresh Checkboxes
=========================== */

function refreshSelection() {

    document.querySelectorAll(".page-select input").forEach(box => {

        const page = Number(box.dataset.page);

        box.checked = selectedPages.includes(page);

    });

}

/* ===========================
   Select All
=========================== */

selectAllBtn.addEventListener("click", () => {

    selectedPages = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {

        if (!deletedPages.includes(i))
            selectedPages.push(i);

    }

    refreshSelection();

    status.innerText =
        selectedPages.length + " pages selected.";

});

/* ===========================
   Clear Selection
=========================== */

clearSelectionBtn.addEventListener("click", () => {

    selectedPages = [];

    refreshSelection();

    status.innerText = "Selection cleared.";

});

/* ===========================
   Delete Odd Pages
=========================== */

deleteOddBtn.addEventListener("click", () => {

    selectedPages = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {

        if (i % 2 !== 0 && !deletedPages.includes(i))
            selectedPages.push(i);

    }

    refreshSelection();

    status.innerText =
        "Odd pages selected.";

});

/* ===========================
   Delete Even Pages
=========================== */

deleteEvenBtn.addEventListener("click", () => {

    selectedPages = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {

        if (i % 2 === 0 && !deletedPages.includes(i))
            selectedPages.push(i);

    }

    refreshSelection();

    status.innerText =
        "Even pages selected.";

});

/* ===========================
   Delete Range
=========================== */

deleteRangeBtn.addEventListener("click", () => {

    const start = parseInt(startPage.value);

    const end = parseInt(endPage.value);

    if (isNaN(start) || isNaN(end)) {

        alert("Please enter valid page numbers.");

        return;

    }

    if (start < 1 || end > pdfDoc.numPages || start > end) {

        alert("Invalid page range.");

        return;

    }

    selectedPages = [];

    for (let i = start; i <= end; i++) {

        if (!deletedPages.includes(i))
            selectedPages.push(i);

    }

    refreshSelection();

    status.innerText =
        "Pages " + start + " to " + end + " selected.";

});
/* ==========================================
   OfficeMitra - Delete PDF Pages
   Part 3 : Delete + Undo + Download
========================================== */

const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const undoBtn = document.getElementById("undoBtn");
const downloadBtn = document.getElementById("downloadBtn");

/* ===========================
   Delete Selected Pages
=========================== */

deleteSelectedBtn.addEventListener("click", () => {

    if (selectedPages.length === 0) {

        alert("Please select at least one page.");

        return;

    }

    deletedPages = [...new Set([
        ...deletedPages,
        ...selectedPages
    ])];

    selectedPages = [];

    renderAllPages();

    status.innerText =
        deletedPages.length + " page(s) removed from preview.";

});

/* ===========================
   Undo Delete
=========================== */

undoBtn.addEventListener("click", () => {

    deletedPages = [];

    selectedPages = [];

    renderAllPages();

    status.innerText = "All deleted pages restored.";

});

/* ===========================
   Download PDF
=========================== */

downloadBtn.addEventListener("click", savePDF);

async function savePDF() {

    try {

        if (!originalPdfBytes) {

            alert("Please upload a PDF first.");

            return;

        }

        if (deletedPages.length >= pdfDoc.numPages) {

            alert("You cannot delete all pages.");

            return;

        }

        status.innerText = "Creating PDF...";

        const srcPdf = await PDFLib.PDFDocument.load(originalPdfBytes);
        const newPdf = await PDFLib.PDFDocument.create();

        const keepPages = [];

        for (let i = 0; i < srcPdf.getPageCount(); i++) {

            if (!deletedPages.includes(i + 1)) {

                keepPages.push(i);

            }

        }

        const copiedPages = await newPdf.copyPages(srcPdf, keepPages);

        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save({
            useObjectStreams: false
        });

        const blob = new Blob(
            [pdfBytes],
            { type: "application/pdf" }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = "OfficeMitra_Deleted_Pages.pdf";

        document.body.appendChild(a);

        a.click();

        a.remove();

        URL.revokeObjectURL(url);

        status.innerText =
            "PDF downloaded successfully.";

    }

    catch (err) {

        console.error(err);

        alert("Error while creating PDF.");

        status.innerText = "Download failed.";

    }

}