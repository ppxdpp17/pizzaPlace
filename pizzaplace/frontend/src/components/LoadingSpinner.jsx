const LoadigSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/piuzz.png')" }}>
            <img src="/logo.png" alt="Big Bob's Logo" className="h-20 w-auto rounded-full mb-6 animate-pulse shadow-md" />
            <div className="relative">
                <div className="w-16 h-16 border-red-100 border-4 rounded-full shadow-sm bg-white/50 backdrop-blur-sm" />
                <div className="w-16 h-16 border-red-500 border-t-4 animate-spin rounded-full absolute left-0 top-0 drop-shadow-md" />
                <div className="sr-only">A carregar</div>
            </div>
            <p className="mt-4 text-gray-700 font-medium">A carregar...</p>
        </div>
    );
};

export default LoadigSpinner;