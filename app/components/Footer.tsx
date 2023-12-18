import React from "react";

const Footer = () => {
  return (
    <footer className="pt-12 border-t border-white my-8">
      <div className="w-full flex">
        <div className="w-[30%]">
          <div className="flex items-center">
            <div className="w-[40px] h-[40px] bg-gray-100 rounded-full mr-4"></div>
            <div className="text-4xl font-bold">F2M</div>
          </div>
        </div>

        <div className="w-[70%]">
          <div className="flex justify-center space-x-20">
            <div>
              <div className="font-bold mb-4">About</div>
              <div className="space-y-2">
                {["Company", "FAQs", "News"].map((i) => (
                  <div>{i}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold mb-4">Resources</div>
              <div className="space-y-2">
                {["Tips for Creators", "Blog"].map((i) => (
                  <div>{i}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold mb-4">Support</div>
              <div className="space-y-2">
                {["Customer Support", "Blog - Updates", "Terms & Conditions", "Privacy Policy"].map((i) => (
                  <div>{i}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <div className="flex space-x-4">
          {["telegram", "twitter", "facebook", "instagram"].map((i) => (
            <div>{i}</div>
          ))}
        </div>
        <div>Copyright 2023 All Rights Reserved</div>
      </div>
    </footer>
  );
};

export default Footer;
