import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//Geração de tokens/cookies
const gerarTokens = (userId) => {
    const tokenAcesso = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m",});

    const tokenRefresh = jwt.sign({userId}, process.env.REFRESH_TOKEN_ACCESS, {expiresIn: "7d",});

    return {tokenAcesso, tokenRefresh};
};

const guardarTokenRefresh = async(userId, tokenRefresh) => {
    await redis.set(`refresh_token:${userId}`, tokenRefresh, "EX", 7 * 24 * 60 * 60);
}

const setCookies = (res, tokenAcesso, tokenRefresh) => {
    res.cookie("tokenAcesso", tokenAcesso, {
        //Opções de segurança dos cookies
        httpOnly: true, //Previne ataques XSS
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", //Previne ataques CSRF
        maxAge: 15 * 60 * 1000, //Expira em 15min
    });

    res.cookie("tokenRefresh", tokenRefresh, {
        //Opções de segurança dos cookies
        httpOnly: true, //Previne ataques XSS
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", //Previne ataques CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, //Expira em 7 dias
    });
};

//-----------------------------------------------

//Criação de conta
export const signup = async (req, res) => {
    const {email, password, nome} = req.body
    try {
        //Guardar o user na bd
        const userExiste = await User.findOne({email});
        if(userExiste){
            return res.status(400).json({msg: "O utilizador já existe."});
        }
        const user = await User.create({nome, email, password});
            
        //Autenticação do user
        const {tokenAcesso, tokenRefresh} = gerarTokens(user._id);
        await guardarTokenRefresh(user._id, tokenRefresh);

        setCookies(res, tokenAcesso, tokenRefresh);

        res.status(201).json({user:{
            _id: user._id,
            nome: user.nome,
            email: user.email,
            cargo: user.cargo
        }, msg: "Utilizador criado com sucesso!"});

    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

//Fazer o Login
export const login = async (req, res) => {
    res.send("Login route called")
}

//Fazer o logout
export const logout = async (req, res) => {
    res.send("Logout route called")
}