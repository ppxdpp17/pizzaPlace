import  { motion } from "framer-motion"
import { useCarrinhoStore } from "../stores/useCarrinhoStore"
import { Link, useNavigate } from "react-router-dom"
import { MoveRight } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import TipoEntrega from "./TipoEntrega";
import { useState } from "react";
import MoradaForm from "./MoradaForm";

const stripePromise = loadStripe("pk_test_51RhA5gPaffH1WIPMMjsLlLdSSDrJ5MRtISziKg7BHOZZSlZhVl2KywHaco90UMR4QXD8fXFcNT5eeUbL70JlhhDF005veqHo7y");

const SumarioPedido = () => {
    
    const { total, subTotal, cupao, cupaoAplicado, carrinho, limparCarrinho } = useCarrinhoStore();
    const poupancas = subTotal - total;
    const subtotalFormatado = subTotal.toFixed(2); 
    const totalFormatado = total.toFixed(2);
    const poupancasFormatado = poupancas.toFixed(2);

    const [modalOpen, setModalOpen] = useState(false);
    const abrirModal = () => setModalOpen(true);
    const fecharModal = () => setModalOpen(false);

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [pendingCash, setPendingCash] = useState(null);

    const navigate = useNavigate();


    const handleSelectEntrega = async ({ tipoEntrega, paymentMethod }) => {
        fecharModal();

        if(paymentMethod === "dinheiro") {
            setPendingCash({ tipoEntrega });
            setShowAddressForm(true);
            return;
        }

        //Pagaemento com cartão: fluxo Stripe normal
        const stripe = await stripePromise;
        const { id: sessionId } = (await axios.post("/pagamentos/criar-sessao-checkout", {
            produtos: carrinho,
            codigoCupao: cupao?.codigo || "",
            tipoEntrega,
            paymentMethod: "cartao"
        })).data;

        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) console.error(error);
    };

    const handleAddressSubmit = async (shippingAddress) => {
        setShowAddressForm(false);
        const { tipoEntrega } = pendingCash;
        await axios.post("/pagamentos/dinheiro", {
            produtos: carrinho,
            tipoEntrega,
            shippingAddress
        });
        limparCarrinho();
        navigate("/purchase-success?method=dinheiro");
    };

    return (
    <motion.div className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
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
                <motion.button className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium
                    text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={abrirModal}
                    >
                        Continuar para o Checkout
                </motion.button>
                <TipoEntrega
                    isOpen   = {modalOpen}
                    onClose  = {fecharModal}
                    onSelect = {handleSelectEntrega}
                />
                {showAddressForm && (
                    <MoradaForm
                        isOpen   = {showAddressForm}
                        onCancel = {() => setShowAddressForm(false)}
                        onSubmit = {handleAddressSubmit}
                    />
                    )}
                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-normal text-gray-400">ou</span>
                    <Link to='/' className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400*
                        underline hover:text-emerald-300 hover:no-underline">
                            Continuar a comprar
                            <MoveRight size={16} />
                    </Link>
                </div>
            </div>
    </motion.div>
  )
}

export default SumarioPedido