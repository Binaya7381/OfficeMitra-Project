/* ==========================================
   OfficeMitra - Rotate PDF
   Part 1
========================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;

let originalPdfBytes = null;

let pageRotations = [];

const pdfFile = document.getElementById("pdfFile");
const chooseBtn = document.getElementById("chooseBtn");
const dropZone = document.getElementById("dropZone");

const fileName = document.getElementById("fileName");
const pageCount = document.getElementById("pageCount");

const pageGrid = document.getElementById("pageGrid");
const status = document.getElementById("status");

chooseBtn.addEventListener("click", () => {
    pdfFile.click();
});

pdfFile.addEventListener("change", e => {

    if(e.target.files.length){
        loadPDF(e.target.files[0]);
    }

});

dropZone.addEventListener("dragover", e => {

    e.preventDefault();

    dropZone.style.background="#eef5ff";

});

dropZone.addEventListener("dragleave", ()=>{

    dropZone.style.background="#fff";

});

dropZone.addEventListener("drop", e=>{

    e.preventDefault();

    dropZone.style.background="#fff";

    if(e.dataTransfer.files.length){

        loadPDF(e.dataTransfer.files[0]);

    }

});

async function loadPDF(file){

    if(file.type!="application/pdf"){

        alert("Please choose a PDF.");

        return;

    }

    status.innerHTML="Loading PDF...";

    fileName.innerHTML=file.name;

    originalPdfBytes = await file.arrayBuffer();

const bytes = originalPdfBytes.slice(0);

pdfDoc = await pdfjsLib.getDocument({
    data: bytes
}).promise;

    pageCount.innerHTML=pdfDoc.numPages;

    pageRotations=new Array(pdfDoc.numPages).fill(0);

    renderPages();

}
async function renderPages(){

    pageGrid.innerHTML="";

    for(let i=1;i<=pdfDoc.numPages;i++){

        const page=await pdfDoc.getPage(i);

        const viewport=page.getViewport({scale:1});

        const canvas=document.createElement("canvas");

        const ctx=canvas.getContext("2d");

        canvas.width=viewport.width;

        canvas.height=viewport.height;

        await page.render({

            canvasContext:ctx,

            viewport:viewport

        }).promise;

        createCard(i,canvas);

    }

    status.innerHTML="PDF Loaded Successfully";

}
function createCard(pageNo,canvas){

    const card=document.createElement("div");

    card.className="page-card";

    card.innerHTML=`

        <canvas id="canvas-${pageNo}"></canvas>

        <div class="card-body">

            <h3>Page ${pageNo}</h3>

            <div class="page-select">

                <input
                    type="checkbox"
                    class="pageCheck"
                    data-page="${pageNo}"
                >

            </div>

            <div
                class="rotation-label"
                id="rotation-${pageNo}"
            >
                Rotation : 0°
            </div>

            <div class="page-buttons">

                <button
                    class="rotate-left"
                    data-page="${pageNo}"
                >
                    ↺ Left
                </button>

                <button
                    class="rotate-right"
                    data-page="${pageNo}"
                >
                    ↻ Right
                </button>

                <button
                    class="rotate-180"
                    data-page="${pageNo}"
                >
                    180°
                </button>

                <button
                    class="reset-page"
                    data-page="${pageNo}"
                >
                    Reset
                </button>

            </div>

        </div>

    `;

    pageGrid.appendChild(card);

    const c=document.getElementById(`canvas-${pageNo}`);

    c.width=canvas.width;

    c.height=canvas.height;

    c.getContext("2d").drawImage(canvas,0,0);

}
/* ==========================================
   Part 2 - Individual Page Rotation
========================================== */

// Event Delegation
pageGrid.addEventListener("click", async (e) => {

    const btn = e.target;

    if (!btn.dataset.page) return;

    const pageNo = parseInt(btn.dataset.page);

    if (btn.classList.contains("rotate-left")) {

        pageRotations[pageNo - 1] -= 90;

        if (pageRotations[pageNo - 1] < 0)
            pageRotations[pageNo - 1] += 360;

        await updatePage(pageNo);

    }

    if (btn.classList.contains("rotate-right")) {

        pageRotations[pageNo - 1] += 90;

        pageRotations[pageNo - 1] %= 360;

        await updatePage(pageNo);

    }

    if (btn.classList.contains("rotate-180")) {

        pageRotations[pageNo - 1] += 180;

        pageRotations[pageNo - 1] %= 360;

        await updatePage(pageNo);

    }

    if (btn.classList.contains("reset-page")) {

        pageRotations[pageNo - 1] = 0;

        await updatePage(pageNo);

    }

});
/* ==========================================
   Update Single Page Preview
========================================== */

async function updatePage(pageNo) {

    const page = await pdfDoc.getPage(pageNo);

    const angle = pageRotations[pageNo - 1];

    const viewport = page.getViewport({
        scale: 1,
        rotation: angle
    });

    const canvas = document.getElementById(`canvas-${pageNo}`);

    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({

        canvasContext: ctx,
        viewport: viewport

    }).promise;

    document.getElementById(
        `rotation-${pageNo}`
    ).innerHTML = `Rotation : ${angle}°`;

}
/* ==========================================
   Part 3 - Bulk Rotation Tools
========================================== */

