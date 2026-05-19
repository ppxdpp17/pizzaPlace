import { Minus, Plus, Trash } from "lucide-react";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";

const sizeLabelShort = (size) => {
  if (!size) return "";
  const s = size.toLowerCase();
  if (s === "pequena" || s === "small") return "Peq.";
  if (s === "media" || s === "medium") return "Méd.";
  if (s === "grande" || s === "large") return "Grd.";
  return size;
};

const safeNomeSemTamanho = (nome = "") => {
  // Remove qualquer sufixo (Xxx) no final — só para normalizar se necessário
  return String(nome).trim();
};

const ImagemCollageSmall = ({ imagens = [] }) => {
  const count = imagens.length;
  if (count === 0) {
    return (
      <div className="w-20 h-20 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-sm text-gray-500">
        Sem img
      </div>
    );
  }
  if (count === 1) {
    return <img src={imagens[0]} alt="produto" className="w-20 h-20 rounded object-cover" />;
  }
  if (count === 2) {
    return (
      <div className="w-20 h-20 grid grid-cols-2 gap-1">
        <img src={imagens[0]} alt="" className="w-full h-full object-cover rounded-l-md" />
        <img src={imagens[1]} alt="" className="w-full h-full object-cover rounded-r-md" />
      </div>
    );
  }
  const extra = count - 3;
  return (
    <div className="w-20 h-20 grid grid-cols-2 grid-rows-2 gap-1">
      <img src={imagens[0]} alt="" className="object-cover w-full h-full rounded-tl-md" />
      <img src={imagens[1]} alt="" className="object-cover w-full h-full rounded-tr-md" />
      <img src={imagens[2]} alt="" className="object-cover w-full h-full rounded-bl-md" />
      <div className="relative w-full h-full rounded-br-md overflow-hidden">
        <img src={imagens[3] ?? imagens[0]} alt="" className="object-cover w-full h-full" />
        {extra > 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
            +{extra}
          </div>
        )}
      </div>
    </div>
  );
};


const CarrinhoItem = ({ item }) => {
  const { apagarDoCarrinho, atualizarQuantidade } = useCarrinhoStore();

  // Determinar tamanho (procura em meta.tamanho ou campo direto tamanho)
  const tamanho = item?.meta?.tamanho ?? item?.tamanho ?? null;
  const tamanhoShort = tamanho ? sizeLabelShort(tamanho) : null;

  // Evita duplicar se o nome já contém um parêntesis com abreviação parecido
  const nomeBase = safeNomeSemTamanho(item.nome ?? item.nomeOriginal ?? "Produto");
  const nomeTemTamanho = /\((Peq\.|Méd\.|Grd\.|Pequena|Média|Grande|Grd)\)$/i.test(nomeBase);
  const displayNome = tamanho && !nomeTemTamanho
    ? `${nomeBase} (${tamanhoShort})`
    : nomeBase;

  // Imagem: preferir item.imagem, senão mix, senão placeholder
  const imagemSrc = item.imagem || (item.meta?.tipo === "mix-2" ? "/pizza2mix2.png" : "/placeholder.png");

  // Formatar preço com duas casas decimais
  const precoNum = typeof item.preco === "number" ? item.preco : Number(item.preco) || 0;
  const precoDisplay = precoNum.toFixed(2);

  // Ingredientes: lidar com strings / objects
  const ingredientesTexto = Array.isArray(item.ingredientes)
    ? item.ingredientes
      .map(i => (typeof i === "string" ? i : `${i.icone ? i.icone + " " : ""}${i.nome ?? ""}`.trim()))
      .filter(Boolean)
      .join(", ")
    : "";

  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-md bg-white/95 hover:shadow-lg transition-shadow backdrop-blur-sm md:p-6">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        <div className="shrink-0 md:order-1">
          {item.imagens && item.imagens.length ? (
            <ImagemCollageSmall imagens={item.imagens} />
          ) : item.imagem ? (
            <img className="h-20 md:h-32 rounded object-cover" src={item.imagem} alt={item.nome} />
          ) : item.meta?.tipo === 'mix-2' ? (
            <img className="h-20 md:h-32 rounded object-cover" src="/pizza2mix2.png" alt="Mix 2 Pizzas" />
          ) : (
            <img className="h-20 md:h-32 rounded object-cover" src="/placeholder.png" alt="Produto" />
          )}
        </div>

        <label className="sr-only">Escolher a quantidade:</label>

        <div className="flex items-center justify-between md:order-3 md:justify-end">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border
                        border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors hover:bg-gray-100"
              onClick={() => atualizarQuantidade(item._id, Math.max(0, (item.quantidade || 1) - 1))}
            >
              <Minus className="text-gray-600 w-4 h-4" />
            </button>
            <p className="px-3 font-semibold text-gray-800">{item.quantidade ?? 1}</p>
            <button
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border
                            border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors hover:bg-gray-100"
              onClick={() => atualizarQuantidade(item._id, (item.quantidade || 1) + 1)}
            >
              <Plus className="text-gray-600 w-4 h-4" />
            </button>
          </div>

          <div className="text-end md:order-4 md:w-32">
            <p className="text-base font-bold text-red-600">€{precoDisplay}</p>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
          <p className="text-base font-bold text-gray-900 hover:text-red-500 hover:underline">
            {displayNome}
          </p>

          {ingredientesTexto ? (
            <p className="text-sm text-gray-500">{ingredientesTexto}</p>
          ) : null}

          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center text-sm font-medium text-red-500 hover:text-red-600 hover:underline transition-colors"
              onClick={() => apagarDoCarrinho(item._id)}
            >
              <Trash className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarrinhoItem;
