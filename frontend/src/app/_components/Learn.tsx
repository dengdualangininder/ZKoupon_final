"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube, faAngleDown, faAngleUp, faWallet, faHandHoldingDollar } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

import Learn4 from "./learn/Learn4";
import Learn5 from "./learn/Learn5";
import Learn6 from "./learn/Learn6";

const Learn = () => {
  const [read, setRead] = useState("");

  const columnOne = [
    { id: "lesson1", title: "Lesson 1", subtitle: "What is a blockchain?", fa: faCube },
    { id: "lesson2", title: "Lesson 2", subtitle: "What is a blockchain account?", fa: faWallet },
    { id: "lesson3", title: "Lesson 3", subtitle: "How do I send or receive tokens?", fa: faHandHoldingDollar },
  ];
  const columnTwo = [
    { id: "lesson4", title: "Lesson 4", subtitle: "Are tokens real money?", fa: faCube },
    { id: "lesson5", title: "Lesson 5", subtitle: "What is a cryptocurrency exchange?", fa: faWallet },
    { id: "lesson6", title: "Lesson 6", subtitle: "How does Flash fit in?", fa: faHandHoldingDollar },
  ];
  return (
    <div id="learnEl" className="w-[1250px] py-[80px] flex flex-col items-center">
      <div className="homepageHeaderFont text-center">Learning Center</div>
      <div className="mt-8 mb-8 md:mb-12 text-lg text-slate-700 text-center sm:w-[440px] lg:w-auto">In 6 short lessons, we teach you the basics of blockchain.</div>
      <div className="w-full xs:w-[90%] sm:w-[70%] md:w-[90%] flex flex-col md:flex-row justify-center">
        <div className="flex flex-col md:w-1/2 md:mr-4">
          {columnOne.map((i, index) => (
            <div className={`learnContainer ${index == 0 ? "border-t-2" : ""}`}>
              {/*---content (left) ---*/}
              <div className="flex items-center">
                <FontAwesomeIcon className="learnIcon" icon={i.fa} />
                <div>
                  <div className="learnLessonWord">{i.title}</div>
                  <div className="learnLessonTitle">{i.subtitle}</div>
                </div>
              </div>
              {/*--- learn/arrow (right) ---*/}
              <div onClick={() => setRead(i.id)} className="mr-4 flex items-center">
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
            </div>
          ))}
        </div>
        <div className="flex flex-col md:w-1/2 md:ml-4">
          <Learn4 />
          <Learn5 />
          <Learn6 />
        </div>
      </div>
    </div>
  );
};

export default Learn;