let allSelected = false;

const selectAllBtn = document.getElementById("selectAllBtn");
const rotateLeftSelected = document.getElementById("rotateLeftSelected");
const rotateRightSelected = document.getElementById("rotateRightSelected");
const rotate180Selected = document.getElementById("rotate180Selected");
const resetSelected = document.getElementById("resetSelected");
const fixOrientationBtn = document.getElementById("fixOrientationBtn");

/* -----------------------------
   Select All
------------------------------ */

selectAllBtn.addEventListener("click", () => {

    allSelected = !allSelected;

    document.querySelectorAll(".pageCheck").forEach(cb => {
        cb.checked = allSelected;
    });

    selectAllBtn.innerHTML = allSelected
        ? "☐ Deselect All"
        : "☑ Select All";

});

/* -----------------------------
   Get Selected Pages
------------------------------ */

function getSelectedPages(){

    const pages=[];

    document.querySelectorAll(".pageCheck").forEach(cb=>{

        if(cb.checked){

            pages.push(parseInt(cb.dataset.page));

        }

    });

    return pages;

}

/* -----------------------------
   Rotate Selected Left
------------------------------ */

rotateLeftSelected.addEventListener("click", async()=>{

    const pages=getSelectedPages();

    if(pages.length===0){

        alert("Please select pages.");

        return;

    }

    status.innerHTML="Rotating Selected Pages...";

    for(const p of pages){

        pageRotations[p-1]-=90;

        if(pageRotations[p-1]<0){

            pageRotations[p-1]+=360;

        }

        await updatePage(p);

    }

    status.innerHTML="Done";

});

/* -----------------------------
   Rotate Selected Right
------------------------------ */

rotateRightSelected.addEventListener("click", async()=>{

    const pages=getSelectedPages();

    if(pages.length===0){

        alert("Please select pages.");

        return;

    }

    status.innerHTML="Rotating Selected Pages...";

    for(const p of pages){

        pageRotations[p-1]+=90;

        pageRotations[p-1]%=360;

        await updatePage(p);

    }

    status.innerHTML="Done";

});

/* -----------------------------
   Rotate Selected 180
------------------------------ */

rotate180Selected.addEventListener("click", async()=>{

    const pages=getSelectedPages();

    if(pages.length===0){

        alert("Please select pages.");

        return;

    }

    status.innerHTML="Rotating Selected Pages...";

    for(const p of pages){

        pageRotations[p-1]+=180;

        pageRotations[p-1]%=360;

        await updatePage(p);

    }

    status.innerHTML="Done";

});

/* -----------------------------
   Reset Selected
------------------------------ */

resetSelected.addEventListener("click", async()=>{

    const pages=getSelectedPages();

    if(pages.length===0){

        alert("Please select pages.");

        return;

    }

    status.innerHTML="Resetting Pages...";

    for(const p of pages){

        pageRotations[p-1]=0;

        await updatePage(p);

    }

    status.innerHTML="Done";

});

/* -----------------------------
   Smart Orientation Fix
------------------------------ */

fixOrientationBtn.addEventListener("click", async()=>{

    if(!pdfDoc){

        alert("Please load a PDF first.");

        return;

    }

    status.innerHTML="Checking Page Orientation...";

    for(let i=1;i<=pdfDoc.numPages;i++){

        const page=await pdfDoc.getPage(i);

        const viewport=page.getViewport({scale:1});

        if(viewport.width>viewport.height){

            pageRotations[i-1]=90;

            await updatePage(i);

        }

    }

    status.innerHTML="Mixed Orientation Fixed";

});
/* ==========================================
   PART 4
========================================== */

const downloadBtn = document.getElementById("downloadBtn");

downloadBtn.addEventListener("click", saveRotatedPDF);

async function saveRotatedPDF(){

    if(!pdfDoc){

        alert("Please upload a PDF first.");

        return;

    }

    status.innerHTML="Preparing PDF...";

    downloadBtn.disabled=true;

    try{

        const pdf = await PDFLib.PDFDocument.load(originalPdfBytes);

        const pages = pdf.getPages();

        for(let i=0;i<pages.length;i++){

            pages[i].setRotation(
                PDFLib.degrees(pageRotations[i])
            );

            status.innerHTML=
            `Saving Page ${i+1} / ${pages.length}`;

        }

        const bytes = await pdf.save({

            useObjectStreams:false

        });

        const blob = new Blob(

            [bytes],

            {

                type:"application/pdf"

            }

        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href=url;

        a.download="OfficeMitra-Rotated.pdf";

        a.click();

        URL.revokeObjectURL(url);

        status.innerHTML="✅ PDF Downloaded";

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

    finally{

        downloadBtn.disabled=false;

    }

}