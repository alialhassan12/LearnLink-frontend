const Footer=()=>{
    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 p-6 sm:p-10 border-t border-gray-400/30">
            <div className="text-center md:text-left">
                <p className="text-text-strong font-bold">LearnLink</p>
                <p className="text-text-weak text-sm sm:text-base">&copy; {new Date().getFullYear()} LearnLink. Scholarly focus, cutting-edge growth.</p>
            </div>
            <div>
                <ul className="list-none flex flex-wrap justify-center gap-6 sm:gap-10 text-text-weak text-sm">
                    <li className="hover:text-text-strong hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">Product</li>
                    <li className="hover:text-text-strong hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">Features</li>
                    <li className="hover:text-text-strong hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">Pricing</li>
                    <li className="hover:text-text-strong hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">Privacy</li>
                </ul>
            </div>
            
        </div>
    )
}

export default Footer;