import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const tokenAcesso = req.cookies.tokenAcesso;
        if(!tokenAcesso)
        {
            return res.status(401).json({msg: "Nao autorizado - token de acesso não fornecido."});
        }
        
        try {
            const decoded = jwt.verify(tokenAcesso, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select("-password");

            if(!user)
            {
                return res.status(401).json({msg: "Utilizador não encontrado."});
            }

            req.user = user;
            next();
        } catch (error) {
            if(error.name === "TokenExpiredError")
            {
                return res.status(401).json({msg: "Nao autorizado - token de acesso expirado."});
            }
            throw error;
        }
    }
    catch (error) {
        console.log("Erro no middleware de proteção", error.message);
        return res.status(401).json({msg: "Nao autorizado - token de acesso inválido."});
    }
}

export const adminRoute = (req, res, next) => {
    if(req.user && req.user.cargo === "admin")
    {
        next();
    }
    else
    {
        return res.status(403).json({msg: "Nao autorizado - acesso negado."});
    }
}