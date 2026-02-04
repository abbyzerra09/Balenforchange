"use client";
import { useState, useEffect } from 'react';
import candidatesData from './data/candidates.json';
import { db } from './firebase';
import { doc, onSnapshot, updateDoc, increment, setDoc, collection } from "firebase/firestore";
import confetti from 'canvas-confetti'; 
// Import Lucide Icons
import { Facebook, Instagram, Music2 } from 'lucide-react';

export default function BalenRevolution2026() {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [bellCount, setBellCount] = useState(0);
  const [hasRung, setHasRung] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedId, setVotedId] = useState(null); 
  const [popup, setPopup] = useState({ show: false, message: "" });
  const [voteCounts, setVoteCounts] = useState({});

  const maxVotes = Math.max(...Object.values(voteCounts), 1);

  useEffect(() => {
    const electionDate = new Date("March 5, 2026 07:00:00").getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = electionDate - now;
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    const unsubBell = onSnapshot(doc(db, "stats", "election_data"), (snapshot) => {
      if (snapshot.exists()) setBellCount(snapshot.data().bell_count || 0);
    });

    const unsubVotes = onSnapshot(collection(db, "votes"), (snapshot) => {
      const counts = {};
      snapshot.forEach((doc) => { counts[doc.id] = doc.data().vote_count || 0; });
      setVoteCounts(counts);
    });

    setHasRung(localStorage.getItem("user_has_rung") === "true");
    const savedVoteId = localStorage.getItem("user_voted_id");
    if (savedVoteId) {
      setHasVoted(true);
      setVotedId(savedVoteId);
    }

    return () => { clearInterval(timer); unsubBell(); unsubVotes(); };
  }, []);

  const handleRingBell = async () => {
    if (hasRung) return;
    setIsRinging(true);
    setHasRung(true);
    localStorage.setItem("user_has_rung", "true");
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#3b82f6', '#ffffff'] });
    try {
      await updateDoc(doc(db, "stats", "election_data"), { bell_count: increment(1) });
    } catch (e) { console.error(e); }
    setTimeout(() => setIsRinging(false), 1000);
  };

  const handleVote = async (candidateName, candidateId) => {
    if (hasVoted) {
      showToast("❌ One person, one vote. That's the revolution.");
      return;
    }
    try {
      const candidateRef = doc(db, "votes", candidateId.toString());
      await setDoc(candidateRef, { name: candidateName, vote_count: increment(1) }, { merge: true });

      setHasVoted(true);
      setVotedId(candidateId.toString());
      localStorage.setItem("user_voted_id", candidateId.toString());
      
      confetti({ particleCount: 200, velocity: 30, spread: 360, origin: { y: 0.5 } });
      showToast(`✅ Change is coming! You voted for ${candidateName}`);
    } catch (e) {
      showToast("⚠️ Connection error. Try again.");
    }
  };

  const showToast = (msg) => {
    setPopup({ show: true, message: msg });
    setTimeout(() => setPopup({ show: false, message: "" }), 4000);
  };

  const filteredCandidates = searchTerm.trim() === ""
    ? []
    : candidatesData.filter(c =>
        c.constituency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 selection:bg-blue-500 pb-20 overflow-x-hidden">
      
      {/* 🌐 TOP SOCIAL BAR */}
      <div className="w-full bg-black/60 backdrop-blur-md border-b border-white/5 py-3 px-6 flex justify-between items-center fixed top-0 z-100">
        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase hidden md:block">
          Connect with the Revolution
        </span>
        <div className="flex items-center gap-6 mx-auto md:mx-0">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mr-2">Follow:</span>
          <a href="https://www.facebook.com/rohit.thapa.44365" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors">
            <Facebook size={18} />
          </a>
          <a href="https://www.instagram.com/yccm_rohit/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors">
            <Instagram size={18} />
          </a>
          <a href="https://www.tiktok.com/@rohit_thapa09" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">
            <Music2 size={18} /> 
          </a>
        </div>
      </div>

      {/* 📩 TOAST NOTIFICATION */}
      {popup.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-100 animate-bounce">
          <div className="bg-blue-600 border-2 border-blue-400 px-8 py-3 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center gap-3">
            <span className="font-bold text-sm md:text-base">{popup.message}</span>
          </div>
        </div>
      )}

      {/* 🔔 FLOATING BELL HUB */}
      <div className="sticky top-20 z-50 w-full flex justify-center pointer-events-none">
        <div className="pointer-events-auto group bg-black/40 backdrop-blur-3xl border border-white/10 p-1 rounded-full flex items-center pr-6 shadow-2xl transition-transform hover:scale-105">
          <button
            onClick={handleRingBell}
            disabled={hasRung}
            className={`text-3xl p-4 rounded-full transition-all ${isRinging ? 'animate-ring' : ''} ${hasRung ? 'opacity-40 grayscale' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'}`}
          >
            {hasRung ? "🔕" : "🔔"}
          </button>
          <div className="flex flex-col ml-4">
            <span className="text-2xl font-black font-mono leading-none">{bellCount.toLocaleString()}</span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-blue-400 font-bold">Patriot Rings</span>
          </div>
        </div>
      </div>

      <header className="relative pt-24 md:pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-125 bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-pulse">
            Live Election Countdown
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-5">
          BALEN FOR <span className="bg-linear-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent ">PM</span>
        </h1>
        <p className='text-md md:text-2xl font-serif'>Time Remained for the Election</p>
        <div className="flex justify-center gap-3 md:gap-6 mt-8">
          {[
            { label: 'Days', val: timeLeft.days },
            { label: 'Hrs', val: timeLeft.hours },
            { label: 'Mins', val: timeLeft.mins },
            { label: 'Secs', val: timeLeft.secs }
          ].map((t) => (
            <div key={t.label} className="group relative">
              <div className="bg-white/5 border border-white/10 backdrop-blur-md w-16 md:w-24 py-4 rounded-3xl transition-all group-hover:border-blue-500/50 group-hover:-translate-y-1">
                <div className="text-2xl md:text-4xl font-black text-white">{String(t.val).padStart(2, '0')}</div>
                <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">{t.label}</div>
              </div>
            </div>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <div className="max-w-xl mx-auto mb-16 relative group">
          <input
            type="text"
            placeholder="Search District or Candidate..."
            className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-xl outline-none focus:ring-4 ring-blue-500/20 focus:bg-white/10 transition-all text-center"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-0 -z-10 bg-blue-500/5 blur-2xl group-focus-within:bg-blue-500/10 transition-all"></div>
        </div>

        {searchTerm.trim() === "" ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
            <div className="text-8xl opacity-10 mb-6">🗳️</div>
            <p className="text-slate-500 font-medium tracking-wide">Enter your district to start the revolution</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCandidates.map(c => {
              const currentVotes = voteCounts[c.id] || 0;
              const progressWidth = (currentVotes / maxVotes) * 100;
              
              return (
                <div key={c.id} className="group relative bg-linear-to-b from-white/5 to-transparent border border-white/10 p-8 rounded-[2.5rem] hover:border-blue-500/40 transition-all duration-500 hover:-translate-y-2">
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Support Momentum</span>
                      <span className="text-xs font-mono font-bold">{currentVotes} Votes</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-3xl font-bold group-hover:text-blue-400 transition-colors">{c.name}</h3>
                        <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap">{c.constituency}</span>
                    </div>
                    {/* FIXED: Explicitly calling c.role */}
                    <p className="text-blue-500 font-bold text-xs uppercase tracking-tighter mt-1">{c.role}</p>
                  </div>

                  {/* AGAINST SECTION */}
                  <div className="mb-6 flex flex-col items-center">
                    <div className="w-full flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-white/10"></div>
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">The Battle</span>
                      <div className="h-px flex-1 bg-white/10"></div>
                    </div>
                    <div className="w-full bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex flex-col items-center group-hover:bg-red-500/10 transition-colors">
                      <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-tighter mb-1">Challenging</span>
                      <span className="text-xl font-black text-slate-200 tracking-tight text-center">
                        {c.against || "Traditional Elite"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <p className="text-sm text-slate-300 leading-relaxed italic p-4 bg-white/5 rounded-2xl border-l-4 border-blue-500">
                      {/* FIXED: fallback between highlight and highlights to prevent empty strings */}
                      "{c.highlights || c.highlight}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleVote(c.name, c.id)}
                    disabled={hasVoted}
                    className={`w-full font-black py-5 rounded-3xl transition-all flex items-center justify-center gap-3 overflow-hidden relative
                      ${votedId === c.id.toString() 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                        : hasVoted 
                          ? 'bg-slate-900 text-slate-600 opacity-50 cursor-not-allowed' 
                          : 'bg-white text-black hover:bg-blue-500 hover:text-white active:scale-95'}`}
                  >
                    {votedId === c.id.toString() ? "SECURED ✅" : hasVoted ? "VOTE REGISTERED" : "CAST VOTE"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-32 py-12 border-t border-white/5 text-center">
        <p className="text-[10px] tracking-[0.5em] text-slate-500 font-black uppercase mb-2">Developed in the HOPE of Change</p>
        <p className="text-sm font-medium text-slate-400">@Rohitthapa • Jhapali Revolution 🇳🇵</p>
      </footer>

      <style jsx global>{`
        @keyframes ring {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-10deg); }
        }
        .animate-ring { animation: ring 0.6s ease-in-out infinite; }
        body { background: #060910; }
      `}</style>
    </div>
  );
}