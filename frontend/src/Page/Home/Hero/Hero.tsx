export default function Hero() {
    return (
        <section className="w-full h-auto bg-gradient-to-b from-[#E6ECF4]/80 to-white">
            <div className="w-full h-[1100px] bg-[length:95%] bg-[url('./assets/Urbanouse.svg')] bg-no-repeat flex flex-col items-end justify-end bg-[center_top_30%] ">
                <div className="w-full relative z-0  bg-gradient-to-b ">
                    <div className="w-full h-[800px] overflow-hidden flex items-start">
                        <img
                            className="w-full h-full object-cover object-top"
                            src="../src/assets/urbane-house-hero.png"
                            alt="Urbanouse"
                        />
                    </div>

                    <div className="w-[95%] h-[200px] flex items-center justify-between absolute right-8 bottom-6 z-2 ">
                        <p className="w-[25%] font-jakarta text-[#fff] text-2xl leading-[1.6] text-bold [text-shadow:_0_0_10px_rgba(0,0,0,0.8)]">
                            Discover meticulously crafted homes and properties, blending
                            contemporary aesthetics with sustainable living.
                        </p>

                        <div className="w-[15vw] h-[160px] flex flex-col items-end justify-between">
                            <div className="flex gap-6">
                                <button className="w-[42px] h-[42px] rounded-full border border-white flex items-center justify-center cursor-pointer">
                                    <img
                                        className="w-[23px] h-auto"
                                        src="../src/assets/arrow-left-white.svg"
                                        alt="arrow-left"
                                    />
                                </button>
                                <button className="w-[42px] h-[42px] rounded-full border border-white bg-white flex items-center justify-center cursor-pointer">
                                    <img
                                        className="w-[23px] h-auto"
                                        src="../src/assets/arrow-right-black.svg"
                                        alt="arrow-right"
                                    />
                                </button>
                            </div>
                            <b className="font-jakarta text-2xl text-white [text-shadow:_0_0_10px_rgba(0,0,0,0.8)]">
                                Silverstone Residence
                            </b>
                            <p className="font-jakarta text-2xl text-white text-end [text-shadow:_0_0_10px_rgba(0,0,0,0.8)]">
                                1234 Sunflower Lane Los Angeles, CA 90001
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
