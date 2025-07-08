import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCarrinhoStore = create((set, get) => ({
    carrinho:[],
    cupao: null,
    total: 0,
    subTotal: 0,

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
    }
}));