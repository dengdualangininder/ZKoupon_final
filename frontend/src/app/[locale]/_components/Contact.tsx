"use client";
import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

const Contact = () => {
  return (
    <div id="supportEl" className="homeSectionSize flex flex-col items-center">
      {/*---Header---*/}
      <div className="homeHeaderFont">Support</div>
      {/*---Content---*/}
      <div className="homeBodyFont mt-10 w-full xl:max-w-[810px] md:text-center">
        For helpful information, read the “Instructions” in the Flash app’s “Settings” menu or the “How It Works” and “Learning Center” sections on this website. For further
        assistance, email support@flashpayments.xyz
      </div>
    </div>
  );
};

export default Contact;
