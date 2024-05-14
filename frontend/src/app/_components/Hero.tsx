import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  // const handleOnClick = () => {
  //   document.getElementById("startEl").scrollIntoView({ behavior: "smooth", block: "start" });
  // };

  return (
    <div className="mt-4 flex flex-col justify-center items-center mx-4 sm:mx-0 sm:w-[565px] md:w-[680px] text-slate-800">
      {/*--Header---*/}
      <div className="text-[40px] xs:text-5xl sm:text-6xl leading-tight xs:leading-[56px] sm:leading-[76px] font-extrabold text-center flex flex-col">
        <div className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 from-30% via-pink-500 to-yellow-500 animate-text">Digital payments</div>
        <div>with 0% fees, forever</div>
      </div>
      {/*--Subheader---*/}
      <div className="mt-7 text-2xl font-bold text-center">Join the digital revolution!</div>
      {/*--Body---*/}
      <div className="mt-8 w-[352px] xs:w-[444px] md:w-[690px] flex-none text-2xl relative">
        Flash is currently the only platform that helps businesses set up{" "}
        <span className="group">
          <span className="link font-bold">true P2P</span>
          <div className="invisible group-hover:visible md:w-[690px] md:left-[calc(50%-345px)] absolute bottom-[66px] text-lg leading-snug px-[28px] py-2 border bg-white text-gray-600 rounded-xl z-[1]">
            True P2P (peer-to-peer) payments mean that customers pay businesses directly with <span className="font-bold">zero middlemen</span>. Therefore, it is{" "}
            <span className="underline underline-offset-4">impossible</span> for 3<sup>rd</sup> parties to take fees, withhold payment, or profit from giving suboptimal token
            exchange rates.
          </div>
        </span>{" "}
        blockchain payments. Set up in 5 minutes at $0/month.
      </div>
      {/*--mobile, Free Setup button---*/}
      <div className="mt-24 md:hidden"></div>

      <div className="mt-16 md:hidden hidden">
        <button
          id="mobileStartButton"
          onClick={() => router.push("/signup")}
          className=" text-white h-[52px] w-[168px] bg-gradient-to-br from-blue-400 from-10% via-pink-400 to-orange-400 to-100% rounded-[32px] transition-all duration-1000 flex flex-col justify-center items-center relative ease-in-out"
        >
          <div className="absolute top-[8px] text-xl font-bold leading-none pointer-events-none">Free Setup</div>
          <div className="absolute top-[28px] text-sm leading-tight pointer-events-none">(just 5 minutes)</div>
        </button>
      </div>
    </div>
  );
}
