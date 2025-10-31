import express from "express";
import dotenv from 'dotenv';
const app = express();
const PORT = 8445;

dotenv.config();


app.use(express.json())
 
app.listen (
    PORT,
    () => console.log(`It's alive on http://localhost:${PORT}`)
)


app.get('/ping' ,(req,res) => {
    return res.status(200).send("Listining");
})

