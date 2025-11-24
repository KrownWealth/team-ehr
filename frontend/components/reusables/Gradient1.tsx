import React from "react";

function Gradient1() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-30 pointer-events-none"></div>
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-accent opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-secondary opacity-15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-foreground opacity-5 rounded-full blur-2xl pointer-events-none"></div>
    </>
  );
}

export default Gradient1;
