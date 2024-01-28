import { useState } from "react";
import Image from "next/image";
// import checkmark from "../assets/checkmark.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

export default function Advantage() {
  const [toggleOne, setToggleOne] = useState(false);
  const [toggleTwo, setToggleTwo] = useState(false);
  const [toggleThree, setToggleThree] = useState(false);
  const [toggleFour, setToggleFour] = useState(false);
  const [toggleFive, setToggleFive] = useState(false);
  const [onsite, setOnsite] = useState(true);
  const [online, setOnline] = useState(false);

  return (
    <div className="sectionMargin text-white ">
      {/*---Header---*/}
      <div className="font-extrabold text-[32px] xs:text-4xl sm:text-5xl text-center">Why Choose Ling Pay</div>
      {/*---Body---*/}
      <div className="flex flex-col items-center">
        {/*---Subheader---*/}
        <div className="sm:w-[550px] my-4 md:my-5 text-lg text-center">
          Several companies can help businesses set up blockchain payments. Ling Pay is uniquely different because:
        </div>
        {/*---bullet points---*/}
        <div className="flex flex-col items-center sm:px-0 sm:w-[582px] md:w-[550px] space-y-6">
          {/*---one---*/}
          <div className="advantageHeader flex">
            <Image src="/checkmark.svg" alt="checkmark" width={24} height={24} className="mr-2.5" />
            <div>
              We are not a middleman (we take 0% fees)
              <span
                onClick={() => {
                  setToggleOne(!toggleOne);
                  setToggleTwo(false);
                  setToggleThree(false);
                  setToggleFour(false);
                  setToggleFive(false);
                }}
                className="advantageLearnWord"
              >
                details
                <FontAwesomeIcon icon={toggleOne ? faAngleUp : faAngleDown} className="ml-1 align-middle" />
              </span>
              <div className={`${toggleOne ? "max-h-[300px]" : "max-h-0"} overflow-hidden transition-all duration-500 advantageBody relative`}>
                Most blockchain payment companies charge businesses &gt; 1% in fees, while customers almost always pay a hidden fee from bad exchange rates (
                <span className="group">
                  <span className="link">how?</span>
                  <div className="invisible group-hover:visible absolute w-full text-lg xs:text-base leading-tight px-3 py-2 pointer-events-none bg-white text-slate-600 border border-slate-600 rounded-lg z-10">
                    If the platform uses an exchange rate of 9.7 currency-units to 1 USDC, while the market rate is 10 currency-units to 1 USDC, then the customer effectively pays
                    an additional 3% in "hidden fees", which the company takes as profit.
                  </div>
                </span>
                ). Ling Pay helps businesses set up true peer-to-peer (P2P) payments, meaning payment is sent directly from the customer to the business with no middlemen.
                Therefore, it is impossible for us to take fees or profit from giving bad exchange rates. With Ling Pay, you and your customers pay 0% fees{" "}
                <span className="underline underline-offset-2">forever</span>.
              </div>
            </div>
          </div>
          {/*---five---*/}
          <div className="advantageHeader flex">
            <Image src="/checkmark.svg" alt="checkmark" width={24} height={24} className="mr-2.5" />
            <div>
              You can integrate with any PoS system or website
              <span
                onClick={() => {
                  setToggleFive(!toggleFive);
                  setToggleOne(false);
                  setToggleTwo(false);
                  setToggleThree(false);
                  setToggleFour(false);
                }}
                className="advantageLearnWord"
              >
                details
                <FontAwesomeIcon icon={toggleFive ? faAngleUp : faAngleDown} className="ml-1 align-middle" />
              </span>
              <div className={`${toggleFive ? "max-h-[350px]" : "max-h-0"} overflow-hidden transition-all duration-500 advantageBody flex flex-col`}>
                <div className="my-2 flex border border-white rounded-[4px] text-lg lg:text-base cursor-pointer text-center">
                  <div
                    className={`${onsite ? "bg-white text-blue-800" : ""}  w-1/2 rounded-l-[2px]`}
                    onClick={() => {
                      setOnsite(true);
                      setOnline(false);
                    }}
                  >
                    In-Store payments
                  </div>
                  <div
                    className={`${online ? "bg-white text-blue-800" : ""} w-1/2 rounded-r-[2px]`}
                    onClick={() => {
                      setOnline(true);
                      setOnsite(false);
                    }}
                  >
                    Online payments
                  </div>
                </div>
                {onsite && (
                  <div>
                    Simply record each payment in your PoS system as a cash payment. You can verify payment (or refund payment) with the Ling Pay App, which can be downloaded to
                    any tablet/phone or accessed through a web browser.
                  </div>
                )}
                {online && (
                  <div>
                    When you sign up, you will be given a payment link, which you can use to create a "Pay with MetaMask" button on your website. When a customer clicks it, the
                    Ling Pay payment interface will open. The customer will then be asked to{" "}
                    <span className="underline underline-offset-2">copy the item names and final prices from your official website and paste them into this interface</span>. After
                    the customer sends payment, an email with the purchase details will be sent to you. This payment flow allows integration of Ling Pay to any website.
                  </div>
                )}
              </div>
            </div>
          </div>
          {/*---two---*/}
          <div className="advantageHeader flex">
            <Image src="/checkmark.svg" alt="checkmark" width={24} height={24} className="mr-2.5" />
            <div>
              You can set up free in 5 minutes
              <span
                onClick={() => {
                  setToggleTwo(!toggleTwo);
                  setToggleOne(false);
                  setToggleThree(false);
                  setToggleFour(false);
                  setToggleFive(false);
                }}
                className="advantageLearnWord"
              >
                details
                <FontAwesomeIcon icon={toggleTwo ? faAngleUp : faAngleDown} className="ml-1 align-middle" />
              </span>
              <div className={`${toggleTwo ? "max-h-[300px]" : "max-h-0"} overflow-hidden transition-all duration-500 advantageBody`}>
                Setting up just takes 5 minutes! Our payment interface is designed to make the payment experience fast and intuitive. This interface is entirely free for anyone to
                use. Blockchains are public and free infrastructure and we don't believe in adding unneccessary costs just to use it. Our add-on features costs $0-5/month and are
                optional.
              </div>
            </div>
          </div>
          {/*---three---*/}
          <div className="advantageHeader flex">
            <Image src="/checkmark.svg" alt="checkmark" width={24} height={24} className="mr-2.5" />
            <div>
              You can connect to the Top 5 chains
              <span
                onClick={() => {
                  setToggleThree(!toggleThree);
                  setToggleOne(false);
                  setToggleTwo(false);
                  setToggleFour(false);
                  setToggleFive(false);
                }}
                className="advantageLearnWord"
              >
                details
                <FontAwesomeIcon icon={toggleThree ? faAngleUp : faAngleDown} className="ml-1 align-middle" />
              </span>
              <div className={`${toggleThree ? "max-h-[300px]" : "max-h-0"} overflow-hidden transition-all duration-500 advantageBody`}>
                Some payment platforms only integrate 1 or 2 blockchains because of business partnerships. We are chain agnostic and will always integrate the Top 5 most popular
                chains, so businesses can always reach the most number of blockchain users possible.
              </div>
            </div>
          </div>

          {/*---four---*/}
          <div className="advantageHeader flex">
            <Image src="/checkmark.svg" alt="checkmark" width={24} height={24} className="mr-2.5" />
            <div>
              Our system is innately secure
              <span
                onClick={() => {
                  setToggleFour(!toggleFour);
                  setToggleOne(false);
                  setToggleTwo(false);
                  setToggleThree(false);
                  setToggleFive(false);
                }}
                className="advantageLearnWord"
              >
                details
                <FontAwesomeIcon icon={toggleFour ? faAngleUp : faAngleDown} className="ml-1 align-middle" />
              </span>
              <div className={`${toggleFour ? "max-h-[300px]" : "max-h-0"} overflow-hidden transition-all duration-500 advantageBody`}>
                Tokens are sent from address to address. No smart contracts are involved, so hackers cannot take advantage of code vulnerabilities. With our Automation Package,
                money can be withdrawn to your bank daily to minimize the amount of money on the blockchain. A simple system means fewer points for attack.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
