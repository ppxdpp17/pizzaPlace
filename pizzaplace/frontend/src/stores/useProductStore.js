import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  isLoading: false,

  setProducts: (products) => set({ products }),
  
  criarProduto: async (productData) => {
    set({ isLoading: true });
    try {
      const res = await axios.post("/produtos", productData);
      const novo = res.data && res.data._id ? res.data : res.data.produto ? res.data.produto : res.data;
      set((s) => ({ products: [...s.products, novo], isLoading: false }));
      window.dispatchEvent(new Event("produtos:updated"));
      return novo;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.msg || "Erro NA CRIAÇÃO de produto");
      throw error;
    }
  },

  getTodosProdutos: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get("/produtos");
      set({ products: response.data.produtos, isLoading: false });
    } catch (error) {
      set({ error: "Falha a ir buscar os produtos", isLoading: false });
      toast.error(error.response?.data?.error || "Falha a ir buscar os produtos");
    }
  },

  apagarProduto: async (productId) => {
    set({ isLoading: true });
    try {
      await axios.delete(`/produtos/${productId}`);
      set((prev) => ({ products: prev.products.filter((p) => p._id !== productId), isLoading: false }));
      try { window.dispatchEvent(new CustomEvent("produtos:updated")); } catch (e) {}
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.msg || "Falha ao apagar produto");
    }
  },

  disponibilizarProduto: async (productId) => {
    set({ isLoading: true });
    try {
      const response = await axios.patch(`/produtos/${productId}`);
      set((prev) => ({
        products: prev.products.map((p) => (p._id === productId ? response.data : p)),
        isLoading: false,
      }));
      window.dispatchEvent(new Event("produtos:updated"));
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.msg || "Falha ao atualizar o produto");
    }
  },

  getProdutosCategoria: async (categoria) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`/produtos/categoria/${categoria}`);
      const produtos = response.data?.produtos ?? response.data;
      set({ products: Array.isArray(produtos) ? produtos : [], isLoading: false });
    } catch (error) {
      set({ error: "Falha a ir buscar os produtos desta categoria", isLoading: false });
      toast.error(error.response?.data?.msg || "Falha a ir buscar os produtos desta categoria");
    }
  },

  fetchProdutosRecomendados: async ({ size = 6, excludeIds = [] } = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      params.append("size", size);
      if (excludeIds.length) params.append("excludeIds", excludeIds.join(","));
      const response = await axios.get(`/produtos/recomendacoes?${params.toString()}`);
      set({ products: response.data, isLoading: false });
    } catch (error) {
      set({ error: "Falha a ir buscar os produtos recomendados", isLoading: false });
      console.log("Erro a ir buscar os produtos recomendados: ", error);
    }
  },

  editarProduto: async (productId, productData) => {
  set({ isLoading: true });
  try {
    const res = await axios.put(`/produtos/${productId}`, productData);
    const atualizado = res.data;
    set((prev) => ({
      products: prev.products.map(p => p._id === productId ? atualizado : p),
      isLoading: false
    }));
    window.dispatchEvent(new Event("produtos:updated"));
    return atualizado;
  } catch (error) {
    set({ isLoading: false });
    toast.error(error.response?.data?.msg || "Falha ao editar produto");
    throw error;
  }
},

}));
