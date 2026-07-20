const express = require("express");
const path = require("path");
const fs = require("fs");

const upload = require("../middleware/upload");
const compressPDF = require("../services/ghostscript");

const router = express.Router();

const OUTPUT_DIR = path.join(__dirname, "../output");

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

router.post("/", upload.single("pdf"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No PDF uploaded."
            });
        }

        const level = req.body.level || "medium";

        const inputFile = req.file.path;

        const outputFile = path.join(
            OUTPUT_DIR,
            `compressed-${Date.now()}.pdf`
        );

        await compressPDF(inputFile, outputFile, level);

        return res.download(outputFile, "compressed.pdf", () => {

            // Clean temporary files
            try {
                fs.unlinkSync(inputFile);
            } catch {}

            try {
                fs.unlinkSync(outputFile);
            } catch {}

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

module.exports = router;