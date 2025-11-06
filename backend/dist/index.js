"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
const PORT = 8445;
dotenv_1.default.config();
app.use(express_1.default.json());
app.listen(PORT, () => console.log(`It's alive on http://localhost:${PORT}`));
app.get('/ping', (req, res) => {
    return res.status(200).send("Listining");
});
