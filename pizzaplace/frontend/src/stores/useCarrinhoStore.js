import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCarrinhoStore = create((set, get) => ({
    carrinho:[],
    cupao: null,
    total: 0,
    subTotal: 0,
    cupaoAplicado: false,
    

    getItensCarrinho: async() => {
        try {
            const res = await axios.get("/carrinho");
            set({carrinho: res.data});    
            get().calcularTotal();
        } catch (error) {
            set({carrinho: []});
            toast.error(error.response.data.msg || "Um erro ocorreu, tente novamente mais tarde.");
        }
    },
    adicionarAoCarrinho: async(product) => {
        try {
			await axios.post("/carrinho", { productId: product._id });
			toast.success("Produto adicionado ao carrinho.");
			set((prevState) => {
				const existingItem = prevState.carrinho.find((item) => item._id === product._id);
				const newCart = existingItem
					? prevState.carrinho.map((item) =>
							item._id === product._id ? { ...item, quantidade: item.quantidade + 1 } : item
					  )
					: [...prevState.carrinho, { ...product, quantidade: 1 }];
				return { carrinho: newCart };
			});
			get().calcularTotal();
		} catch (error) {
			toast.error(error.response.data.message || "Ocorreu um erro.");
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
        await axios.delete(`/carrinho`, {data: { productId }});
        set((prevState) => ({ carrinho: prevState.carrinho.filter(item => item._id !== productId) }));
        get().calcularTotal();
    },
    atualizarQuantidade: async (productId, quantidade) => {
        if(quantidade === 0) 
        {
            get().apagarDoCarrinho(productId);
            return
        }
        
        await axios.put(`/carrinho/${productId}`, { quantidade });
        set((prevState) => ({
            carrinho: prevState.carrinho.map((item) => (item._id === productId ? { ...item, quantidade } : item)),
        }));
        get().calcularTotal();
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
    }
}));