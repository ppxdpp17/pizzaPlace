import { Check, X } from "lucide-react";

const CriteriosPassword = ({ password }) => {
	const criterios = [
		{ label: "Pelo menos 6 caratéres", met: password.length >= 6 },
		{ label: "Contém uma letra maiúscula", met: /[A-Z]/.test(password) },
		{ label: "Contém uma letra minúscula", met: /[a-z]/.test(password) },
		{ label: "Contém um número", met: /\d/.test(password) },
		{ label: "Contém um caratér especial", met: /[^A-Za-z0-9]/.test(password) },
	];

	return (
		<div className='mt-2 space-y-1'>
			{criterios.map((item) => (
				<div key={item.label} className='flex items-center text-xs'>
					{item.met ? (
						<Check className='size-4 text-green-500 mr-2' />
					) : (
						<X className='size-4 text-gray-500 mr-2' />
					)}
					<span className={item.met ? "text-green-500" : "text-gray-400"}>{item.label}</span>
				</div>
			))}
		</div>
	);
};

const MedidorForcaPassword = ({ password }) => {
	const getForca = (pass) => {
		let forca = 0;
		if (pass.length >= 6) forca++;
		if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) forca++;
		if (pass.match(/\d/)) forca++;
		if (pass.match(/[^a-zA-Z\d]/)) forca++;
		return forca;
	};
	const forca = getForca(password);

	const getCor = (forca) => {
		if (forca === 0) return "bg-red-500";
		if (forca === 1) return "bg-red-400";
		if (forca === 2) return "bg-yellow-500";
		if (forca === 3) return "bg-yellow-400";
		return "bg-green-500";
	};

	const getForcaText = (forca) => {
		if (forca === 0) return "Muito Fraca";
		if (forca === 1) return "Fraca";
		if (forca === 2) return "Forte";
		if (forca === 3) return "Muito Forte";
		return "Strong";
	};

	return (
		<div className='mt-2'>
			<div className='flex justify-between items-center mb-1'>
				<span className='text-xs text-gray-400'>Força da Password</span>
				<span className='text-xs text-gray-400'>{getForcaText(forca)}</span>
			</div>

			<div className='flex space-x-1'>
				{[...Array(4)].map((_, index) => (
					<div
						key={index}
						className={`h-1 w-1/4 rounded-full transition-colors duration-300 
                ${index < forca ? getCor(forca) : "bg-gray-600"}
              `}
					/>
				))}
			</div>
			<CriteriosPassword password={password} />
		</div>
	);
};
export default MedidorForcaPassword;