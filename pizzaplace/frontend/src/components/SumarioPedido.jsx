import { motion } from "framer-motion";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";
import axios from "../lib/axios";
import TipoEntrega from "./TipoEntrega";
import { useState, useEffect } from "react";
import MoradaForm from "./MoradaForm";
import { toast } from "react-hot-toast";

const SumarioPedido = () => {

    const { total, subTotal, cupao, cupaoAplicado, carrinho, limparCarrinho } = useCarrinhoStore();
    const poupancas = subTotal - total;
    const subtotalFormatado = subTotal.toFixed(2);
    const totalFormatado = total.toFixed(2);
    const poupancasFormatado = poupancas.toFixed(2);

    // Estado dos Modais
    const [modalOpen, setModalOpen] = useState(false);
    const abrirModal = () => setModalOpen(true);
    const fecharModal = () => setModalOpen(false);

    // Estados para o fluxo de Dinheiro
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [pendingCash, setPendingCash] = useState(null);

    const navigate = useNavigate();

    // Validação do carrinho ao montar (para remover itens inválidos/sem stock)
    useEffect(() => {
        const validateCart = async () => {
            if (carrinho.length === 0) return;
            try {
                const res = await axios.get("/carrinho/validate");
                if (!res.data.valid) {
                    const invalidItems = res.data.invalidItems || [];
                    if (invalidItems.length > 0) {
                        for (const item of invalidItems) {
                            const idToRemove = item._id || item.produto;
                            await useCarrinhoStore.getState().apagarDoCarrinho(idToRemove);
                        }
                        toast.error("Alguns produtos já não estão disponíveis e foram removidos.", { duration: 5000 });
                        // Atualizar estado local
                        useCarrinhoStore.getState().getItensCarrinho();
                    }
                }
            } catch (err) {
                console.error("Erro ao validar carrinho", err);
            }
        };
        validateCart();
    }, [carrinho.length]);

    // Handler principal quando o utilizador escolhe o método no modal TipoEntrega
    const handleSelectEntrega = async ({ tipoEntrega, paymentMethod, pedidoLocation }) => {
        fecharModal();

        // CASO 1: PAGAMENTO COM CARTÃO (STRIPE)
        // Aceitamos "cartao" (vindo do botão) ou "stripe"
        if (paymentMethod === "cartao" || paymentMethod === "stripe") {
            try {
                const res = await axios.post("/pagamentos/criar-sessao-checkout", {
                    produtos: carrinho,
                    codigoCupao: cupao?.codigo || "",
                    tipoEntrega,
                    pedidoLocation,
                    // Nota: Não enviamos shippingAddress aqui porque o Stripe
                    // vai pedi-lo na página de checkout segura deles.
                });

                const { url } = res.data;
                if (url) {
                    window.location.href = url; // Redireciona para o Stripe
                } else {
                    toast.error("Erro: Não foi possível iniciar o pagamento.");
                }
            } catch (err) {
                console.error(err);
                if (err.response?.data?.code === "INVALID_PRODUCT") {
                    toast.error("O carrinho contém produtos inválidos. Por favor limpe o carrinho.");
                } else {
                    toast.error("Erro ao conectar com o serviço de pagamento.");
                }
            }
            return;
        }

        // CASO 2: PAGAMENTO EM DINHEIRO
        if (paymentMethod === "dinheiro") {
            // Se for Entrega ao Domicílio, precisamos de pedir a morada agora
            if (tipoEntrega === "delivery") {
                setPendingCash({ tipoEntrega, pedidoLocation, paymentMethod });
                setShowAddressForm(true);
            } else {
                // Se for Takeaway, não precisa de morada
                processarPagamentoDinheiro({ tipoEntrega, pedidoLocation, shippingAddress: null });
            }
        }
    };

    // Callback do formulário de morada (apenas para dinheiro)
    const handleAddressSubmit = async (shippingAddress) => {
        setShowAddressForm(false);
        if (pendingCash) {
            await processarPagamentoDinheiro({
                ...pendingCash,
                shippingAddress
            });
        }
    };

    // Função final para enviar pedido em dinheiro ao backend
    const processarPagamentoDinheiro = async ({ tipoEntrega, pedidoLocation, shippingAddress }) => {
        try {
            await axios.post("/pagamentos/dinheiro", {
                produtos: carrinho,
                tipoEntrega,
                pedidoLocation,
                shippingAddress
            });
            limparCarrinho();
            navigate("/purchase-success?method=dinheiro");
        } catch (err) {
            console.error("Erro pagamento dinheiro:", err);
            toast.error(err.response?.data?.msg || "Erro ao processar pagamento.");
        }
    };

    return (
        <motion.div
            className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <p className="text-xl font-semibold text-emerald-400">Resumo do Pedido:</p>
            <div className="space-y-4">
                <div className="space-y-2">
                    <dl className="flex items-center justify-between gap-4">
                        <dt className="text-base font-normal text-gray-300">Preço Original</dt>
                        <dd className="text-base font-medium text-white">€{subtotalFormatado}</dd>
                    </dl>

                    {poupancas > 0 && (
                        <dl className="flex items-center justify-between gap-4">
                            <dt className="text-base font-normal text-gray-300">Poupou</dt>
                            <dd className="text-base font-medium text-white">-€{poupancasFormatado}</dd>
                        </dl>
                    )}

                    {cupao && cupaoAplicado && (
                        <dl className="flex items-center justify-between gap-4">
                            <dt className="text-base font-normal text-gray-300">Cupão ({cupao.codigo})</dt>
                            <dd className="text-base font-medium text-white">-{cupao.percentagemDesconto}%</dd>
                        </dl>
                    )}

                    <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
                        <dt className="text-base font-normal text-white">Total</dt>
                        <dd className="text-base font-medium text-emerald-400">€{totalFormatado}</dd>
                    </dl>
                </div>

                <motion.button
                    className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium
                    text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={abrirModal}
                    disabled={carrinho.length === 0}
                >
                    Continuar para o Checkout
                </motion.button>

                <TipoEntrega
                    isOpen={modalOpen}
                    onClose={fecharModal}
                    onSelect={handleSelectEntrega}
                />

                {showAddressForm && (
                    <MoradaForm
                        isOpen={showAddressForm}
                        onCancel={() => setShowAddressForm(false)}
                        onSubmit={handleAddressSubmit}
                    />
                )}

                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-normal text-gray-400">ou</span>
                    <Link to='/' className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400
                        underline hover:text-emerald-300 hover:no-underline">
                        Continuar a comprar
                        <MoveRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default SumarioPedido;