"use client";

import Image from "next/image";

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[85svh] w-full">
      <div className="text-center">
        <Image
          src={"/images/icon.png"}
          width={142}
          height={142}
          priority
          alt="WCE"
          className="w-20 animate-pulse"
        />
      </div>
    </div>
  );
}

export default Loader;
