import { stripe } from "../lib/stripe.js";
import Cupao from "../models/cupao.model.js";
import Pedido from "../models/pedidos.model.js";
import User from "../models/user.model.js";

export const criarSessaoCheckout = async (req, res) => {
    try {
        const {produtos, codigoCupao} = req.body;

        if(!Array.isArray(produtos) || produtos.length === 0)
        {
            return res.status(400).json({msg: "Conjunto de produtos vazio ou inválido"});
        }

        let precoTotal = 0;

        const linhaItems = produtos.map((produto) => {
            const precoInicial = Math.round(produto.preco * 100); //Porque o valor é em cêntimos no stripe
            precoTotal += precoInicial * produto.quantidade;


            return {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: produto.nome,
                        images: [produto.imagem],
                    },
                    unit_amount: precoInicial
                },
                quantity: produto.quantidade || 1

            };
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
            billing_address_collection: "required",
            shipping_address_collection: {
                allowed_countries: ["PT"]  
            },
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: cupao ? [{coupon: await criarCupaoStripe(cupao.percentagemDesconto)}] : [],
            metadata: {
                userId: req.user._id.toString(),
                codigoCupao: codigoCupao || "",
                tipoEntrega,
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
        if(precoTotal >= 10000)
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
    await Cupao.findOneAndDelete({userId});
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
        const {sessaoId} = req.body;
        const sessao = await stripe.checkout.sessions.retrieve(sessaoId);
        
        if(sessao.payment_status === "paid")
        {
            if(sessao.metadata.codigoCupao) {
                await Cupao.findOneAndUpdate({
                    codigo: sessao.metadata.codigoCupao, userId: sessao.metadata.userId
                },  {
                        ativo: false
                    })
                }

            const ship = sessao.collected_information?.shipping_details;
            if (!ship) {
                return res.status(400).json({ msg: "Não foi possível ler a morada do cliente." });
            }
            
            const shippingAddress = {
                name:        ship.name,
                line1:       ship.address.line1,
                line2:       ship.address.line2,
                city:        ship.address.city,
                postal_code: ship.address.postal_code,
                country:     ship.address.country
            };

            //Criar um novo pedido
            const produtos = JSON.parse(sessao.metadata.produtos);
            const novoPedido = new Pedido({
                user: sessao.metadata.userId,
                produtos: produtos.map(produto => ({
                    produto: produto.id,
                    quantidade: produto.quantidade,
                    preco: produto.preco
                })),
                tipoEntrega,
                total: sessao.amount_total / 100,
                stripeSessionID: sessaoId,
                shippingAddress
            });

            //Limpar carrinho depois de compra
            const user = await User.findById(sessao.metadata.userId);
            user.itensCarrinho = [];
            await user.save();


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