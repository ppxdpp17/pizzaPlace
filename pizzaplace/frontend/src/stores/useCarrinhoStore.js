import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const isObjectIdLike = (id) => typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

export const useCarrinhoStore = create((set, get) => {
  if (typeof window !== "undefined") {
    window.addEventListener("produtos:updated", () => {
      get().getItensCarrinho();
    });
  }

  return {
    carrinho: [],
    cupao: null,
    total: 0,
    subTotal: 0,
    cupaoAplicado: false,

    //GET carrinho do server mas fazer merge com qualquer local/custom items 
    getItensCarrinho: async () => {
      try {
        const res = await axios.get("/carrinho");
        const serverItems = Array.isArray(res.data) ? res.data : (res.data.itens || res.data);

        //Preserve local custom items that are not present on server
        const localCustom = get().carrinho.filter(i => !isObjectIdLike(i._id));
        //Avoid duplicates
        const merged = [
          ...serverItems,
          ...localCustom.filter(local => !serverItems.find(si => si._id === local._id))
        ];

        set({ carrinho: merged });
        get().calcularTotal();
      } catch (error) {
        //Fallback: keep local cart as-is but show message
        set({ carrinho: get().carrinho || [] });
        toast.error(error.response?.data?.msg || error.response?.data?.message || "Um erro ocorreu, tente novamente mais tarde.");
      }
    },

    //Server-backed add (persistido). Mostra toast de sucesso. Depois de receber a lista do servidor, mescla com itens locais/custom
    adicionarAoCarrinho: async(product) => {
      try {
        const localCustom = get().carrinho.filter(i => !isObjectIdLike(i._id));

        const res = await axios.post("/carrinho", { productId: product._id });
        const itens = Array.isArray(res.data) ? res.data : (res.data.itens || res.data);

        const merged = [
          ...itens,
          ...localCustom.filter(local => !itens.find(si => si._id === local._id))
        ];

        set({ carrinho: merged });
        get().calcularTotal();
        toast.success("Produto adicionado ao carrinho!");
      } catch (error) {
        toast.error(error.response?.data?.message || "Ocorreu um erro.");
      }
    },

    //Versão local/custom: adiciona produto com tamanho ao carrinho localmente
    adicionarAoCarrinhoComTamanho: (product, tamanho = "media") => {
      const PRICE_MULTIPLIERS = {
        pequena: 1.0,
        media: 1.2,
        grande: 1.4
      };

      const multiplier = PRICE_MULTIPLIERS[tamanho] ?? 1.0;
      const precoBase = typeof product.preco === "number" ? product.preco : Number(product.preco) || 0;
      const precoAjustado = Number((precoBase * multiplier).toFixed(2));

      const customId = `${product._id}_t_${tamanho}_${Date.now()}`;

      const itemParaAdicionar = {
        ...product,
        _id: customId,
        quantidade: 1,
        preco: precoAjustado,
        meta: {
          ...(product.meta || {}),
          tamanho
        },
        nome: `${product.nome} (${tamanho === "pequena" ? "Peq." : tamanho === "media" ? "Méd." : "Grd."})`
      };

      set((prev) => {
        const exists = prev.carrinho.find(i => i._id === itemParaAdicionar._id);
        const newCart = exists
          ? prev.carrinho.map(i => i._id === itemParaAdicionar._id ? { ...i, quantidade: (i.quantidade || 1) + 1 } : i)
          : [...prev.carrinho, itemParaAdicionar];

        return { carrinho: newCart };
      });

      get().calcularTotal();
      toast.success("Produto adicionado ao carrinho!");
    },

    calcularTotal: () => {
      const { carrinho, cupao } = get();

      //Soma em cêntimos inteiros
      const subTotalCents = carrinho.reduce((sum, item) => {
        const precoNum = typeof item.preco === "number" ? item.preco : Number(item.preco) || 0;
        const precoCents = Math.round(precoNum * 100);
        return sum + precoCents * (item.quantidade || 1);
      }, 0);

      let totalCents = subTotalCents;

      if (cupao) {
        const descontoCents = Math.round(subTotalCents * (cupao.percentagemDesconto / 100));
        totalCents = subTotalCents - descontoCents;
      }

      //Gravar como euros (float com 2 decimais exatas)
      const subTotal = subTotalCents / 100;
      const total = totalCents / 100;

      set({ subTotal, total });
    },


    //Apagar item do carrinho.
    apagarDoCarrinho: async (productId) => {
      try {
        if (!isObjectIdLike(productId)) {
          set((prev) => ({ carrinho: prev.carrinho.filter(i => i._id !== productId) }));
          get().calcularTotal();
          return;
        }

        const res = await axios.delete(`/carrinho`, { data: { produtoID: productId } });
        const itens = Array.isArray(res.data) ? res.data : (res.data.itens || res.data);

        const localCustom = get().carrinho.filter(i => !isObjectIdLike(i._id));
        const merged = [
          ...itens,
          ...localCustom.filter(local => !itens.find(si => si._id === local._id))
        ];

        set({ carrinho: merged });
        get().calcularTotal();
      } catch (err) {
        toast.error(err.response?.data?.msg || "Erro ao apagar do carrinho");
      }
    },

    //Atualizar quantidade (local or server)
    atualizarQuantidade: async (productId, quantidade) => {
      try {
        if (!isObjectIdLike(productId)) {
          //Local item -> update locally
          set((prev) => ({
            carrinho: prev.carrinho.map(i => i._id === productId ? { ...i, quantidade: Math.max(1, quantidade) } : i)
          }));
          get().calcularTotal();
          return;
        }

        const res = await axios.put(`/carrinho/${productId}`, { quantidade });
        const itens = Array.isArray(res.data) ? res.data : (res.data.itens || res.data);

        const localCustom = get().carrinho.filter(i => !isObjectIdLike(i._id));
        const merged = [
          ...itens,
          ...localCustom.filter(local => !itens.find(si => si._id === local._id))
        ];

        set({ carrinho: merged });
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
        const exists = prev.carrinho.find(item => item._id === customProduct._id);
        const newCart = exists
            ? prev.carrinho.map(item => item._id === customProduct._id ? { ...item, quantidade: (item.quantidade || 1) + 1 } : item)
            : [...prev.carrinho, { ...customProduct, quantidade: customProduct.quantidade ?? 1 }];
        return { carrinho: newCart };
      });
      get().calcularTotal();
    },

  }
});
