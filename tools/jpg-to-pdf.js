const imageInput = document.getElementById("imageInput");
const selectBtn = document.getElementById("selectBtn");
const uploadBox = document.getElementById("uploadBox");
const imageList = document.getElementById("imageList");
const convertBtn = document.getElementById("convertBtn");
const statusBox = document.getElementById("status");

let images = [];

// Select Button
selectBtn.addEventListener("click", () => {
    imageInput.click();
});

// File Selection
imageInput.addEventListener("change", (e) => {
    addImages(e.target.files);
});

// Drag & Drop
uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.style.background = "#eef5ff";
});

uploadBox.addEventListener("dragleave", () => {
    uploadBox.style.background = "#fff";
});

uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.style.background = "#fff";
    addImages(e.dataTransfer.files);
});

// Add Images
function addImages(files) {

    [...files].forEach(file => {

        if (!file.type.startsWith("image/")) return;

        images.push(file);

        const reader = new FileReader();

        reader.onload = function(ev){

            const card = document.createElement("div");
            card.className = "image-card";

            card.innerHTML = `
                <img src="${ev.target.result}">
                <div class="image-name">${file.name}</div>
            `;

            imageList.appendChild(card);

        };

        reader.readAsDataURL(file);

    });

}

// Sortable
new Sortable(imageList,{
    animation:150
});

// Convert
convertBtn.addEventListener("click", async ()=>{

    if(images.length===0){
        alert("Please select images.");
        return;
    }

    statusBox.innerHTML="Creating PDF...";

    const pdfDoc = await PDFLib.PDFDocument.create();

    for(const file of images){

        const bytes = await file.arrayBuffer();

        let image;

        if(file.type==="image/png"){

            image = await pdfDoc.embedPng(bytes);

        }else{

            image = await pdfDoc.embedJpg(bytes);

        }

        const page = pdfDoc.addPage([595.28,841.89]);

        const {width,height}=image.scale(1);

        const maxWidth=500;
        const maxHeight=740;

        const ratio=Math.min(maxWidth/width,maxHeight/height);

        const w=width*ratio;
        const h=height*ratio;

        page.drawImage(image,{
            x:(595.28-w)/2,
            y:(841.89-h)/2,
            width:w,
            height:h
        });

    }

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes],{
        type:"application/pdf"
    });

    const link=document.createElement("a");

    link.href=URL.createObjectURL(blob);

    link.download="OfficeMitra-Images.pdf";

    link.click();

    statusBox.innerHTML="✅ PDF Created Successfully";

});