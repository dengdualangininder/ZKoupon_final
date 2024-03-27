"use client";
import Image from "next/image";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

const PWA = ({ browser }: { browser: string }) => {
  // useEffect(()=>{},[])
  if (/Android/i.test(navigator.userAgent)) {
    var os = "android";
  } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    var os = "ios";
  } else {
    var os = "other";
  }

  return (
    <div className="h-[100dvh] text-lg text-gray-700 flex flex-col items-center justify-center">
      {/*---image---*/}
      <div className="relative h-[300px] w-[150px] drop-shadow-lg p-2">
        <Image src="/PWA.png" alt="phone" fill />
      </div>
      {/*---text---*/}
      <div className="mt-10 flex flex-col items-center">
        <div className="text-center text-3xl font-bold">Add To Home Screen</div>
        <div className="text-lg w-[330px] px-2">
          <div className="mt-3">To install the App, you need to add this website to your home screen.</div>
          <div className="mt-2">
            In your browser{browser === "Safari" ? " menu" : ""}, tap the{" "}
            {os === "ios" ? (
              <span>
                Share icon (<FontAwesomeIcon icon={faArrowUpFromBracket} className="mx-0.5" />) {browser === "Chrome" ? "(top right)" : ""}
              </span>
            ) : (
              <span>
                menu icon (<FontAwesomeIcon icon={faEllipsisVertical} className="mx-1" />)
              </span>
            )}{" "}
            and choose <span className="font-bold">Add to Home Screen</span>. Then open the saved website on your home screen.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWA;
