const signupCoinbase = () => {
  return (
    <div>
      {/*---1---*/}
      <div className="py-2 flex">
        <div className="modalNumber">1.</div>
        <div>
          <div>
            Sign up for a Coinbase account (
            <a href="https://www.coinbase.com/signup" target="_blank" className="text-blue-500 underline hover:text-blue-800">
              www.coinbase.com/signup
            </a>
            )
          </div>
          <div className="ml-3">
            <div>&bull; Be sure to verify your identity and link a payment method</div>
          </div>
        </div>
      </div>
      {/*---videos---*/}
      <div className="mt-3 flex flex-col items-center">
        <div className="text-sm font-bold">DESKTOP GUIDE</div>
        <div className="w-full relative overflow-hidden pt-[56.25%]">
          <iframe
            src="https://fast.wistia.net/embed/iframe/mp9aidxwa2"
            className="absolute h-full w-full top-0 left-0"
            allow="accelerometer; autoplay; fullscreen; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
        <div className="mt-4 text-sm font-bold">MOBILE GUIDE</div>
        <div className="w-full relative overflow-hidden pt-[56.25%] mb-8">
          <iframe
            src="https://fast.wistia.net/embed/iframe/xng5llmex6"
            className="absolute h-full w-full top-0 left-0"
            allow="accelerometer; autoplay; fullscreen; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default signupCoinbase;
