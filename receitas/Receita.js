import mongoose from 'mongoose'

let receitaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, "O título da receita é obrigatório"],
        minlength: [3, "O título precisa ter no mínimo 3 letras"],
        trim: true
    },
    categoria: {
        type: String,
        enum: {
            values: ["Doce", "Salgado", "Bebida"],
            message: "{VALUE} não é uma categoria válida"
        },
        default: "Salgado"
    },
    tempoPreparo: {
        type: Number,
        min: [1, "O tempo de preparo precisa ser de pelo menos 1 minuto"]
    },
    ingredientes: [
        {
            nome: { required: [true, "O ingrediente precisa de um nome"] },
            quantidade: { type: String }
        }
    ],
    autor: {
        nome: { required: [true, "O nome do autor é obrigatório"] },
        email: { required: [true, "O email do autor é obrigatório"] }
    },
}, { timestamps: true })