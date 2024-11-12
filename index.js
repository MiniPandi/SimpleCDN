const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.static(process.env.NAME));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});