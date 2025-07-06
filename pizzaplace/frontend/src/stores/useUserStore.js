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
            set({user: res.data.user, loading: false});
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.msg || "Um erro ocorreu, tente novamente mais tarde.");
        }
    },

    login: async ({email, password}) => {
        set({loading: true});

        if(password !== confirmarPassword)
        {
            set({loading: false});
            return toast.error("As passwords não coincidem.");   
        }

        try {
            const res = await axios.post("/auth/signup", {nome, email, password});
            set({user: res.data.user, loading: false});
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.msg || "Um erro ocorreu, tente novamente mais tarde.");
        }
    },
}))