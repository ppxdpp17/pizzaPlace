import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { useProductStore } from "../stores/useProductStore";
import toast from "react-hot-toast";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { editarProduto } = useProductStore();

  const [loading, setLoading] = useState(true);
  const [ingredientesList, setIngredientesList] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: 0,
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
          nome: produto.nome || "",
          descricao: produto.descricao || "",
          preco: produto.preco || 0,
          imagem: produto.imagem || "",
          categoria: produto.categoria || "",
          ingredientes: (produto.ingredientes || []).map(i => i._id || i.id)
        });
        setIngredientesList(ingRes.data.ingredientes ?? ingRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Falha ao carregar produto.");
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
  };

  const toggleIngrediente = (idIng) => {
    setForm(prev => {
      const exists = prev.ingredientes.includes(idIng);
      return { ...prev, ingredientes: exists ? prev.ingredientes.filter(i => i !== idIng) : [...prev.ingredientes, idIng] };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // enviar dados ao backend
      const payload = {
        nome: form.nome,
        descricao: form.descricao,
        preco: Number(form.preco),
        imagem: form.imagem, // aceitar URL ou dataURL (se fizeres upload)
        categoria: form.categoria,
        ingredientes: form.ingredientes
      };
      await editarProduto(id, payload);
      toast.success("Produto atualizado!");
      navigate("/admin/produtos"); // volta para lista
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Erro ao atualizar produto.");
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Produto</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300">Nome</label>
          <input name="nome" value={form.nome} onChange={onChange} className="w-full mt-1 p-2 rounded bg-gray-700 text-white" />
        </div>

        <div>
          <label className="block text-sm text-gray-300">Descrição</label>
          <textarea name="descricao" value={form.descricao} onChange={onChange} className="w-full mt-1 p-2 rounded bg-gray-700 text-white" />
        </div>

        <div>
          <label className="block text-sm text-gray-300">Preço</label>
          <input name="preco" type="number" step="0.01" value={form.preco} onChange={onChange} className="w-full mt-1 p-2 rounded bg-gray-700 text-white" />
        </div>

        <div>
          <label className="block text-sm text-gray-300">Categoria</label>
          <input name="categoria" value={form.categoria} onChange={onChange} className="w-full mt-1 p-2 rounded bg-gray-700 text-white" />
        </div>

        <div>
          <label className="block text-sm text-gray-300">Imagem (URL ou dataURL)</label>
          <input name="imagem" value={form.imagem} onChange={onChange} className="w-full mt-1 p-2 rounded bg-gray-700 text-white" />
          <p className="text-xs text-gray-400 mt-1">Se quiseres upload de ficheiro, posso adicionar suporte a file input e converter para dataURL.</p>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Ingredientes</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {ingredientesList.map(ing => (
              <label key={ing._id || ing.id} className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={form.ingredientes.includes(ing._id)} onChange={() => toggleIngrediente(ing._id)} />
                <span>{ing.icone ? ing.icone + " " : ""}{ing.nome}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-emerald-600 px-4 py-2 rounded text-white">Guardar</button>
          <button type="button" onClick={() => navigate(-1)} className="bg-gray-700 px-4 py-2 rounded text-white">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
