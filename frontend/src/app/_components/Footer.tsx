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
    <div className="w-[70%] py-[100px] flex justify-between">
      {/*--- logo + copyright---*/}
      <div className="flex flex-col justify-between">
        <div className="relative w-[140px] h-[80px]">
          <Image src="logoBlackBg.svg" alt="Flash" fill />
        </div>
        <div className="text-xs text-center ">&copy; 2024 Flash Payments. All rights reserved.</div>
      </div>
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
      {/*--- Socials ---*/}
      <div className="hidden">
        <div>Facebook</div>
        <div>Twitter</div>
        <div>Discord</div>
      </div>
      {/*--- spaceer ---*/}
      <div></div>
    </div>
  );
};
export default Footer;
