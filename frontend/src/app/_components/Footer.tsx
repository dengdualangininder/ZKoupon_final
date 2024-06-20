"use client";

const Footer = () => {
  const handleOnNavClick = (e: any) => {
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
    <div className="flex flex-col-reverse sm:flex-row items-center py-8 sm:pt-12 sm:py-16 text-lg sm:text-xl text-white">
      {/*---copyright---*/}
      <div className="flex justify-center items-center sm:w-1/3">
        <div className="text-center mt-6 sm:mt-0">&copy; 2023 Ling Pay</div>
      </div>
      {/*---links---*/}
      <div className="flex justify-evenly w-full sm:w-2/3">
        {/*---column 1---*/}
        <div className="flex flex-col space-y-4">
          {navLinks.map((navLink, index) => (
            <div className={`text-xl cursor-pointer`} id={navLink.id} key={index} onClick={handleOnNavClick}>
              {navLink.title}
            </div>
          ))}
        </div>
        {/*---column 2---*/}
        <div className="flex flex-col space-y-4">
          <div className="underline">Contact Us</div>
          <div className="">contact@lingpay.io</div>
          <div className="hover:cursor-pointer hover:text-slate-600">
            <a href="https://discord.gg/ERW5d8aF" target="_blank">
              Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Footer;
