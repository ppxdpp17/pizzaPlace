import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const isObjectIdLike = (id) => typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

const isLocalItem = (item) => {
  if (!item) return false;
  const id = typeof item === "string" ? item : item._id;
  // local se não for ObjectId-like ou se tiver flag explícita isCustom
  if (item && item.isCustom === true) return true;
  return !isObjectIdLike(id);
};

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
        const itens = res.data;
        const currentLocalItems = get().carrinho.filter(i => isLocalItem(i));
        set({ carrinho: [...itens, ...currentLocalItems] });
        get().calcularTotal();
      } catch (error) {
        // Se falhar, talvez devêssemos manter os locais?
        // Mas se falhar a auth, talvez limpar tudo.
        // Vamos assumir que se falhar, limpamos apenas os do server (que não conseguimos obter)
        // ou limpamos tudo. O código original limpava tudo.
        // Vamos manter o comportamento de limpar tudo por segurança/simplicidade por enquanto,
        // ou melhor, tentar manter os locais se for erro de rede.
        // Mas para seguir o padrão anterior:
        set({ carrinho: [] });
        toast.error(error.response?.data?.msg || "Erro a obter carrinho.");
      }
    },

    //Server-backed add (persistido). Mostra toast de sucesso. Depois de receber a lista do servidor, mescla com itens locais/custom
    adicionarAoCarrinho: async (product, meta = undefined, quantidade = 1) => {
      try {
        // product deve ser o produto do DB (tem _id válido)
        const payload = { productId: product._id, quantidade: Number(quantidade ?? 1) };
        if (meta) payload.meta = meta;

        const res = await axios.post("/carrinho", payload);
        const itens = res.data;
        const currentLocalItems = get().carrinho.filter(i => isLocalItem(i));
        set({ carrinho: [...itens, ...currentLocalItems] });
        get().calcularTotal();
        toast.success("Produto adicionado ao carrinho!");
      } catch (error) {
        console.error("Erro adicionarAoCarrinho:", error);
        toast.error(error.response?.data?.msg || "Ocorreu um erro ao adicionar ao carrinho.");
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
    apagarDoCarrinho: async (cartItemId) => {
      try {
        if (isObjectIdLike(cartItemId)) {
          const res = await axios.delete(`/carrinho/${cartItemId}`);
          const itens = res.data;
          set({ carrinho: itens });
          get().calcularTotal();
        } else {
          // local custom item id -> remover localmente
          set(prev => {
            const newCart = prev.carrinho.filter(i => i._id !== cartItemId);
            return { carrinho: newCart };
          });
          get().calcularTotal();
        }
      } catch (err) {
        toast.error(err.response?.data?.msg || "Erro ao apagar do carrinho");
      }
    },

    //Atualizar quantidade (local or server)
    atualizarQuantidade: async (cartItemId, quantidade) => {
      if (!isObjectIdLike(cartItemId)) {
        // Local item update
        set((prev) => {
          const newCart = prev.carrinho.map((item) =>
            item._id === cartItemId ? { ...item, quantidade } : item
          );
          // Remove if quantity is 0? The UI usually handles this by calling apagarDoCarrinho if qty goes to 0, 
          // but here we just set it. If 0, maybe we should remove? 
          // The UI calls apagarDoCarrinho separately usually, or passes 0. 
          // Let's assume 0 means remove or just set to 0. 
          // However, the UI code does Math.max(0, ...). 
          // If 0, we should probably remove it or let it stay as 0? 
          // Standard behavior: if 0, remove.
          if (quantidade <= 0) {
            return { carrinho: prev.carrinho.filter(i => i._id !== cartItemId) };
          }
          return { carrinho: newCart };
        });
        get().calcularTotal();
        return;
      }

      try {
        const res = await axios.put(`/carrinho/${cartItemId}`, { quantidade });
        const itens = res.data;
        // Merge with local items
        const currentLocalItems = get().carrinho.filter(i => isLocalItem(i));
        set({ carrinho: [...itens, ...currentLocalItems] });
        get().calcularTotal();
      } catch (err) {
        toast.error(err.response?.data?.msg || "Erro ao atualizar quantidade");
      }
    },

    limparCarrinho: async () => {
      try {
        await axios.delete("/carrinho");
        set({ carrinho: [], cupao: null, total: 0, subTotal: 0 });
      } catch (err) {
        console.warn("Falha ao limpar carrinho:", err.message);
        set({ carrinho: [], cupao: null, total: 0, subTotal: 0 });
      }
    },

    getMeuCupao: async () => {
      try {
        const response = await axios.get("/cupoes");
        set({ cupao: response.data });
      } catch (error) {
        console.log("Erro ao utilizar o cupão", error.message);
      }
    },

    aplicarCupao: async (codigo) => {
      try {
        const response = await axios.post("/cupoes/validar", { codigo });
        set({ cupao: response.data, cupaoAplicado: true });
        get().calcularTotal();
        toast.success("Cupão aplicado com sucesso!");
      } catch (error) {
        toast.error(error.response?.data?.msg || "Um erro ocorreu, tente novamente mais tarde.");
      }
    },

    removerCupao: () => {
      set({ cupao: null, cupaoAplicado: false });
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
