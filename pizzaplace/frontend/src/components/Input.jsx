import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({ icon: Icon, ...props }) => {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = props.type === "password";

	return (
		<div className='relative mb-6'>
			<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
				<Icon className='size-5 text-red-500' />
			</div>
			<input
				{...props}
				type={isPassword && showPassword ? "text" : props.type}
				className='w-full pl-10 pr-10 py-2 bg-white bg-opacity-80 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-800 placeholder-gray-400 transition duration-200 shadow-sm'
			/>
			{isPassword && (
				<button
					type="button"
					onClick={() => setShowPassword(!showPassword)}
					className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-500 transition-colors"
				>
					{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
				</button>
			)}
		</div>
	);
};
export default Input;