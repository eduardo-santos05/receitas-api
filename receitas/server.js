import express from 'express'
import mongoose from '../conexao.js'
import Receita from './Receita.js'
import Usuario from './Usuario.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { autenticar } from './autenticar.js'
import dotenv from 'dotenv'

const router = express()
const port = 3000

router.use(express.json())

router.post("/cadastro", async (req, res) => {
    try {
        if (!req.body.nome || !req.body.email || !req.body.senha) {
            return res.status(400).send({ erro: "Nome, email e senha são obrigatórios" })
        }

        if (req.body.senha < 8) {
            return res.status(400).send({ erro: "Senha deve ter no mínimo 8 caracteres." })
        }

        let email = req.body.email.trim()
        let existente = await Usuario.find({ email: email })
        
        if (existente.length > 0) { 
            return res.status(400).send({ erro: "Email já está cadastrado" })
        }

        let senhaHash = await bcrypt.hash(req.body.senha, 10)
        let usuario = await Usuario.create({
            nome: req.body.nome,
            email: email,
            senhaHash: senhaHash
        })
        res.status(201).send(usuario)
    } catch (erro) {
        res.status(400).send({ erro: error.message })
    }
})

router.post("/login", async (req, res) => {
    if (!req.body.email || !req.body.senha) {
        return res.status(400).send({ erro: "Email e senha são obrigatórios" })
    }
    let email = req.body.email
    let senha = req.body.senha

    let encontrados = await Usuario.find({ email: email }).select("+senhaHash")
    if (encontrados.length === 0) {
        return res.status(401).send({ erro: "Acesso não autorizado" })
    }

    let usuario = encontrados[0]

    let senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash)

    if (senhaCorreta === false) {
        return res.status(401).send({ erro: "Credenciais incorretas" })
    }

    let token = jwt.sign(
        { email: usuario.email, nome: usuario.nome },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    res.send({ token: token })
})


router.listen(port, ()=>{
    console.log(`Servidor rodando na porta ${port}`)
})