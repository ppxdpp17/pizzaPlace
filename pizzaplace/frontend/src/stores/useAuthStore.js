import { create } from "zustand";
import axios from "axios";

const API_URL = "/api/auth";


axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,

	signup: async (email, password, nome) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/signup`, { email, password, nome });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
		} catch (error) {
			console.error("Resposta completa do erro:", error.response);
			console.error("Mensagem do servidor:", error.response?.data);
			set({ error: error.response?.data?.msg || error.response?.data?.message || "Ocorreu um erro a criar a conta!", isLoading: false });
			throw error;
		}
	},
	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/login`, { email, password });
			set({
				isAuthenticated: true,
				user: {
					_id: response.data._id,
					nome: response.data.nome,
					email: response.data.email,
					cargo: response.data.cargo,
				},
				error: null,
				isLoading: false,
			});
		} catch (error) {
			set({ error: error.response?.data?.message || "Credenciais inválidas!", isLoading: false });
			throw error;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
		} catch (error) {
			set({ error: "Erro ao sair", isLoading: false });
			throw error;
		}
	},
	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/verificar-email`, { code });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response.data.message || "Erro ao verificar email!", isLoading: false });
			throw error;
		}
	},
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
		} catch (error) {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false });
		}
	},
	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/esqueceu-password`, { email });
			set({ message: response.data?.msg || response.data?.message || null, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.msg || error.response?.data?.message || "Erro no envio do email de redefinição de password",
			});
			throw error;
		}
	},
	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data?.msg || response.data?.message || null, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.msg || error.response?.data?.message || "Erro ao redifinir a password",
			});
			throw error;
		}
	},
}));