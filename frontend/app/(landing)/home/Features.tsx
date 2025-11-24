import React from "react";
import {
  Users,
  Brain,
  Clock,
  Wifi,
  ShieldCheck,
  Database,
  Search,
  Check,
  Activity,
  QrCode,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Search,
      title: "Find any patient in 3 seconds",
      description:
        "Paper folders get lost. Digital records don't. Search by name, phone, or NIN and pull up a complete medical history instantly.",
      className: "md:col-span-2 lg:col-span-1",
      shapes: (
        <div className="relative h-full w-full flex items-center justify-center">
          <div className="absolute w-48 h-32 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-md border border-white/20 rounded-xl rotate-[-6deg] translate-x-[-10px] translate-y-[-10px] shadow-lg"></div>
          <div className="absolute w-48 h-32 bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-md border border-white/30 rounded-xl rotate-[-3deg] translate-x-[-5px] translate-y-[-5px] shadow-lg"></div>
          <div className="relative w-48 h-32 bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-xl border border-white/50 rounded-xl shadow-xl flex flex-col p-4 gap-3">
            <div className="flex items-center gap-3 border-b border-primary/10 pb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div className="h-2 w-20 bg-primary/20 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-primary/10 rounded-full"></div>
              <div className="h-1.5 w-2/3 bg-primary/10 rounded-full"></div>
            </div>
            <div className="absolute bottom-3 right-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Search className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Brain,
      title: "A second pair of eyes",
      description:
        "Doctors get tired. The system doesn't. It flags abnormal vitals and drug allergies automatically before you prescribe.",
      className: "",
      shapes: (
        <div className="relative h-full w-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border border-primary/20 animate-spin-slow"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-dashed border-primary/30 animate-spin-reverse-slow"></div>
          </div>

          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl shadow-green-900/5 flex items-center justify-center">
            <Brain className="text-primary w-8 h-8" />
          </div>

          <div className="absolute top-12 right-10 px-3 py-1.5 bg-white/30 backdrop-blur-md border border-white/40 rounded-lg shadow-lg">
            <Check className="w-4 h-4 text-primary" />
          </div>
          <div className="absolute bottom-12 left-10 px-3 py-1.5 bg-white/30 backdrop-blur-md border border-white/40 rounded-lg shadow-lg">
            <Activity className="w-4 h-4 text-primary" />
          </div>
        </div>
      ),
    },
    {
      icon: Clock,
      title: "Order in the waiting room",
      description:
        "Stop the chaos. Digital screens show exactly who is next. Touts and line-jumpers are a thing of the past.",
      className: "",
      shapes: (
        <div className="relative h-full w-full flex items-center justify-center gap-4">
          <div className="w-16 h-20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center scale-90 opacity-50">
            <span className="text-2xl font-bold text-green-900/30">03</span>
          </div>

          <div className="relative w-20 h-24 bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-xl border border-white/50 rounded-xl shadow-2xl flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-500">
            <div className="absolute -top-3 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg shadow-primary/20">
              NOW
            </div>
            <span className="text-4xl font-bold text-green-800">04</span>
          </div>

          <div className="w-16 h-20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center scale-90 opacity-50">
            <span className="text-2xl font-bold text-green-900/30">05</span>
          </div>
        </div>
      ),
    },
    {
      icon: Wifi,
      title: "No internet? No problem.",
      description:
        "Don't let network failures stop your clinic. Work offline all day, and we'll sync everything when the connection returns.",
      className: "md:col-span-2 lg:col-span-1",
      shapes: (
        <div className="relative h-full w-full flex items-center justify-center">
          <div className="relative z-10 p-6 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <div className="flex gap-2 items-end h-12">
              <div className="w-3 bg-primary rounded-sm h-4 opacity-100"></div>
              <div className="w-3 bg-primary rounded-sm h-7 opacity-100"></div>
              <div className="w-3 border-2 border-primary/30 bg-transparent rounded-sm h-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
              </div>
              <div className="w-3 border-2 border-primary/30 bg-transparent rounded-sm h-6"></div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/10">
              <Database className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-green-800">
                Local Mode
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: ShieldCheck,
      title: "Fake drugs stop here",
      description:
        "Every prescription gets a secure QR code. Pharmacies can scan it to verify authenticity instantly.",
      className: "md:col-span-2",
      shapes: (
        <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>

          <div className="flex items-center gap-12 relative z-10">
            <div className="w-40 h-48 bg-gradient-to-br from-white/60 to-white/10 backdrop-blur-xl border border-white/40 rounded-xl p-4 shadow-xl rotate-[-6deg] transition-transform hover:rotate-0 duration-500">
              <div className="w-8 h-8 bg-primary/20 rounded-lg mb-3"></div>
              <div className="space-y-2 mb-6">
                <div className="h-2 w-full bg-green-900/5 rounded-full"></div>
                <div className="h-2 w-3/4 bg-green-900/5 rounded-full"></div>
              </div>
              <div className="mt-auto flex justify-end">
                <QrCode className="w-12 h-12 text-green-800 opacity-80" />
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg border border-primary/30 rounded-2xl shadow-2xl rotate-6">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="Features"
      className="py-24 px-4 md:px-6 relative bg-slate-50/50"
    >
      <div className="max-w-screen-2xl mx-auto space-y-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-slate-900">
            Built for the reality of <br />
            <span className="text-primary">Nigerian healthcare.</span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            We didn't just build an EHR. We built a system that handles power
            outages, spotty internet, and crowded waiting rooms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative rounded-3xl bg-white hover:bg-green-50/30 border border-slate-200 hover:border-green-200 transition-all duration-300 p-6 md:p-8 overflow-hidden flex flex-col justify-between h-[400px] ${feature.className}`}
              >
                <div className="relative h-54 w-full flex items-center justify-center mb-6">
                  {feature.shapes}
                </div>

                <div className="relative z-10 space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
