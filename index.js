const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const indexing = process.env.INDEXING || "true";

app.use(cors());
app.use((req, res, next) => {
    if (indexing == "false") {
        return next();
    }
    const filePath = path.join(process.env.NAME, req.path);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
        let files = fs.readdirSync(filePath);
        if (files.length === 0) {
            return res.status(404).send("File not found");
        }
        let returnStr = '';
        for (let i = 0; i < files.length; i++) {
            let fullLink = path.join(req.path, files[i]);
            returnStr += `<a href="${fullLink}">${files[i]}</a><br>`;
        }
        return res.send(`<a href="../">../</a><br>` + returnStr);
    }
    if (req.query.download === 'true') {
        res.setHeader('Content-Disposition', 'attachment');
    }
    next();
});

app.use(express.static(process.env.NAME));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});