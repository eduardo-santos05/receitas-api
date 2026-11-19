import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

await mongoose.connect(process.env.MONGO_URI, { dbName: "receitas" })
console.log("Conectado ao MongoDB!")

export default mongoose
