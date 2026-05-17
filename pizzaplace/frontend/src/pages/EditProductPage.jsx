import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader, Save } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { useProductStore } from "../stores/useProductStore";
import IngredientsSelector from "../components/IngredientsSelector";
import LoadingSpinner from "../components/LoadingSpinner";

const categorias = [
  { value: "pizzas", label: "Pizzas" },
  { value: "bebidas", label: "Bebidas" },
  { value: "entradas", label: "Entradas & Sobremesas" }
];

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { editarProduto } = useProductStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ingredientesList, setIngredientesList] = useState([]);

  const [showIngredientes, setShowIngredientes] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagem: "",
    categoria: "",
    ingredientes: []
  });

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const [prodRes, ingRes] = await Promise.all([
          axios.get(`/produtos/${id}`),
          axios.get("/ingredientes")
        ]);
        if (!mounted) return;
        const produto = prodRes.data;
        setForm({
          nome: produto.nome ?? "",
          descricao: produto.descricao ?? "",
          preco: produto.preco ?? "",
          imagem: produto.imagem ?? "",
          categoria: produto.categoria ?? "",
          //Normaliza ingredientes para array de ids
          ingredientes: (produto.ingredientes || []).map(i => i._id ?? i.id ?? i)
        });
        setIngredientesList(ingRes.data.ingredientes ?? ingRes.data ?? []);
        //Por defeito, se categoria for pizzas mostra selector
        setShowIngredientes((produto.categoria ?? "").toLowerCase() === "pizzas");
      } catch (err) {
        console.error(err);
        toast.error("Falha ao carregar dados do produto.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "categoria") {
      setShowIngredientes(value === "pizzas");
    }
  };

  const gerirMudancaImagem = (e) => {
    const ficheiro = e.target.files?.[0];
    if (!ficheiro) return;
    const leitor = new FileReader();
    leitor.onloadend = () => {
      setForm((s) => ({ ...s, imagem: leitor.result }));
    };
    leitor.readAsDataURL(ficheiro);
  };

  const onIngredientsChange = (ings) => {
    //Aceita array de ids
    setForm(prev => ({ ...prev, ingredientes: ings }));
  };

  //Fallback simpler: checkbox grid (usado apenas se não houver IngredientsSelector)
  const toggleIngrediente = (idIng) => {
    setForm(prev => {
      const exists = prev.ingredientes.includes(idIng);
      return { ...prev, ingredientes: exists ? prev.ingredientes.filter(i => i !== idIng) : [...prev.ingredientes, idIng] };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        descricao: form.descricao,
        preco: Number(form.preco),
        imagem: form.imagem || "",
        categoria: form.categoria,
        ingredientes: Array.isArray(form.ingredientes) ? form.ingredientes : []
      };

      await editarProduto(id, payload);
      toast.success("Produto atualizado!");
      navigate("/dashboard-secreta");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.msg || "Erro ao atualizar produto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat bg-fixed py-12 px-4" style={{ backgroundImage: "url('/piuzz.png')" }}>
      <motion.div
        className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200 rounded-xl p-8 mb-8 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-3 text-center">Editar Produto</h2>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-bold text-gray-700">Nome</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={form.nome}
              onChange={onChange}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-bold text-gray-700">Descrição (opcional)</label>
            <textarea
              id="descricao"
              name="descricao"
              value={form.descricao}
              onChange={onChange}
              rows={3}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoria" className="block text-sm font-bold text-gray-700">Categoria</label>
              <select
                id="categoria"
                name="categoria"
                value={form.categoria}
                onChange={onChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="preco" className="block text-sm font-bold text-gray-700">Preço</label>
              <input
                id="preco"
                name="preco"
                type="number"
                step="0.01"
                value={form.preco}
                onChange={onChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                required
              />
            </div>
          </div>

          {/*Toggle para mostrar selector de ingredientes se for pizzas*/}
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <input
              id="toggle-ings"
              type="checkbox"
              checked={showIngredientes}
              onChange={(e) => setShowIngredientes(e.target.checked)}
              className="h-4 w-4 rounded bg-white border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="toggle-ings" className="text-sm font-medium text-gray-700 cursor-pointer">
              Editar ingredientes deste produto
            </label>
          </div>

          {/*Ingredients selector — usa componente se existir, senão fallback*/}
          {showIngredientes && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <label className="block text-sm font-bold text-gray-700 mb-4">Ingredientes</label>

              {typeof IngredientsSelector === "function" ? (
                <IngredientsSelector
                  value={form.ingredientes}
                  onChange={onIngredientsChange}
                  options={ingredientesList}
                />
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {ingredientesList.map(ing => {
                    const idKey = ing._id ?? ing.id;
                    return (
                      <label key={idKey} className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 p-1.5 rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={form.ingredientes.includes(idKey)}
                          onChange={() => toggleIngrediente(idKey)}
                          className="h-4 w-4 rounded bg-white border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                        <span className="font-medium">{ing.icone ? ing.icone + " " : ""}{ing.nome}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Dica: Se desmarcar tudo, o produto ficará sem ingredientes.</p>
            </div>
          )}

          {/*Upload/preview de imagem*/}
          <div className="flex flex-col items-center pt-2 gap-4">
            <div>
              <input id="imagem-file" type="file" accept="image/*" className="sr-only" onChange={gerirMudancaImagem} />
              <label htmlFor="imagem-file" className="inline-flex items-center gap-2 cursor-pointer bg-white py-2.5 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <Upload className="h-5 w-5" /> Escolher Nova Imagem
              </label>
            </div>

            {form.imagem ? (
              <div className="flex items-center gap-4 bg-gray-50 py-2 px-4 rounded-lg border border-gray-100">
                <div className="text-sm font-medium text-gray-600">Imagem carregada</div>
                <img src={form.imagem} alt="preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200 shadow-sm" />
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-500 bg-gray-50 py-2 px-4 rounded-lg border border-gray-100 italic">Nenhuma imagem definida</div>
            )}
          </div>

          {/*Ações*/}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" /> A guardar...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Guardar Alterações
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-32 py-3 px-4 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold shadow-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProductPage;
