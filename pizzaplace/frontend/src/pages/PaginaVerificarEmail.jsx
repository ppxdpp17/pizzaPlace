import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/useAuthStore.js";
import toast from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore.js";

const PaginaVerificarEmail = () => {
	const [codigo, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
  	const { verificarAutenticacao } = useUserStore();
	const navigate = useNavigate();

	const { error, isLoading, verifyEmail } = useAuthStore();

	const gerirMudanca = (index, value) => {
		const novoCodigo = [...codigo];

		//Gerir conteúdo colado
		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				novoCodigo[i] = pastedCode[i] || "";
			}
			setCode(novoCodigo);

			//Para "focar" no primeiro campo de inserir email
			const lastFilledIndex = novoCodigo.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex].focus();
		} else {
			novoCodigo[index] = value;
			setCode(novoCodigo);

			//Mudar "foco" para o próximo campo quando um for preenchido
			if (value && index < 5) {
				inputRefs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !codigo[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = codigo.join("");
		try {
			await verifyEmail(verificationCode);
			await verificarAutenticacao();
			navigate("/");
			toast.success("Email verificado com sucesso!");
		} catch (error) {
			console.log(error);
		}
	};

	//Submeter automaticamente quando todos os campos estão preenchidos
	useEffect(() => {
		if (codigo.every((digit) => digit !== "")) {
			handleSubmit(new Event("submit"));
		}
	}, [codigo]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-md w-full bg-white bg-opacity-90 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
			>
				<div className='p-8 w-full max-w-md'>
					<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 to-red-600 text-transparent bg-clip-text'>
						Verifique o seu Email
					</h2>
					<p className='text-center text-gray-600 mb-6'>Insira o código de 6 digitos enviado para o email registado</p>

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='flex justify-between gap-2'>
							{codigo.map((digit, index) => (
								<input
									key={index}
									ref={(el) => (inputRefs.current[index] = el)}
									type='text'
									maxLength='6'
									value={digit}
									onChange={(e) => gerirMudanca(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									className='w-12 h-12 text-center text-2xl font-bold bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors'
								/>
							))}
						</div>
						{error && <p className='text-center text-red-500 font-semibold mt-2'>{error}</p>}
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type='submit'
							disabled={isLoading || codigo.some((digit) => !digit)}
							className='w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white transition duration-200 disabled:opacity-50'
						>
							{isLoading ? "A verificar..." : "Verificar Email"}
						</motion.button>
					</form>
				</div>
			</motion.div>
		</div>
	);
};
export default PaginaVerificarEmail;