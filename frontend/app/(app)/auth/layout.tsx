export default function CareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col p-12 relative overflow-hidden bg-primary text-primary-foreground">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-30 pointer-events-none"></div>

        {/* Subtle layered shapes */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-accent opacity-20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-secondary opacity-15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-foreground opacity-5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top-left content */}
        <div className="relative z-10">
          <h1 className="text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            WE CARE EHR
          </h1>
          <p className="text-xl max-w-md leading-relaxed">
            Our goal is to continuously improve the quality and accessibility of public healthcare services using digital tools.
          </p>
        </div>
      </div>

      {/* Right content / auth form */}
      <div className="flex-1 flex items-center justify-center bg-background">
        {children}
      </div>
    </div>
  );
}
