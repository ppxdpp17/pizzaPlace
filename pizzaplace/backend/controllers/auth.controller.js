import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {sendVerificationEmail, enviarEmailWelcome, enviarPasswordResetEmail, enviarEmailResetSucesso } from "../lib/emails.js";



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
  const { nome, email, password } = req.body;

  //Validação de campos
  if (!nome || !email || !password) {
    return res.status(400).json({ msg: "Nome, email e password são obrigatórios." });
  }

  try {
    //Verifica se user já existe
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: "O utilizador já existe." });
    }

    //Gerar token de verificação
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; //24h



    //Cria o user (pre-save do schema vai hashar a password)
    const user = await User.create({
      nome,
      email,
      password: password.toString(),            //forçar string
      verificationToken,
      verificationTokenExpire
    });

    //Gerar tokens JWT e cookies
    const { tokenAcesso, tokenRefresh } = gerarTokens(user._id);
    await guardarTokenRefresh(user._id, tokenRefresh);
    setCookies(res, tokenAcesso, tokenRefresh);

    await sendVerificationEmail(user.email, verificationToken);
    //Retornar o user sem password
    return res.status(201).json({
      user: {
        _id: user._id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo
      }
    });

  } catch (error) {
    console.error("Erro no controller de signup", error);
    return res.status(500).json({ msg: error.message });
  }
};

//Função para verificar o email
export const verificarEmail = async (req, res) => {
    const { code } = req.body;
    
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpire: { $gt: Date.now() }
        });

        if(!user)
        {
            return res.status(400).json({success: false, msg: "Código de verificação inválido."});
        }

        user.verificado = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;

        await user.save();

        const { tokenAcesso, tokenRefresh } = gerarTokens(user._id);
        await guardarTokenRefresh(user._id, tokenRefresh);
        setCookies(res, tokenAcesso, tokenRefresh);

        await enviarEmailWelcome(user.email, user.nome);

        res.status(200).json({success: true, msg: "Email verificado com sucesso!", user: {...user._doc, password: undefined}});
    } catch (error) {
        console.log("Erro na funcao verificarEmail", error);
        res.status(500).json({success:false, message: "Erro no Servidor"});   
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

export const esqueceuPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
          console.log("esqueceuPassword: pedido sem email");
          return res.status(400).json({ success: false, msg: "Email é obrigatório." });
        }

        const emailNormalized = String(email).toLowerCase().trim();
        console.log("esqueceuPassword: pedido para:", emailNormalized);

        const user = await User.findOne({ email: emailNormalized });

        // Resposta genérica para evitar enumeração de emails
        if (!user) {
            console.log("esqueceuPassword: email não encontrado:", emailNormalized);
            return res.status(200).json({ success: true, msg: "Se esse email existir no nosso sistema, enviámos um link." });
        }

        // Gerar token e expiry (guardar como Date)
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1h

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = resetTokenExpiresAt;
        await user.save();

        console.log("esqueceuPassword: token gerado para userId=", user._id, "token=", resetToken);

        try {
          await enviarPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
          console.log("esqueceuPassword: email enviado para", user.email);
        } catch (sendErr) {
          console.error("esqueceuPassword: erro ao enviar email:", sendErr);
          // Não devolver erro para o cliente (mantemos a resposta genérica)
        }

        return res.status(200).json({ success: true, msg: "Se esse email existir no nosso sistema, enviámos um link." });

    } catch (error) {
        console.log("Erro ao esquecer password", error);
        return res.status(500).json({ success: false, msg: "Erro no servidor" });
    }
}


export const reporPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        //Procurar user com token válido (token em claro, expiry > now)
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpire: { $gt: new Date() } });

        if (!user) {
            return res.status(400).json({ success: false, msg: "Token não válido ou expirado." });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        //Enviar email de confirmação
        await enviarEmailResetSucesso(user.email);

        return res.status(200).json({ success: true, msg: "Password atualizada com sucesso!" });
    } catch (error) {
        console.log("Erro ao repor password", error);
        return res.status(500).json({ success: false, msg: "Erro no servidor" });
    }
};