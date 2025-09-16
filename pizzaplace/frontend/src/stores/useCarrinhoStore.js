import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCarrinhoStore = create((set, get) => {
  // Adicionar listener uma vez, apenas no browser
  if (typeof window !== "undefined") {
    window.addEventListener("produtos:updated", () => {
      // Recarrega o carrinho do servidor (melhor que filtrar localmente)
      get().getItensCarrinho();
    });
  }

  return {
    carrinho: [],
    cupao: null,
    total: 0,
    subTotal: 0,
    cupaoAplicado: false,

    getItensCarrinho: async () => {
      try {
        const res = await axios.get("/carrinho");
        const itens = res.data; // server devolve array de produtos com quantidade
        set({ carrinho: itens });
        get().calcularTotal();
      } catch (error) {
        set({ carrinho: [] });
        toast.error(error.response?.data?.msg || error.response?.data?.message || "Um erro ocorreu, tente novamente mais tarde.");
      }
    },
    adicionarAoCarrinho: async(product) => {
    try {
        const res = await axios.post("/carrinho", { productId: product._id });
        const itens = res.data; // server now returns array populado com quantidade
        set({ carrinho: itens });
        toast.success("Produto adicionado ao carrinho.");
        get().calcularTotal();
    } catch (error) {
        toast.error(error.response?.data?.message || "Ocorreu um erro.");
    }
    },
    calcularTotal: () => {
        const {carrinho, cupao} = get();
        const subTotal = carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
        let total = subTotal;

        if(cupao)
        {
            const desconto = subTotal * (cupao.percentagemDesconto / 100);
            total = subTotal - desconto;
        }

        set({subTotal, total});
    },
    apagarDoCarrinho: async (productId) => {
    try {
        const res = await axios.delete(`/carrinho`, { data: { produtoID: productId } });
        const itens = res.data;
        set({ carrinho: itens });
        get().calcularTotal();
    } catch (err) {
        toast.error(err.response?.data?.msg || "Erro ao apagar do carrinho");
    }
    },
    atualizarQuantidade: async (productId, quantidade) => {
    try {
        const res = await axios.put(`/carrinho/${productId}`, { quantidade });
        const itens = res.data;
        set({ carrinho: itens });
        get().calcularTotal();
    } catch (err) {
        toast.error(err.response?.data?.msg || "Erro ao atualizar quantidade");
    }
    },
    limparCarrinho: async () => {
        set({ carrinho: [], cupao: null, total: 0, subTotal: 0 });
    },
    getMeuCupao: async () => {
        try {
            const response = await axios.get("/cupoes");
            set({cupao: response.data});
        } catch (error) {
            console.log("Erro ao utilizar o cupão", error.message);
        }
    },
    aplicarCupao: async (codigo) => {
        try {
            const response = await axios.post("/cupoes/validar", {codigo});
            set({cupao: response.data, cupaoAplicado: true});
            get().calcularTotal();
            toast.success("Cupão aplicado com sucesso!");
        } catch (error) {
            toast.error(error.response?.data?.msg || "Um erro ocorreu, tente novamente mais tarde.");
        }
    },
    removerCupao: () => {
        set({cupao: null, cupaoAplicado: false});
        get().calcularTotal();
        toast.success("Cupão removido!");
    },
    adicionarAoCarrinhoCustom: (customProduct) => {
        set((prev) => {
            // verifica se já existe item igual (por _id)
            const exists = prev.carrinho.find(item => item._id === customProduct._id);
            const newCart = exists
                ? prev.carrinho.map(item => item._id === customProduct._id ? { ...item, quantidade: (item.quantidade || 1) + 1 } : item)
                : [...prev.carrinho, { ...customProduct, quantidade: customProduct.quantidade ?? 1 }];
        return { carrinho: newCart };
        });
        // recalcula total
        get().calcularTotal();
    },

}
});