const express = require("express")
const app = express()
const cors = require("cors")

const routes = require('./routes');

app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use('/', routes);

const port = '5555'
app.listen(port, () =>
    console.log(`Server is listening on port ${port}...`)
);
