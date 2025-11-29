import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader, Save } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { useProductStore } from "../stores/useProductStore";
import IngredientsSelector from "../components/IngredientsSelector";

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-300">A carregar produto...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-3xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-emerald-300">Editar Produto</h2>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-300">Nome</label>
          <input
            id="nome"
            name="nome"
            type="text"
            value={form.nome}
            onChange={onChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-300">Descrição (opcional)</label>
          <textarea
            id="descricao"
            name="descricao"
            value={form.descricao}
            onChange={onChange}
            rows={3}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-300">Categoria</label>
            <select
              id="categoria"
              name="categoria"
              value={form.categoria}
              onChange={onChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="preco" className="block text-sm font-medium text-gray-300">Preço</label>
            <input
              id="preco"
              name="preco"
              type="number"
              step="0.01"
              value={form.preco}
              onChange={onChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/*Toggle para mostrar selector de ingredientes se for pizzas*/}
        <div className="flex items-center gap-3">
          <input
            id="toggle-ings"
            type="checkbox"
            checked={showIngredientes}
            onChange={(e) => setShowIngredientes(e.target.checked)}
            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-emerald-500 focus:ring-emerald-400"
          />
          <label htmlFor="toggle-ings" className="text-sm text-gray-300">
            Editar ingredientes deste produto
          </label>
        </div>

        {/*Ingredients selector — usa componente se existir, senão fallback*/}
        {showIngredientes && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ingredientes (opcional)</label>

            {typeof IngredientsSelector === "function" ? (
              <IngredientsSelector
                value={form.ingredientes}
                onChange={onIngredientsChange}
                options={ingredientesList}
              />
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-900 rounded">
                {ingredientesList.map(ing => {
                  const idKey = ing._id ?? ing.id;
                  return (
                    <label key={idKey} className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={form.ingredientes.includes(idKey)}
                        onChange={() => toggleIngrediente(idKey)}
                        className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-emerald-500"
                      />
                      <span>{ing.icone ? ing.icone + " " : ""}{ing.nome}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Se ficar vazio, o produto ficará sem ingredientes.</p>
          </div>
        )}

        {/*Upload/preview de imagem*/}
        <div className="flex flex-col items-center   gap-3">
          <div>
            <input id="imagem-file" type="file" accept="image/*" className="sr-only" onChange={gerirMudancaImagem} />
            <label htmlFor="imagem-file" className="inline-flex items-center gap-2 cursor-pointer bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600">
              <Upload className="h-5 w-5" /> Escolher Imagem
            </label>
          </div>

          {form.imagem ? (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-300">Imagem carregada</div>
              <img src={form.imagem} alt="preview" className="h-20 w-20 object-cover rounded-md border border-gray-600" />
            </div>
          ) : (
            <div className="text-sm text-gray-400">Nenhuma imagem definida</div>
          )}
        </div>

        {/*Ações*/}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
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
            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white"
          >
            Cancelar
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditProductPage;
