import { ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white">
      <Navbar />
      <main>{children}</main>
      <br />
      <br />
      <Footer />
    </div>
  );
}

export default Layout;
