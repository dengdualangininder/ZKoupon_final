"use client";
import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

const Contact = () => {
  return (
    <div id="supportEl" className="w-[77%] py-[100px] flex flex-col items-center">
      {/*---Header---*/}
      <div className="homepageHeaderFont">Support</div>
      {/*---Content---*/}
      <div className="mt-10 w-[696px] leading-relaxed text-xl text-center">
        For helpful information, read the “Instructions” in the Flash app’s “Settings” menu or the “How It Works” and “Learning Center” sections on this website. For further
        assistance, email support@flashpayments.xyz
      </div>
    </div>
  );
};

export default Contact;
