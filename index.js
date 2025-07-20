const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const indexing = process.env.INDEXING || "true";

const DATA_PATH = path.resolve(process.env.DATA_PATH || './data');

app.use((req, res, next) => {
    if (indexing == "false") {
        return next();
    }
    
    const requestedPath = path.normalize(req.path).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.resolve(path.join(DATA_PATH, requestedPath));
    
    if (!filePath.startsWith(DATA_PATH + path.sep) && filePath !== DATA_PATH) {
        return res.status(403).send("Access denied");
    }

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
            let fullLink = path.posix.join(req.path, files[i]).replace(/\\/g, '/');
            const encodedFileName = files[i]
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
            returnStr += `<a href="${fullLink}">${encodedFileName}</a><br>`;
        }
        
        const parentLink = req.path !== '/' ? `<a href="../">../</a><br>` : '';
        return res.send(parentLink + returnStr);
    }
    
    if (req.query.download === 'true') {
        res.setHeader('Content-Disposition', 'attachment');
    }
    next();
});

app.use(express.static(DATA_PATH));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});