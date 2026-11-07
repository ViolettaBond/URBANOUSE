import skelet from '../../../assets/skelet-discover.jpg';

export default function Discover() {
    return (
        <>
            <section className="w-full py-24 bg-white font-jakarta flex justify-center">
                <div className="w-full max-w-[1440px] px-8 lg:px-16 flex flex-col">
                    <span className="w-[190px] inline-flex items-center gap-4 px-4 py-2 rounded-full border border-gray-200 mb-8">
                        <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
                        <p className="text-sm font-medium text-gray-700">Fetured Properties</p>
                    </span>

                    <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-12">
                        <h2 className="text-6xl lg:text-7xl font-semibold text-[#0B132B] tracking-tight leading-[1.1]">
                            Discover Urbanouse Properties
                        </h2>

                        <p className="text-gray-500 text-lg leading-relaxed">
                            Explore an exclusive selection of premium properties, meticulously
                            curated to provide you with the best in luxury living and prime real
                            estate investment options, tailored to your needs
                        </p>
                    </div>

                    <div className="w-full p-6 flex items-center justify-center">
                        <div className="w-[640px] flex justify-between">
                            <button className="bg-[#090C1B] text-white px-4 pl-6 rounded-2xl text-lg flex items-center justify-center cursor-pointer">
                                All Properties
                            </button>
                            <button className="rounded-2xl border-[#F0F0F0] border px-4 py-2 text-lg font-medium text-black-700 transition-colors duration-200 hover:bg-gray-50 hover:border-black-300 cursor-pointer">
                                Family House
                            </button>
                            <button className="rounded-2xl border-[#F0F0F0] border px-4 py-2 text-lg font-medium text-black-700 transition-colors duration-200 hover:bg-gray-50 hover:border-black-300 cursor-pointer">
                                Villa
                            </button>
                            <button className="rounded-2xl border-[#F0F0F0] border px-4 py-2 text-lg font-medium text-black-700 transition-colors duration-200 hover:bg-gray-50 hover:border-black-300 cursor-pointer">
                                Apartment
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-4 max-w-[425px]">
                            <div className="relative w-full">
                                <span className="top-6 left-4 absolute z-10 bg-[#090C1B] text-white px-5 py-2.5 rounded-2xl text-sm font-medium tracking-wide flex items-center justify-center">
                                    FOR SALE
                                </span>
                                <img
                                    className="w-full h-full object-cover rounded-3xl"
                                    src={skelet}
                                    alt="Property"
                                />
                            </div>

                            <div className="py-2 text-black flex flex-col gap-1">
                                <p className="text-3xl font-semibold tracking-tight mb-1">$750,000</p>
                                <p className="text-xl font-semibold mb-2">Golden Leaf Residence</p>
                                <div className="text-gray-500 text-base leading-relaxed mb-4">
                                    <p>1012 Oak Avenue</p>
                                    <p>Manchester, M11AE, United Kingdom</p>
                                </div>
                                <ul className="flex items-center text-gray-500 text-sm">
                                    <li>3 beds</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>2 bath</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>900 sq.ft</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 max-w-[425px]">
                            <div className="relative w-full">
                                <span className="top-6 left-4 absolute z-10 bg-[#090C1B] text-white px-5 py-2.5 rounded-2xl text-sm font-medium tracking-wide flex items-center justify-center">
                                    FOR SALE
                                </span>
                                <img
                                    className="w-full h-full object-cover rounded-3xl"
                                    src={skelet}
                                    alt="Property"
                                />
                            </div>

                            <div className="py-2 text-black flex flex-col gap-1">
                                <p className="text-3xl font-semibold tracking-tight mb-1">$750,000</p>
                                <p className="text-xl font-semibold mb-2">Golden Leaf Residence</p>
                                <div className="text-gray-500 text-base leading-relaxed mb-4">
                                    <p>1012 Oak Avenue</p>
                                    <p>Manchester, M11AE, United Kingdom</p>
                                </div>
                                <ul className="flex items-center text-gray-500 text-sm">
                                    <li>3 beds</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>2 bath</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>900 sq.ft</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 max-w-[425px]">
                            <div className="relative w-full">
                                <span className="top-6 left-4 absolute z-10 bg-[#090C1B] text-white px-5 py-2.5 rounded-2xl text-sm font-medium tracking-wide flex items-center justify-center">
                                    FOR SALE
                                </span>
                                <img
                                    className="w-full h-full object-cover rounded-3xl"
                                    src={skelet}
                                    alt="Property"
                                />
                            </div>

                            <div className="py-2 text-black flex flex-col gap-1">
                                <p className="text-3xl font-semibold tracking-tight mb-1">$750,000</p>
                                <p className="text-xl font-semibold mb-2">Golden Leaf Residence</p>
                                <div className="text-gray-500 text-base leading-relaxed mb-4">
                                    <p>1012 Oak Avenue</p>
                                    <p>Manchester, M11AE, United Kingdom</p>
                                </div>
                                <ul className="flex items-center text-gray-500 text-sm">
                                    <li>3 beds</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>2 bath</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>900 sq.ft</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 max-w-[425px]">
                            <div className="relative w-full">
                                <span className="top-6 left-4 absolute z-10 bg-[#090C1B] text-white px-5 py-2.5 rounded-2xl text-sm font-medium tracking-wide flex items-center justify-center">
                                    FOR SALE
                                </span>
                                <img
                                    className="w-full h-full object-cover rounded-3xl"
                                    src={skelet}
                                    alt="Property"
                                />
                            </div>

                            <div className="py-2 text-black flex flex-col gap-1">
                                <p className="text-3xl font-semibold tracking-tight mb-1">$750,000</p>
                                <p className="text-xl font-semibold mb-2">Golden Leaf Residence</p>
                                <div className="text-gray-500 text-base leading-relaxed mb-4">
                                    <p>1012 Oak Avenue</p>
                                    <p>Manchester, M11AE, United Kingdom</p>
                                </div>
                                <ul className="flex items-center text-gray-500 text-sm">
                                    <li>3 beds</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>2 bath</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>900 sq.ft</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 max-w-[425px]">
                            <div className="relative w-full">
                                <span className="top-6 left-4 absolute z-10 bg-[#090C1B] text-white px-5 py-2.5 rounded-2xl text-sm font-medium tracking-wide flex items-center justify-center">
                                    FOR SALE
                                </span>
                                <img
                                    className="w-full h-full object-cover rounded-3xl"
                                    src={skelet}
                                    alt="Property"
                                />
                            </div>

                            <div className="py-2 text-black flex flex-col gap-1">
                                <p className="text-3xl font-semibold tracking-tight mb-1">$750,000</p>
                                <p className="text-xl font-semibold mb-2">Golden Leaf Residence</p>
                                <div className="text-gray-500 text-base leading-relaxed mb-4">
                                    <p>1012 Oak Avenue</p>
                                    <p>Manchester, M11AE, United Kingdom</p>
                                </div>
                                <ul className="flex items-center text-gray-500 text-sm">
                                    <li>3 beds</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>2 bath</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>900 sq.ft</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 max-w-[425px]">
                            <div className="relative w-full">
                                <span className="top-6 left-4 absolute z-10 bg-[#090C1B] text-white px-5 py-2.5 rounded-2xl text-sm font-medium tracking-wide flex items-center justify-center">
                                    FOR SALE
                                </span>
                                <img
                                    className="w-full h-full object-cover rounded-3xl"
                                    src={skelet}
                                    alt="Property"
                                />
                            </div>

                            <div className="py-2 text-black flex flex-col gap-1">
                                <p className="text-3xl font-semibold tracking-tight mb-1">$750,000</p>
                                <p className="text-xl font-semibold mb-2">Golden Leaf Residence</p>
                                <div className="text-gray-500 text-base leading-relaxed mb-4">
                                    <p>1012 Oak Avenue</p>
                                    <p>Manchester, M11AE, United Kingdom</p>
                                </div>
                                <ul className="flex items-center text-gray-500 text-sm">
                                    <li>3 beds</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>2 bath</li>
                                    <li className="mx-2 text-gray-400">·</li>
                                    <li>900 sq.ft</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
