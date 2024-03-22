"use client";
import mmScreenshot from "../../assets/mmScreenshot.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const MmModal = ({ setMmModal, isMobile }) => {
  return (
    <div>
      <div className="modalContainer relative">
        {/*---close button---*/}
        <button
          onClick={() => setMmModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">How to get a MetaMask address</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-auto overscroll-contain">
          <div className="modalContentContainer">
            {/*---intro---*/}
            <div className="mt-2 relative">
              <span className="font-bold">MetaMask wallet</span> is a desktop browser extension (or mobile App) that allows you to send/receive stablecoins. It is used by &gt; 95%
              of the ~100 million blockchain users worldwide. When you create a MetaMask account, you will get an "address", which is analogous to a bank account number. It is OK
              to publicly share your address with others. To get an address:
              {/* <span className="group">
                <span className="link">what is EVM?</span>
                <div className="text-lg leading-tight md:text-base md:leading-snug w-full px-3 py-2 mt-1 sm:mt-2 pointer-events-none absolute invisible group-hover:visible bg-slate-100 border border-slate-600 rounded-lg">
                  EVM stands for Ethereum Virtual Machine. It is a programming standard that some of the more popular blockchains are built on, such
                  as the Ethereum, BSC, Polygon, Optimism, Arbitrum, and Avalanche chains. The address MetaMask wallet gives you is an EVM address,
                  and it can be used for any of these chains.
                </div>
              </span> */}
            </div>
            {/*---instructions---*/}
            {/*---step 1---*/}
            <div className="py-3 flex">
              <div className="modalNumber">1.</div>
              <a href="https://metamask.io/download/" target="_blank" className="link">
                {isMobile ? "Download the MetaMask app" : "Install the MetaMask browser extension"}
              </a>
            </div>
            {/*---step 2---*/}
            <div className="py-3 flex border-t border-slate-300">
              <div className="modalNumber">2.</div>
              <div className="flex flex-col">
                <div>Follow the on-screen instructions to create an account. The steps are:</div>
                <div className="ml-2 sm:ml-8">
                  <div className="flex mt-1">
                    <div className="modalNumber">a.</div>
                    <div className="">Click "Create a new wallet"</div>
                  </div>
                  <div className="flex mt-1">
                    <div className="modalNumber">b.</div>
                    <div className="flex flex-col">
                      <div>Create a password</div>
                      <div className="border border-slate-300 bg-slate-200 rounded-lg px-2 py-1 text-base leading-tight md:text-sm md:leading-tight tracking-tighter md:w-[446px]">
                        This password is specific to each device. To access your wallet on another device, you will have to download MetaMask on the new device, click "Import an
                        existing wallet" instead of "Create a new wallet", and type in the 12-word Secret Recovery Phrase.
                      </div>
                    </div>
                  </div>
                  <div className="mt-1.5 mb-1 flex">
                    <div className="modalNumber">c.</div>
                    <div className="flex flex-col">
                      <div>Click "Secure my wallet" (do not click "Remind me later")</div>
                      <div className="border border-slate-300 bg-slate-200 rounded-lg px-2 py-1 text-base leading-tight md:text-sm md:leading-tight tracking-tighter md:w-[446px]">
                        Write down the 12-word Secret Recovery Phrase and store it somewhere safe. This is your real password. If you lose it, you cannot recover your funds. Do not
                        save it on your computer for security reasons.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/*---step 3---*/}
            <div className="pt-3 flex border-t border-slate-300">
              <div className="modalNumber">3.</div>
              <div>
                <div>Your address appears in the red box below. Copy it by clicking it.</div>
              </div>
            </div>
            {/*---image---*/}
            <div className="mt-2 mb-4 flex justify-center">
              <img src={mmScreenshot} className="w-[250px] border border-slate-300 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default MmModal;
