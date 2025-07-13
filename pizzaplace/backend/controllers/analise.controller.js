import Produto from "../models/produto.model.js";
import User from "../models/user.model.js";
import Pedidos from "../models/pedidos.model.js";

export const getDadosAnalise = async () => {
    const totalUsers = await User.countDocuments();
    const totalProdutos = await Produto.countDocuments();

    const dadosVendas = await Pedidos.aggregate([{
        $group: {
            _id: null,  //Agrupa todos os documents
            totalVendas: {$sum: 1},
            lucroTotal: {$sum: "$total"}
        }
    }]);

    const {totalVendas, lucroTotal} = dadosVendas[0] || {totalVendas: 0, lucroTotal: 0};

    return {
        users: totalUsers,
        produtos: totalProdutos,
        totalVendas,
        lucroTotal
    }

}

function getDatasPeriodo(dataInicio, dataFim) {
    const datas = [];
    let dataAtual = new Date(dataInicio);

    while(dataAtual <= dataFim) {
        datas.push(dataAtual.toISOString().split("T")[0]);
        dataAtual.setDate(dataAtual.getDate() + 1);
    }

    return datas
}

export const getDadosVendasDiarias = async (dataInicio, dataFim) => {
    try {
        const dadosVendasDiarias = await Pedidos.aggregate([{
        $match: {
            createdAt: {
                $gte: dataInicio,
                $lte: dataFim},
            },
        },
        {
        $group: {
            _id: {$dateToString: {format: "%d-%m-%Y", date: "$createdAt"}},
            totalVendas: {$sum: 1},
            lucroTotal: {$sum: "$precoTotal"}
        },
    },
    {
        $sort: { _id: 1},
    },
    ]);

    //Exemplo do "dadosVendasDiarias"
    /* {
        _id: "04-07-2025",
        totalVendas: 3,
        lucroTotal: 100
    } */

    const arrayDatas = getDatasPeriodo(dataInicio, dataFim);
    //console.log(arrayDatas); //['04-07-2025', '05-07-2025'...] durante 7 dias

    return arrayDatas.map(data => {
        const dadosEncontrados = dadosVendasDiarias.find(venda => venda._id === data);

        return {
            data,
            venda: dadosEncontrados?.totalVendas || 0,
            lucro: dadosEncontrados?.lucroTotal || 0
        }
    })
    } catch (error) {
         throw error;  
    }
}



