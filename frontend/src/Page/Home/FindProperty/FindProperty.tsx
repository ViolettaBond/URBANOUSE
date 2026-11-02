export default function FindProperty() {
    // Выносим SVG стрелочки в переменную, чтобы не дублировать код
    const ArrowIcon = () => (
        <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500 group-hover:text-black transition-colors"
        >
            <path
                d="M1 1L5 5L9 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    return (
        <section className="w-full py-20 bg-white flex flex-col items-center justify-center font-jakarta">
            <div className="text-center mb-16">
                <h2 className="text-5xl font-semibold text-black mb-4">Find Your Dream Property</h2>
                <p className="text-[#8C8C8C] max-w-md mx-auto text-xl leading-relaxed">
                    We offer modern properties with the best quality that meet all your needs.
                </p>
            </div>

            <div className="flex items-end gap-6 lg:gap-12 w-full max-w-6xl px-8">
                <div className="flex flex-col flex-1 group cursor-pointer">
                    <span className="text-sm text-gray-400 mb-2 font-medium">Looking for</span>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 group-hover:border-gray-400 transition-colors">
                        <span className="text-lg text-[#0B132B]">Buy</span>
                        <ArrowIcon />
                    </div>
                </div>

                <div className="flex flex-col flex-1 group cursor-pointer">
                    <span className="text-sm text-gray-400 mb-2 font-medium">Location</span>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 group-hover:border-gray-400 transition-colors">
                        <span className="text-lg text-[#0B132B]">London</span>
                        <ArrowIcon />
                    </div>
                </div>

                <div className="flex flex-col flex-1 group cursor-pointer">
                    <span className="text-sm text-gray-400 mb-2 font-medium">Property Type</span>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 group-hover:border-gray-400 transition-colors">
                        <span className="text-lg text-[#0B132B]">Family House</span>
                        <ArrowIcon />
                    </div>
                </div>

                <div className="flex flex-col flex-1 group cursor-pointer">
                    <span className="text-sm text-gray-400 mb-2 font-medium">Bedrooms</span>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 group-hover:border-gray-400 transition-colors">
                        <span className="text-lg text-[#0B132B]">3 bedrooms</span>
                        <ArrowIcon />
                    </div>
                </div>

                <div className="flex flex-col flex-1 group cursor-pointer">
                    <span className="text-sm text-gray-400 mb-2 font-medium">Budget</span>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 group-hover:border-gray-400 transition-colors">
                        <span className="text-lg text-[#0B132B]">$500,000</span>
                        <ArrowIcon />
                    </div>
                </div>

                <button className="flex-shrink-0 w-14 h-14 bg-[#0B132B] rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors mb-1">
                    <img src="../src/assets/loop-glass.svg" alt="Search" className="w-6 h-6" />
                </button>
            </div>
        </section>
    );
}
