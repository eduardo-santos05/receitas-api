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

router.get("/receitas", async (req, res) => {
    let receitas = await Receita.find()
    res.send(receitas)
})

router.get("/receitas/:id", async (req, res) => {
    try {
        let receita = await Receita.findById(req.params.id)
        if (receita === null) {
            return res.status(404).send({ erro: "Receita não encontrada" })
        }
        res.send(receita)
    } catch (erro) {
        res.status(400).send({ erro: erro.message })
    }
})

router.get("/minhas-receitas", autenticar, async (req, res) => {
    let receitas = await Receita.find({"autor.email": req.usuario.email})
    res.send(receitas)
})

router.post("/receitas", autenticar, async (req, res) => {
    try {
        req.body.autor = { nome: req.usuario.nome, email: req.usuario.email }
        let receita = await Receita.create(req.body)
        res.status(201).send(receita)
    } catch (erro) {
        res.status(400).send({ erro: erro.message })
    }
})

router.put("/receitas/:id", autenticar, async (req, res) => {
    try {
        delete req.body.autor
        let receita = await Receita.findById(req.params.id)
        if (receita === null) {
            return res.status(404).send({ erro: "Receita não encontrada" })
        }
        if (receita.autor.email !== req.usuario.email) {
            return res.status(403).send({ erro: "Você só pode editar as suas receitas" })
        }
        await Receita.findByIdAndUpdate(req.params.id, req.body)
        res.send({ mensagem: "Receita atualizada." })
    } catch (erro) {
        res.status(400).send({ erro: erro.message })
    }
})

router.delete("/receitas/:id", autenticar, async (req, res) => {
    try {
        let receita = await Receita.findById(req.params.id)
        if (receita === null) {
            return res.status(404).send({ erro: "Receita não encontrada" })
        }
        if (receita.autor.email !== req.usuario.email) {
            return res.status(403).send({ erro: "Você só pode apagar as suas receitas" })
        }
        await Receita.findByIdAndDelete(req.params.id)
        res.send({ mensagem: "Receita removida." })
    } catch (erro) {
        res.status(400).send({ erro: erro.message })
    }
})

router.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})