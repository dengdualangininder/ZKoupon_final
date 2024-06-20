"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube, faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

const LearnOne = () => {
  const [read, setRead] = useState(false);

  return (
    <div className="learnContainer border-t-2">
      {/*---content (left) ---*/}
      <div className="flex items-center">
        <FontAwesomeIcon className="learnIcon" icon={faCube} />
        <div>
          <div className="learnLessonWord">Lesson 1</div>
          <div className="learnLessonTitle">What is a blockchain?</div>
        </div>
      </div>
      {/*--- learn/arrow (right) ---*/}
      <div onClick={() => setRead(!read)} className="mr-4 flex items-center">
        <div className="learnLearnWord">Learn</div>
        <span className="pt-2">
          {read ? (
            <FontAwesomeIcon icon={faAngleUp} className="text-xl ml-2" />
          ) : (
            <span>
              <FontAwesomeIcon icon={faAngleDown} className="text-xl ml-2" />
            </span>
          )}
        </span>
      </div>

      <div className={`${read ? "block" : "hidden"} learnChip mt-1 relative`}>
        <div>
          <span className="font-bold">Blockchains</span> are like banks.
        </div>
        <div className="mt-2 sm:mt-3">A bank could be thought of as simply a database. This database stores information on how many currency units (USD, EUR, YEN) an account has. The database is secured and controlled by bank employees.</div>
        <div className="mt-2 sm:mt-3">
          A blockchain is a{" "}
          <span className="link group">
            decentralized
            <div className="w-[90%] text-base p-2 pointer-events-none absolute invisible group-hover:visible leading-tight bg-slate-100 text-slate-600 border border-slate-600 rounded-lg">
              This "decentralized" database exists on thousands of servers globally, and is controlled and validated by tens of thousands of individuals who are incentivized to maintain accurate records. Therefore, no one entity can alter the
              database for personal profit.
            </div>
          </span>{" "}
          database that stores information on how many <span className="font-bold">tokens</span> (USDC, USDT, BTC) an account has. Tokens can be real money. For example, the USDC and USDT tokens have the value of 1 USD.
        </div>
        <div className="mt-2 sm:mt-3">For the last 10 years, &gt; $30 trillion has been transacted on the top blockchains without a single hack. These blockchain-based databases have proven to be very secure.</div>
        <div className="mt-2 sm:mt-3">
          Hundreds of blockchains exist today. We recommend you visit{" "}
          <a href="https://defillama.com/chains" target="_blank" className="link">
            DeFiLlama
          </a>{" "}
          and become familiar with the names of the Top 5 chains.
        </div>
      </div>
    </div>
  );
};

export default LearnOne;
