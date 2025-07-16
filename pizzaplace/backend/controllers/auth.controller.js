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
        }});

    } catch (error) {
        console.log("Erro no controller de signup", error.message);
        res.status(500).json({msg: error.message});
    }
}

//Fazer o Login (semelhante ao signup - gerar cookies)
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(user && (await user.comparePassword(password)))
        {
            const {tokenAcesso, tokenRefresh} = gerarTokens(user._id);
            await guardarTokenRefresh(user._id, tokenRefresh);
            setCookies(res, tokenAcesso, tokenRefresh);

            res.json({
                _id: user._id,
                nome: user.nome,
                email: user.email,
                cargo: user.cargo
            })
        }
        else
        {
            res.status(400).json({msg: "Credenciais inválidas."});
        }
    } catch (error) {
        console.log("Erro no controller de login", error.message);
        res.status(500).json({msg: error.message});
    }
}

//Fazer o logout (limpar os cookies)
export const logout = async (req, res) => {
    try {
        const tokenRefresh = req.cookies.tokenRefresh;
        if(tokenRefresh)
        {
            const decoded = jwt.verify(tokenRefresh, process.env.REFRESH_TOKEN_ACCESS);
            await redis.del(`refresh_token:${decoded.userId}`);
        }

        res.clearCookie("tokenAcesso");
        res.clearCookie("tokenRefresh");
        res.json({message: "Logout realizado com sucesso!"});
    } catch (error) {
        console.log("Erro no controller de logout", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}


//Fazer refresh ao token de acesso
export const tokenRefresh = async (req, res) => {
    try {
        const tokenRefresh = req.cookies.tokenRefresh;

        if(!tokenRefresh)
        {
            return res.status(401).json({msg: "Token de refresh não foi fornecido."});
        }

        const decoded = jwt.verify(tokenRefresh, process.env.REFRESH_TOKEN_ACCESS);
        const tokenGuardado = await redis.get(`refresh_token:${decoded.userId}`);

        if(tokenGuardado !== tokenRefresh)
        {
            return res.status(401).json({msg: "Token de refresh inválido."});
        }

        const tokenAcesso = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m",});
        
        res.cookie("tokenAcesso", tokenAcesso, {
            //Opções de segurança dos cookies
            httpOnly: true, //Previne ataques XSS
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", //Previne ataques CSRF
            maxAge: 15 * 60 * 1000, //Expira em 15min
        })

        res.json({message: "Token de refresh atualizado com sucesso!"});
        
    } catch (error) {
        console.log("Error no controller de refresh Token", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}


//Parte do perfil do user
export const getPerfil = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
} 
