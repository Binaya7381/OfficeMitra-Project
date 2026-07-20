const express = require("express");
const cors = require("cors");

const compressRoute = require("./routes/compress-pdf");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/compress", compressRoute);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "OfficeMitra Backend Running 🚀"
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});