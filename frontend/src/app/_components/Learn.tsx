"use client";
import { useState } from "react";
import Image from "next/image";
// constants
import { currencyToData } from "@/utils/constants";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube, faAngleDown, faAngleUp, faCoins, faBoltLightning, faMobileScreenButton } from "@fortawesome/free-solid-svg-icons";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";

const Learn = ({ merchantCurrency }: { merchantCurrency: string }) => {
  const [lesson, setLesson] = useState("");

  const titles = [
    { id: "lesson1", title: "Lesson 1", subtitle: "What are blockchains & tokens?", fa: faCube, color: "4285f4" },
    { id: "lesson2", title: "Lesson 2", subtitle: "What is an EVM address?", fa: faCube, color: "34a853" },
    { id: "lesson3", title: "Lesson 3", subtitle: "Are tokens real money?", fa: faCoins, color: "fbbc05" },
    { id: "lesson4", title: "Lesson 4", subtitle: "How do I use the blockchain?", fa: faMobileScreenButton, color: "ea4335" },
    { id: "lesson5", title: "Lesson 5", subtitle: "How does Flash help?", fa: faBoltLightning, color: "000000" },
  ];

  const learnContent: any = {
    lesson1: (
      <div className="learnAnswerContainer">
        <div>
          A <span className="learnBoldFont">blockchain</span> is like a banking system.
        </div>
        <div>
          The banking system is composed of bank accounts, where accounts can transfer currencies (USD, EUR, YEN) to other accounts. A record of account balances and transactions
          are stored in bank servers and secured by bank employees.
        </div>
        <div>
          Similarly, a blockchain is composed of <span className="learnBoldFont">blockchain accounts</span>, where accounts can transfer{" "}
          <span className="learnBoldFont">tokens</span> (USDC, USDT, BTC) to other accounts. Records of account balances and transactions are stored in thousands of servers
          globally and secured by tens of thousands of individuals who are incentivized to maintain accurate records. Over 10+ years with $30+ trillion transacted, blockchains have
          proven to be very secure financial networks.
        </div>
        <div>
          Every blockchain account is assigned a unique <span className="learnBoldFont">address</span>, which is like a bank account number. When you send tokens, you will need to
          enter the recipient’s blockchain address. To receive tokens, you will need to share your blockchain address with the sender. As you see, sending and receiving tokens on
          the blockchain is very similar to sending and recieving money in the banking system.
        </div>
      </div>
    ),
    lesson2: (
      <div className="learnAnswerContainer">
        <div>
          Today, there are 100’s of blockchains. What helps simplify matters is that most blockchains, including 7 of the top 10 blockchains (Ethereum, BSC, Arbitrum, Optimism,
          Base, Polygon, Avalanche, Blast), are built using the same technology called the <span className="learnBoldFont">Ethereum Virtual Machine (EVM)</span>. An advantage of
          EVM is that a single EVM blockchain account can be used for all EVM blockchains. For example, if you have an EVM blockchain account and your EVM address is{" "}
          <span className="break-all">0x709D8145D21681f8287a556C67cD58Cb8A7FB3Aa</span>, you can use this same address to receive tokens on the Ethereum chain, Polygon chain, or
          any other EVM chain. Payments on Flash use an EVM chain (Polygon), so for now we'll only focus on EVM blockchains.
        </div>
      </div>
    ),
    lesson3: (
      <div className="learnAnswerContainer">
        <div>
          Some tokens do not have value, while others do. USDC is a token issued by Circle (a highly regulated U.S.-based company) and is backed one-to-one by USD. The USD reserves
          are held in major U.S. banks with quarterly attestations. Therefore, 1 USDC has a value equal to 1 USD.
        </div>
        <div>
          USDC is an example of a currency-backed stablecoin. Similarly, EUROC and JPYC are also currency-backed stablecoins that represent 1 EURO and 1 JPY, respectively.
          Currently, Flash only allows USDC transactions because most blockchain users already possess and use USDC. When other stablecoins become more popular, we will integrate
          them.
        </div>
      </div>
    ),
    lesson4: (
      <div className="learnAnswerContainer">
        <div>
          To start using the blockchain, most people will first register an account on a <span className="learnBoldFont">cryptocurrency exchange</span>. A cryptocurrency exchange
          (e.g., Coinbase, Binance, Crypto.com, etc.) is a platform where you can buy or sell tokens (e.g., USDC) with fiat currency (e.g., EUR). A cryptocurrency exchange account
          comes with an EVM blockchain address, so you can use your cryptocurrency exchange account to send tokens to or receive tokens from other EVM blockchain accounts.
          Cryptocurrency exchanges are essentially gateways to the blockchain world.
        </div>
        <div>
          After getting a cryptocurrency exchange account, most people will then download a <span className="learnBoldFont">Web3 wallet app</span> (e.g., MetaMask, Coinbase Wallet,
          Phantom, SafePal, etc.) and then send tokens from their cryptocurrency exchange account to it. MetaMask is by far the most popular Web3 wallet, so we’ll use MetaMask as
          an example. When you download the MetaMask app, you will be asked to create an EVM blockchain account. You can then send/receive tokens from the app, just like a
          cryptocurrency exchange account.
        </div>
        <div>
          There are 2 main reasons why people want their tokens in a Web3 wallet rather than on a cryptocurrency exchange: 1) Sending/receiving tokens on a Web3 wallet takes ~3s,
          compared to ~3 minutes on a cryptocurrency exchange. 2) A Web3 wallet can connect with thousands of blockchain-based web applications. For example, you can earn U.S.
          treasury rates on the blockchain. To do this, first buy USDC tokens on a cryptocurrency exchange. Then, send the USDC to MetaMask. With MetaMask, you can connect to the
          Flux Finance website and deposit your USDC on there to earn U.S. treasury rates (~5% APR).
        </div>
        <div>
          With 50+ million people transacting on the blockchain, a large majority of these people will likely have the MetaMask app on their phones and USDC tokens in it. That is
          why Flash was designed for customers to pay with the MetaMask app and USDC tokens.
        </div>
      </div>
    ),
    lesson5: (
      <div className="learnAnswerContainer">
        <div>If you have MetaMask, you can easily receive USDC payments from customers. What can Flash do that MetaMask cannot do?</div>
        {merchantCurrency != "USD" && (
          <div className="relative">
            First, most blockchain users transact in USDC (1 USDC = 1 USD). In non-USD countries, businesses and customers will have to agree on how much USDC should be sent for
            payment. With Flash, the customer can enter the amount of local currency ({merchantCurrency}) for payment. Flash then applies a fair exchange rate to calculate the
            amount of USDC sent for payment. Flash does not profit through exchange rates, so you and your customers are always gauranteed true market rates. Furthermore, Flash is
            designed so that you will not lose money from fluctuating rates (
            <span className="group">
              <span className="linkDark">how?</span>
              <div className="w-full top-[calc(100%+4px)] left-0 overviewTooltip">
                When a customer pays, our interface alters the USDC-{merchantCurrency} rate by 0.3% in favor of the business. So, you actually earn an extra 0.3%. In the long run,
                these extra earnings should offset any losses due to fluctuating rates, if you cash out frequently (~2x per month). Customers will not mind the extra 0.3% because
                the USDC-to-{merchantCurrency} rate offered by Flash is usually 1-5% better than the USD-to-{merchantCurrency} rate at any bank.
              </div>
            </span>
            ).
          </div>
        )}
        <div>
          {currencyToData[merchantCurrency].cex == "Coinbase" && (
            <span>
              Flash also helps businesses cash out to the bank with zero additional fees. Without Flash, businesses will have to transfer tokens from MetaMask to their
              cryptocurrency exchange, log into their cryptocurrency exchange, sell USDC, and make a withdrawal to their bank. This is a time consuming process. With Flash,
              businesses can cash out to their bank in a single interface on the Flash app.{" "}
            </span>
          )}
          Furthermore, with Flash, businesses do not need to worry about 12-word secret phrases or gas tokens, making Flash much easier to use than MetaMask. Lastly, businesses can
          download a .CSV file of all payment details to help with accounting.
        </div>
        <div>The functions above cannot be completed with MetaMask alone. Flash is a simple, low-cost tool that can help any business set up crypto payments.</div>
      </div>
    ),
  };

  return (
    <div id="learnEl" className="homeSectionSize xl:w-[840px] flex flex-col items-center">
      <div className="homeHeaderFont text-center">Learning Center</div>
      <div className="mt-2 mb-8 md:mb-12 text-[17px] font-medium text-center sm:w-[440px] lg:w-auto">In 5 short lessons, we teach you the basics of blockchain</div>
      <div className="w-full flex flex-col ">
        {titles.map((i, index) => (
          <div className={`${index == 0 ? "border-t-2" : ""} border-b-2 border-slate-300`}>
            {/*--- TITLE ---*/}
            <div
              className={` py-4 w-full flex justify-between items-center cursor-pointer desktop:hover:bg-[#1D364F]`}
              onClick={() => (lesson == i.id ? setLesson("") : setLesson(i.id))}
            >
              {/*---content (left) ---*/}
              <div className="flex items-center">
                <div className="flex-none w-[40px] h-[40px] rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: `#${i.color}` }}>
                  {i.id != "lesson5" && <FontAwesomeIcon className="text-white text-lg" icon={i.fa} />}
                  {i.id == "lesson5" && (
                    <div className="relative w-[36px] h-[36px] rounded-full overflow-hidden">
                      <Image src="/logoBlackBgNoText.svg" alt="logo" fill />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xl font-semibold leading-none">{i.title}</div>
                  <div className="mt-1 text-base leading-none">{i.subtitle}</div>
                </div>
              </div>
              {/*--- learn/arrow (right) ---*/}
              <div className="mr-2">
                {lesson == i.id ? (
                  <FontAwesomeIcon icon={faAngleUp} className="text-xl ml-2" />
                ) : (
                  <span>
                    <FontAwesomeIcon icon={faAngleDown} className="text-xl ml-2" />
                  </span>
                )}
              </div>
            </div>
            {/*--- CONTENT ---*/}
            <div
              className={`${
                lesson == i.id ? "max-h-[1300px] sm:max-h-[650px]" : "max-h-0"
              } text-sm xs:text-base leading-tight xs:leading-tight overflow-hidden transition-all duration-[600ms]`}
            >
              {learnContent[i.id]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Learn;
