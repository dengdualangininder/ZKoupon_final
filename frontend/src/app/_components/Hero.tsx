import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  // const handleOnClick = () => {
  //   document.getElementById("startEl").scrollIntoView({ behavior: "smooth", block: "start" });
  // };

  return (
    <div className="h-screen flex flex-col max-h-[1200px]">
      {/*--- navbar spacer ---*/}
      <div className="h-[92px] portrait:sm:h-[108px] landscape:lg:h-[108px]"></div>
      {/*--- container without navbar ---*/}
      <div className="flex-1">
        {/*--- geader + subheader ---*/}
        <div className="h-[65%] max-h-[800px] flex flex-col justify-center items-center">
          {/*--- header ---*/}
          <div className="font-extrabold text-center text-4xl portrait:sm:text-7xl landscape:lg:text-7xl leading-snug portrait:sm:leading-tight landscape:lg:leading-tight">
            CRYPTO PAYMENTS <br /> WITH 0% FEES
          </div>
          {/*--- spacer ---*/}
          <div className="h-[10%]"></div>
          {/*--- subheader ---*/}
          <div className="relative heroSubheaderWidth heroSubheaderFont">
            With a{" "}
            <span className="group">
              <span className="link font-semibold">true peer-to-peer</span>
              <div className="invisible group-hover:visible w-full absolute left-0 bottom-[calc(100%+4px)] text-lg portrait:sm:text-xl landscape:lg:text-xl landscape:xl:desktop:text-lg px-4 py-3 bg-slate-700 text-white rounded-xl z-[1]">
                True P2P payments mean that customers pay businesses directly with <span className="font-bold">no middlemen</span>. Therefore, Flash does not charge fees or make profit by giving you or your customers suboptimal token conversion
                rates.
              </div>
            </span>{" "}
            payments design, Flash Payments is a simple and low-cost platform to help you set up crypto payments for your business. Setting up takes 1 minute.
          </div>
        </div>
        {/*--- enter button ---*/}
        <div className="hidden lg:flex w-full flex-col items-center">
          <button className={`heroButton`} onClick={() => router.push("/app")}>
            Enter App
          </button>
        </div>
      </div>
    </div>
  );
}
