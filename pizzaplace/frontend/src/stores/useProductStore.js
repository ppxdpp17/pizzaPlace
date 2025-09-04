import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
	products: [],
	loading: false,

	setProducts: (products) => set({ products }),
	criarProduto: async (productData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/produtos", productData);
			const novo = res.data && res.data._id ? res.data : res.data.produto ? res.data.produto : res.data;
			set((s) => ({ products: [...s.products, novo], loading: false }));
			return novo;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.msg || "Erro NA CRIAÇÃO de produto");
			throw error;
		}
		},
	getTodosProdutos: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/produtos");
			set({ products: response.data.produtos, loading: false });
		} catch (error) {
			set({ error: "Falha a ir buscar os produtos", loading: false });
			toast.error(error.response.data.error || "Falha a ir buscar os produtos");
		}
	},
	apagarProduto: async (productId) => {
		set({ loading: true });
		try {
			await axios.delete(`/produtos/${productId}`);
			set((prevProducts) => ({
				products: prevProducts.products.filter((product) => product._id !== productId),
				loading: false,
			}))
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Falha ao apagar produto");
		}	
	},
	disponibilizarProduto: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/produtos/${productId}`);
			//Isto vai atualizar a propriedade "estaDisponivel" de um produto
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, estaDisponivel: response.data.estaDisponivel } : product
				),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Falha ao atualizar o produto");
		}
	},
	getProdutosCategoria: async (categoria) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/produtos/categoria/${categoria}`);
			set({ products: response.data.produtos, loading: false });
		} catch (error) {
			set({ error: "Falha a ir buscar os produtos desta categoria", loading: false });
			toast.error(error.response.data.error || "Falha a ir buscar os produtos desta categoria");
		}
	},
	fetchProdutosRecomendados: async () => {
		set ({ loading: true });
		try {
			const response = await axios.get("/produtos/recomendacoes");
			set({ products: response.data, loading: false });
		} catch (error) {
			set ({ error: "Falha a ir buscar os produtos recomendados", loading: false });
			console.log("Erro a ir buscar os produtos recomendados: ", error);
		}
	}
}));