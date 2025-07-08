import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCarrinhoStore = create((set) => ({
    carrinho:[],
    cupao: null,
    total: 0,
    valorCupao: 0,

    getItensCarrinho: async() => {
        try {
            const res = await axios.get("/carrinho");
            set({carrinho: res.data});    
        } catch (error) {
            set({carrinho: []});
            toast.error(error.response.data.msg || "Um erro ocorreu, tente novamente mais tarde.");
        }
    }
}));