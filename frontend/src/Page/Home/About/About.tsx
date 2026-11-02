export default function About() {
    return (
        <section className="w-full py-24 bg-white font-jakarta flex justify-center">
            <div className="w-full max-w-[1440px] px-8 lg:px-16">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-12">
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 mb-8">
                            <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
                            <span className="text-sm font-medium text-gray-700">
                                About Urbanouse
                            </span>
                        </div>

                        <h1 className="text-6xl lg:text-7xl font-semibold text-[#0B132B] tracking-tight leading-[1.1]">
                            Your Dream Home,
                            <br />
                            Our Expertise.
                        </h1>
                    </div>

                    <div className="lg:w-[45%] pt-4 lg:pt-20">
                        <p className="text-gray-500 text-lg leading-relaxed">
                            At Urbanouse, we are committed to helping individuals and families find
                            their perfect homes and smart investment properties. Our approach blends
                            personalized service, expert insights, and a dedication to excellence,
                            ensuring your real estate journey is seamless, rewarding, and tailored
                            to your unique needs.
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 items-stretch">
                    <div className="relative w-[40%] h-[350px] rounded-3xl overflow-hidden group cursor-pointer">
                        <img
                            src="../src/assets/family-house.jpg"
                            alt="Family House"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        <div className="absolute bottom-0 left-0 p-8 text-white z-10">
                            <h3 className="text-2xl font-semibold mb-2">Family House</h3>
                            <p className="text-sm text-gray-200 mb-4 max-w-sm leading-relaxed">
                                Discover modern family living with spacious layouts and top-tier
                                amenities designed for comfort and style.
                            </p>
                            <span className="text-sm font-medium">650+ units available</span>
                        </div>
                    </div>

                    <div className="relative w-[16%] h-[350px] rounded-3xl overflow-hidden cursor-pointer">
                        <img
                            src="../src/assets/modern-villa.jpg"
                            alt="Modern Villa"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="relative w-[16%] h-[350px] rounded-3xl overflow-hidden cursor-pointer">
                        <img
                            src="../src/assets/luxury-apartament.jpg"
                            alt="Luxury Apartment"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="relative w-[16%] h-[350px] rounded-3xl overflow-hidden cursor-pointer">
                        <img
                            src="../src/assets/design-interior.jpg"
                            alt="Design Interior"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex flex-col items-center justify-center w-[10%] cursor-pointer group">
                        <div className="w-20 h-20 rounded-full border border-gray-400 flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M7 17L17 7M17 7H7M17 7V17"
                                    stroke="#0B132B"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <span className="text-center text-lg font-medium text-[#0B132B] leading-tight">
                            More
                            <br />
                            projects
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
