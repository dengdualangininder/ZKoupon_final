"use client";
import Image from "next/image";

const Footer = () => {
  const onClickLink = (e: any) => {
    document.getElementById(`${e.target.id}El`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navLinks = [
    {
      id: "overview",
      title: "How It Works",
    },
    {
      id: "advantage",
      title: "Why Use Flash",
    },
    {
      id: "learn",
      title: "Learning Center",
    },
  ];

  return (
    <div className="w-full lg:w-[760px] xl:desktop:w-[800px] py-[80px] flex flex-col-reverse items-center lg:flex-row lg:items-start lg:justify-between">
      {/*--- logo + copyright---*/}
      <div className="mt-20 lg:mt-0 lg:w-1/3 lg:h-full flex flex-col items-center lg:items-start lg:justify-between">
        <div className="relative w-[140px] h-[80px]">
          <Image src="logoWhiteNoBg.svg" alt="Flash" fill />
        </div>
        <div className="mt-6 lg:mt-0 text-sm lg:text-xs">&copy; 2024 Flash Payments. All rights reserved.</div>
      </div>
      <div className="homeFontBody w-full flex lg:w-2/3 justify-evenly lg:justify-around">
        {/*--- Company ---*/}
        <div className="flex flex-col space-y-5 text-lg">
          <div className="footerHeader">Company</div>
          <div className="footerLink">About Us</div>
        </div>
        {/*--- Links ---*/}
        <div className="flex flex-col space-y-5 text-lg">
          <div className="footerHeader">Links</div>
          {navLinks.map((navLink, index) => (
            <div className="footerLink" id={navLink.id} key={index} onClick={onClickLink}>
              {navLink.title}
            </div>
          ))}
        </div>
      </div>
      {/*--- Socials ---*/}
      {/* <div className="hidden">
        <div>Facebook</div>
        <div>Twitter</div>
        <div>Discord</div>
      </div> */}
      {/*--- spaceer ---*/}
      <div></div>
    </div>
  );
};
export default Footer;
