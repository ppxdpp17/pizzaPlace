import  { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async ({nome, email, password, confirmarPassword}) => {
        set({loading: true});

        if(password !== confirmarPassword)
        {
            set({loading: false});
            return toast.error("As passwords não coincidem.");   
        }

        try {
            const res = await axios.post("/auth/signup", {nome, email, password});
            set({user: res.data, loading: false});
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.msg || "Um erro ocorreu, tente novamente mais tarde.");
        }
    },
    login: async (email, password) => {
        set({loading: true});

        try {
            const res = await axios.post("/auth/login", {email, password});
            set({user: res.data, loading: false});
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.msg || "Um erro ocorreu, tente novamente mais tarde.");
        }
    },
    logout: async () => {
        try {
            await axios.post("/auth/logout");
            set({user: null});
        } catch (error) {
            toast.error(error.response.data.msg || "Um erro ocorreu, tente novamente mais tarde.");
        }
    },
    verificarAutenticacao: async () => {
        set({checkingAuth: true});
        try {
            const response = await axios.get("/auth/perfil");
            set({user: response.data, checkingAuth: false});
        } catch (error) {
            console.log(error.message);
            set({checkingAuth: false, user: null});
        }
    },
    
}))