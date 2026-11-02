export default function Statistics() {
    return (
        <section className="w-full bg-[#0A0F1C] py-16 lg:py-24 relative overflow-hidden font-jakarta">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex justify-between px-10">
                <div className="w-64 h-64 bg-white rounded-full blur-3xl absolute -top-32 -left-20"></div>
                <div className="w-64 h-64 bg-white rounded-full blur-3xl absolute -bottom-32 -right-20"></div>
            </div>

            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4 items-center">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm lg:text-base mb-2 font-medium">
                            Home for Rent
                        </span>
                        <span className="text-white text-4xl lg:text-5xl font-medium tracking-tight">
                            5300+
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm lg:text-base mb-2 font-medium">
                            Home to Buy
                        </span>
                        <span className="text-white text-4xl lg:text-5xl font-medium tracking-tight">
                            3000+
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm lg:text-base mb-2 font-medium">
                            Agents
                        </span>
                        <span className="text-white text-4xl lg:text-5xl font-medium tracking-tight">
                            120+
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm lg:text-base mb-2 font-medium">
                            Cities Covered
                        </span>
                        <span className="text-white text-4xl lg:text-5xl font-medium tracking-tight">
                            83+
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm lg:text-base mb-2 font-medium">
                            Total Properties
                        </span>
                        <span className="text-white text-4xl lg:text-5xl font-medium tracking-tight">
                            9200+
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
