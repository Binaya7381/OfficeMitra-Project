const { execFile } = require("child_process");
const path = require("path");

const GS_COMMAND = "gswin64c";

const QUALITY = {
    high: "/screen",      // Maximum compression
    medium: "/ebook",     // Balanced
    low: "/printer"       // Better quality
};

function compressPDF(inputFile, outputFile, level = "medium") {

    return new Promise((resolve, reject) => {

        const preset = QUALITY[level] || QUALITY.medium;

        const args = [
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            `-dPDFSETTINGS=${preset}`,
            `-sOutputFile=${outputFile}`,
            inputFile
        ];

        execFile(GS_COMMAND, args, (error) => {

            if (error) {
                return reject(error);
            }

            resolve(outputFile);

        });

    });

}

module.exports = compressPDF;