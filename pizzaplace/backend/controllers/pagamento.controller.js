import { stripe } from "../lib/stripe.js";
import Cupao from "../models/cupao.model.js";
import Pedido from "../models/pedidos.model.js";

export const criarSessaoCheckout = async (req, res) => {
    try {
        const {produtos, codigoCupao} = req.body;

        if(!Array.isArray(produtos) || !produtos.length === 0)
        {
            return res.status(400).json({msg: "Conjunto de produtos vazio ou inválido"});
        }

        let precoTotal = 0;

        const linhaItems = produtos.map(produto => {
            const precoInicial = Math.round(produto.preco * 100); //Porque o valor é em cêntimos no stripe
            precoTotal += precoInicial * produto.quantidade;

            return {
                dados_preco: {
                    currency: "eur",
                    product_data: {
                        nome: produto.nome,
                        imagens: [produto.imagem],
                    },
                    precoUnitario: precoInicial
                }
            }
        });

        let cupao = null;

        if(codigoCupao)
        {
            cupao = await Cupao.findOne({codigo: codigoCupao, userId: req.user._id, ativo: true });
            if(cupao)
            {
                precoTotal -= Math.round((precoTotal * cupao.percentagemDesconto) / 100);
            }
        }

        const sessao = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: linhaItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/sucesso-compra?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancelar-compra`,
            discounts: cupao ? [{coupon: await criarCupaoStripe(cupao.percentagemDesconto)}] : [],
            metadata: {
                userId: req.user._id.toString(),
                codigoCupao: codigoCupao || "",
                produtos: JSON.stringify(
                    produtos.map((p) => ({
                        id: p._id,
                        quantidade: p.quantidade,
                        preco: p.preco,
                    })
                ))
            }
        });

        //Se ele gastar 100 euros ou + numa só compra, oferecemos um cupão de desconto de 10%
        if(precoTotal >= 100000)
        {
            await criarNovoCupao(req.user._id);
        }

        res.status(200).json({id: sessao.id, precoTotal: precoTotal / 100});

    } catch (error) {  
        console.log("Erro ao criar sessão de checkout", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
     }
}

async function criarCupaoStripe(percentagemDesconto) {
    const cupao = await stripe.coupons.create({
        percent_off: percentagemDesconto,
        duration: "once"
    })

    return cupao.id;
}

async function criarNovoCupao(userId) {
    const novoCupao = new Cupao({
        codigo: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        percentagemDesconto: 10,
        dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //Expira em 30 dias
        userId: userId
    })

    await novoCupao.save();

    return novoCupao;
}

export const sucessoCheckout = async(req, res) => {
    try {
        const {sessaoID} = req.body;
        const sessao = await stripe.checkout.sessions.retrieve(sessaoID);
        
        if(sessao.payment_status === "paid")
        {
            if(sessao.metadata.codigoCupao) {
                await Cupao.findOneAndUpdate({
                    codigo: sessao.metadata.codigoCupao, userId: sessao.metadata.userId
                },  {
                        ativo: false
                    })
                }

            //Criar um novo pedido
            const produtos = JSON.parse(sessao.metadata.produtos);
            const novoPedido = new Pedido({
                user: sessao.metadata.userId,
                produtos: produtos.map(produto => ({
                    produto: produto.id,
                    quantidade: produto.quantidade,
                    preco: produto.preco
                })),
                precoTotal: sessao.amount_total / 100,
                stripeSessionId: sessaoID
            })

            await novoPedido.save();

            res.status(200).json({
                success: true,
                msg: "Pagamento efetuado com sucesso, pedido feito e cupão desativado (se usado)",
                pedidoId: novoPedido._id
            });
        }
    } catch (error) {
        console.log("Erro ao criar pedido", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}