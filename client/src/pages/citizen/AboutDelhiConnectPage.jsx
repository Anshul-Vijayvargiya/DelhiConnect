import Layout from '../../components/Layout';

export default function AboutDelhiConnectPage() {
  return (
    <Layout title="About DelhiConnect">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#1A3A6B] to-[#254F8C] text-white p-8">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🏛️</span>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Understanding DelhiConnect</h2>
              <p className="text-blue-200 text-sm mt-1">
                Empowering Delhi citizens with transparent, trackable, and efficient civic governance.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Section 1: What is DelhiConnect */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-2xl">📢</span>
              <h3 className="text-xl font-bold text-slate-800">What is DelhiConnect?</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Inspired by successful civic platforms used in cities around the world, 
              DelhiConnect is a centralized platform for non-emergency municipal complaints. 
              Instead of running between various government departments, citizens can report local civic issues—such as potholes, 
              broken streetlights, garbage heaps, or water supply disruptions—through a single portal. 
              It brings government accountability directly to your fingertips.
            </p>
          </section>

          {/* Section 2: How DelhiConnect Works */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-2xl">⚙️</span>
              <h3 className="text-xl font-bold text-slate-800">How to Use DelhiConnect (Step-by-Step)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 hover:shadow-md transition">
                <div className="text-3xl mb-3">📝</div>
                <h4 className="font-bold text-slate-800 mb-2">1. File Grievance</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Go to the home page, select the problem category, describe the issue, upload a photo, and mark your location using GPS. 
                  Our integrated Gemini AI will categorize the problem and assign it to the appropriate department.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 hover:shadow-md transition">
                <div className="text-3xl mb-3">🕵️</div>
                <h4 className="font-bold text-slate-800 mb-2">2. Track in Real-Time</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Once submitted, you receive a unique Grievance ID (e.g. GR-XXXXX). 
                  Track status updates online or via automatic WhatsApp alerts as it is routed and assigned to field officers.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 hover:shadow-md transition">
                <div className="text-3xl mb-3">🚀</div>
                <h4 className="font-bold text-slate-800 mb-2">3. Resolution & Closure</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The assigned officer uploads photo proof once the work is completed. 
                  You can mark the complaint as satisfied to close it, or reopen it if you're not satisfied with the fix.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Status Labels Guide */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-2xl">🚦</span>
              <h3 className="text-xl font-bold text-slate-800">Understanding Status Labels</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              DelhiConnect uses transparent status labels to indicate exactly where your grievance stands in the resolution pipeline:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3 items-start p-4 border border-green-100 bg-green-50/20 rounded-xl">
                <span className="text-xs bg-green-500 text-white font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                  New / Un-Assigned
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Grievance Registered</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    The complaint has been successfully recorded in the DelhiConnect system and is currently being routed to the appropriate department and zone officer.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-4 border border-amber-100 bg-amber-50/20 rounded-xl">
                <span className="text-xs bg-amber-500 text-white font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                  In Progress
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Active Work</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    The grievance has been allocated to a specific field officer. Action plans or physical repairs are actively underway at the location.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-4 border border-blue-100 bg-blue-50/20 rounded-xl">
                <span className="text-xs bg-blue-500 text-white font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                  Closed / Complied
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Issue Resolved</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    The complaint has been resolved by the officer, and verified by the citizen. The case is now archived.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-4 border border-red-100 bg-red-50/20 rounded-xl">
                <span className="text-xs bg-red-500 text-white font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                  Overdue
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">SLA Breached</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    The time allowed under government service level agreements (SLAs) has passed without a resolution. These items are immediately highlighted for senior administrative review.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Links */}
          <section className="bg-slate-50 rounded-xl p-5 border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Need more information?</h4>
              <p className="text-xs text-slate-500 mt-0.5">Explore our frequently asked questions or view terms of usage.</p>
            </div>
            <div className="flex gap-3">
              <a href="#faq" onClick={(e) => { e.preventDefault(); alert("FAQ is under construction."); }} className="btn-secondary text-xs">
                ❓ View FAQ
              </a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms of Use are under construction."); }} className="btn-secondary text-xs">
                📄 Terms of Use
              </a>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
