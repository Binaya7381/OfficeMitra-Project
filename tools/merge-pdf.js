/* ==========================================
   OfficeMitra - Merge PDF
========================================== */

const pdfInput = document.getElementById("pdfInput");
const dropZone = document.getElementById("dropZone");
const fileList = document.getElementById("fileList");
const mergeBtn = document.getElementById("mergeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progressBar = document.getElementById("progressBar");
const statusText = document.getElementById("status");

let pdfFiles = [];

/* ================= Upload ================= */

pdfInput.addEventListener("change", (e) => {
    addFiles([...e.target.files]);
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

    const files = [...e.dataTransfer.files]
        .filter(file => file.type === "application/pdf");

    addFiles(files);
});

/* ================= Add Files ================= */

function addFiles(files){

    files.forEach(file=>{

        if(file.type==="application/pdf"){

            pdfFiles.push(file);

        }

    });

    renderFiles();

}

/* ================= Render File List ================= */

function renderFiles(){

    fileList.innerHTML="";

    pdfFiles.forEach((file,index)=>{

        const li=document.createElement("li");

        li.innerHTML=`

        <div class="file-name">

        <i class="fa-solid fa-file-pdf"></i>

        ${file.name}

        </div>

        <button class="remove-btn">

        <i class="fa-solid fa-trash"></i>

        </button>

        `;

        li.querySelector(".remove-btn").onclick=()=>{

            pdfFiles.splice(index,1);

            renderFiles();

        };

        fileList.appendChild(li);

    });

}

/* ================= Sortable ================= */

new Sortable(fileList,{

    animation:150,

    onEnd:function(){

        const items=[...fileList.children];

        pdfFiles=items.map(item=>{

            const name=item.querySelector(".file-name").textContent.trim();

            return pdfFiles.find(file=>file.name===name);

        });

    }

});

/* ================= Merge PDF ================= */

mergeBtn.addEventListener("click", async()=>{

    if(pdfFiles.length<2){

        alert("Please select at least 2 PDF files.");

        return;

    }

    statusText.innerText="Merging PDFs...";

    progressBar.style.width="20%";

    const mergedPdf=await PDFLib.PDFDocument.create();

    for(let i=0;i<pdfFiles.length;i++){

        const bytes=await pdfFiles[i].arrayBuffer();

        const pdf=await PDFLib.PDFDocument.load(bytes);

        const pages=await mergedPdf.copyPages(pdf,pdf.getPageIndices());

        pages.forEach(page=>mergedPdf.addPage(page));

        progressBar.style.width=((i+1)/pdfFiles.length*90)+"%";

    }

    const mergedBytes=await mergedPdf.save();

    const blob=new Blob([mergedBytes],{

        type:"application/pdf"

    });

    const url=URL.createObjectURL(blob);

    downloadBtn.href=url;

    downloadBtn.download="OfficeMitra-Merged.pdf";

    downloadBtn.style.display="inline-block";

    progressBar.style.width="100%";

    statusText.innerText="Merge Completed Successfully.";

});

/* ================= Click Upload ================= */

dropZone.addEventListener("click",()=>{

    pdfInput.click();

});