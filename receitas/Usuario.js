import mongoose from 'mongoose'

let usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, "O nome é obrigatório"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "O email é obrigatório"],
        trim: true,
        lowercase: true
    },
    senhaHash: {
        type: String,
        required: true,
        select: false
    }
})

let Usuario = mongoose.model("Usuario", usuarioSchema)

export default Usuario