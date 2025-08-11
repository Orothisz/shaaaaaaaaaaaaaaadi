import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Heart, Calendar, MapPin, Send, Camera, Clock, X } from "lucide-react";

/**
 * Fully animated single‑file wedding invitation website
 * — Tech: React + TailwindCSS + Framer Motion (works in Canvas)
 *
 * Quick edits:
 *  - COUPLE = "Madhav & Namya"
 *  - DATE_ISO = "2025-12-20T18:00:00+05:30" // Ceremony start (IST)
 *  - VENUE_NAME / VENUE_ADDR / GOOGLE_MAPS_URL
 *  - PRIMARY / ACCENT brand colors via Tailwind classes
 */

const COUPLE = "Madhav & Namya";
const DATE_ISO = "2025-12-20T18:00:00+05:30";
const VENUE_NAME = "Greev Valley FBD";
const VENUE_ADDR = "RPS Green Valley, Faridabad — Haryana";
const GOOGLE_MAPS_URL = "https://www.google.com/maps/dir//RPS+Green+Valley,+Sector+42,+Faridabad,+Haryana/@28.4722754,77.2926726,16z/data=!4m9!4m8!1m0!1m5!1m1!1s0x390ce73789af522b:0x8ea6628776cf3302!2m2!1d77.2972601!2d28.4724444!3e0?entry=ttu"; // replace with exact pin

// Brand palette (Tailwind classes)
const PRIMARY = "from-rose-500 to-pink-500"; // gradient start→end
const ACCENT_TEXT = "text-rose-600";
const ACCENT_BG = "bg-rose-500";

/************************** DEV TESTS (no UI impact) **************************/
// Pure state machine for popup to avoid regressions
function popupNext(state, action) {
  const s = { ...state };
  switch (action.type) {
    case "INIT":
      if (action.closedBefore) return { open: false, showTrigger: true };
      return { open: false, showTrigger: false };
    case "AUTO":
      return { open: true, showTrigger: false };
    case "CLOSE":
      return { open: false, showTrigger: true };
    case "REOPEN":
      return { open: true, showTrigger: false };
    default:
      return s;
  }
}
(function popupTests() {
  try {
    let s = popupNext({ open: false, showTrigger: false }, { type: "INIT", closedBefore: false });
    console.assert(!s.open && !s.showTrigger, "INIT fresh failed");
    s = popupNext(s, { type: "AUTO" });
    console.assert(s.open && !s.showTrigger, "AUTO failed");
    s = popupNext(s, { type: "CLOSE" });
    console.assert(!s.open && s.showTrigger, "CLOSE failed");
    s = popupNext({ open: false, showTrigger: false }, { type: "INIT", closedBefore: true });
    console.assert(!s.open && s.showTrigger, "INIT closedBefore failed");
  } catch {}
})();

// Helper tests for toDHMS
(function dhmsTests() {
  const t = toDHMS(1000 * (2 * 86400 + 3 * 3600 + 4 * 60 + 5));
  console.assert(t.days === "02" && t.hours === "03" && t.minutes === "04" && t.seconds === "05", "toDHMS failed");
})();

export default function WeddingInvite() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-rose-50 to-pink-50 text-neutral-800">
      <GlobalStyles />
      <PetalRain />
      <Hero />
      <Divider label="You're cordially invited" />
      <Details />
      <Divider label="The Celebration" />
      <Schedule />
      <Divider label="Countdown" />
      <Countdown dateISO={DATE_ISO} />
      <Divider label="Gallery" />
      <Gallery />
      <Divider label="RSVP" />
      <RSVP />
      <Footer />
      <DonatePopup />
    </div>
  );
}

/************************** GLOBAL STYLES **************************/
function GlobalStyles() {
  // Define the keyframes used by Petal animation
  return (
    <style>{`
      @keyframes petal {
        0% { transform: translateY(-10vh) translateX(0) rotate(0deg); }
        100% { transform: translateY(110vh) translateX(15vw) rotate(360deg); }
      }
    `}</style>
  );
}

/************************** HERO — SHAADI CARD OPENING **************************/
function Hero() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 1100); // dramatic pause
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center px-4 py-24">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_40%,rgba(255,182,193,0.5),transparent_70%)]" />

      <div className="mx-auto max-w-5xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-6 text-3xl font-semibold tracking-tight text-neutral-700 sm:text-4xl"
        >
          The Wedding Of
        </motion.h1>

        {/* Animated invitation card that opens */}
        <div className="relative mx-auto mb-8 h-[380px] w-full max-w-[780px]">
          <CardOpen open={open} />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mx-auto max-w-2xl text-balance text-base/7 text-neutral-600"
        >
          Join us as we begin our forever. Your presence will make our day complete.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <ScrollButton to="#details">Details</ScrollButton>
          <ScrollButton to="#rsvp" variant="secondary">RSVP</ScrollButton>
        </motion.div>
      </div>
    </section>
  );
}

function CardOpen({ open }) {
  return (
    <div className="relative h-full w-full">
      {/* Back panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute inset-0 rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur"
      >
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className={`bg-gradient-to-r ${PRIMARY} bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl`}
          >
            {COUPLE}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-2 text-sm text-neutral-500"
          >
            <Calendar className="h-4 w-4" />
            <span>{formatDate(DATE_ISO)}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-2 text-sm text-neutral-500"
          >
            <MapPin className="h-4 w-4" />
            <span>{VENUE_NAME}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mt-2 flex items-center gap-2 text-neutral-500"
          >
            <Heart className={${ACCENT_TEXT} h-5 w-5} />
            <span className="text-sm">With love, families invite you to celebrate.</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Two front flaps that open outward */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={open ? { perspective: 1200 } : {}}
      >
        <motion.div
          className="absolute left-0 top-0 h-full w-1/2 origin-left rounded-l-3xl bg-white shadow-xl"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: open ? -160 : 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        >
          <CardPattern side="left" />
        </motion.div>
        <motion.div
          className="absolute right-0 top-0 h-full w-1/2 origin-right rounded-r-3xl bg-white shadow-xl"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: open ? 160 : 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        >
          <CardPattern side="right" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function CardPattern({ side }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
      {/* Soft gradient */}
      <div className={absolute inset-0 bg-gradient-to-br ${PRIMARY} opacity-10} />
      {/* Gold borders */}
      <div className="absolute inset-3 rounded-[22px] border-2 border-amber-300/70" />
      {/* Paisley-ish SVG filigree */}
      <svg
        className="absolute -bottom-10 -left-10 h-56 w-56 opacity-20"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M100 10C55 10 10 55 10 100s45 90 90 90 90-45 90-90S145 10 100 10Zm0 30a60 60 0 1 1 0 120 60 60 0 0 1 0-120Z" fill="#f59e0b"/>
      </svg>
      <svg
        className="absolute -top-8 -right-8 h-52 w-52 opacity-20"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="90" stroke="#f59e0b" strokeWidth="18" fill="none"/>
      </svg>

      {/* Side label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="rotate-90 text-sm tracking-[0.35em] text-neutral-400">
          {side === "left" ? "INVITATION" : "SHUBH VIVAH"}
        </span>
      </div>
    </div>
  );
}

/************************** DETAILS **************************/
function Details() {
  return (
    <section id="details" className="relative mx-auto max-w-5xl px-5 py-16">
      <SectionHeader title="Wedding Details" subtitle="Mark your calendars & join the joy" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <InfoCard icon={<Calendar className="h-5 w-5" />} label="Date & Time">
          <div className="font-medium">{niceDate(DATE_ISO)}</div>
          <div className="text-sm text-neutral-500">Arrivals 5:00 PM • Vows 6:00 PM</div>
        </InfoCard>
        <InfoCard icon={<MapPin className="h-5 w-5" />} label="Venue">
          <div className="font-medium">{VENUE_NAME}</div>
          <div className="text-sm text-neutral-500">{VENUE_ADDR}</div>
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            className="mt-2 inline-block text-sm font-medium text-rose-600 underline underline-offset-4"
          >
            Open in Maps
          </a>
        </InfoCard>
        <InfoCard icon={<Heart className="h-5 w-5" />} label="Dress Code">
          <div className="text-sm text-neutral-600">Traditional festive • Hint of {" "}
            <span className="font-medium">rose & gold</span>
          </div>
        </InfoCard>
      </motion.div>
    </section>
  );
}

function InfoCard({ icon, label, children }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group rounded-2xl border border-white/80 bg-white p-5 shadow-xl shadow-rose-100/60 ring-1 ring-black/5"
    >
      <div className="mb-3 flex items-center gap-2 text-neutral-500">
        <div className={grid h-9 w-9 place-items-center rounded-xl ${ACCENT_BG} text-white}>{icon}</div>
        <span className="text-sm font-semibold tracking-wide text-neutral-600">{label}</span>
      </div>
      <div className="text-sm leading-6 text-neutral-700">{children}</div>
    </motion.div>
  );
}

/************************** SCHEDULE **************************/
function Schedule() {
  const items = [
    { time: "5:00 PM", title: "Baraat Welcome", desc: "Dhol • Aarti • Refreshments" },
    { time: "6:00 PM", title: "Varmala", desc: "Exchange of garlands under the stars" },
    { time: "7:30 PM", title: "Pheras", desc: "Sacred vows around the holy fire" },
    { time: "9:00 PM", title: "Dinner & Dance", desc: "Live band • Open dance floor" },
  ];

  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <SectionHeader title="Program" subtitle="An evening of rituals, laughter & love" />
      <div className="relative mx-auto mt-10 max-w-3xl">
        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-rose-300 to-pink-300 md:left-1/2" />
        <ul className="space-y-10">
          {items.map((it, i) => (
            <TimelineItem key={i} {...it} flip={i % 2 === 1} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function TimelineItem({ time, title, desc, flip }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <li ref={ref} className="relative">
      <motion.div
        initial={{ opacity: 0, x: flip ? 40 : -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="grid items-center gap-3 md:grid-cols-2"
      >
        <div className={rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 ${flip ? "md:order-last" : ""}}>
          <div className="mb-1 flex items-center gap-2 text-sm text-neutral-500">
            <Clock className="h-4 w-4" /> {time}
          </div>
          <div className="text-lg font-semibold text-neutral-800">{title}</div>
          <div className="text-sm text-neutral-600">{desc}</div>
        </div>
        <div className="hidden items-center justify-center md:flex">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white shadow ring-1 ring-black/5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          </div>
        </div>
      </motion.div>
    </li>
  );
}

/************************** COUNTDOWN **************************/
function Countdown({ dateISO }) {
  const target = useMemo(() => new Date(dateISO).getTime(), [dateISO]);
  const [t, setT] = useState(() => target - Date.now());

  useEffect(() => {
    const id = setInterval(() => setT(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const { days, hours, minutes, seconds } = toDHMS(t);

  return (
    <section className="mx-auto max-w-5xl px-5 pb-2 pt-14">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-center shadow-xl ring-1 ring-black/5">
        <div className="mb-2 text-sm font-medium text-neutral-500">Counting down to the big day</div>
        <div className="grid grid-cols-4 gap-4">
          <CdBox label="Days" value={days} />
          <CdBox label="Hours" value={hours} />
          <CdBox label="Minutes" value={minutes} />
          <CdBox label="Seconds" value={seconds} />
        </div>
      </div>
    </section>
  );
}

function CdBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white to-rose-50 p-4 shadow-inner">
      <div className={text-3xl font-bold ${ACCENT_TEXT}}>{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</div>
    </div>
  );
}

/************************** GALLERY **************************/
function Gallery() {
  // Replace src with couple photos (local uploads or URLs)
  const imgs = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505247964246-1f0a90443c36?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop",
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeader title="Memories" subtitle="A few frames from our story" />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {imgs.map((src, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Moment {i + 1}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/************************** DONATE SHAGUN POPUP **************************/
function DonatePopup() {
  const [open, setOpen] = useState(false);
  const [showTrigger, setShowTrigger] = useState(false);

  // Init on mount
  useEffect(() => {
    const closedBefore = typeof window !== "undefined" && localStorage.getItem("donateClosed") === "1";
    if (closedBefore) {
      // Previously closed — don't auto-open; show trigger
      setShowTrigger(true);
      return;
    }
    const id = setTimeout(() => setOpen(true), 3000); // auto after 3s on first visit
    return () => clearTimeout(id);
  }, []);

  const close = () => {
    setOpen(false);
    setShowTrigger(true);
    try { localStorage.setItem("donateClosed", "1"); } catch {}
  };

  const reopen = () => {
    setOpen(true);
    setShowTrigger(false);
    // keep donateClosed=1 so future opens are manual only
  };

  return (
    <>
      {/* Manual trigger button (shows when popup is closed) */}
      <AnimatePresence>
        {(!open && showTrigger) ? (
          <motion.button
            key="shagun-trigger"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            onClick={reopen}
            className={fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-white shadow-lg ring-1 ring-black/5 bg-gradient-to-br ${PRIMARY}}
            aria-label="Open Shagun popup"
            type="button"
          >
            <span className="text-base leading-none">💌</span>
            <span>Shagun</span>
          </motion.button>
        ) : null}
      </AnimatePresence>

      {/* Popup */}
      <AnimatePresence>
        {open ? (
          <motion.aside
            key="shagun-popup"
            initial={{ opacity: 0, x: -40, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="fixed bottom-4 left-4 z-50 w-[92vw] max-w-[340px] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/5 md:bottom-6 md:left-6"
          >
            {/* Chibi Namya peeking half in/half out */}
            <div className="pointer-events-none absolute -top-6 -left-6 h-20 w-20 overflow-visible">
              <img
                src="https://i.postimg.cc/RF4TLjwG/Untitled-design-2.png"
                alt="Chibi Namya"
                className="h-20 w-20 -rotate-6 drop-shadow-xl"
              />
            </div>

            {/* Close button */}
            <button
              aria-label="Close"
              onClick={close}
              className="absolute right-3 top-3 rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pl-8">
              <h4 className={bg-gradient-to-r ${PRIMARY} bg-clip-text text-lg font-extrabold tracking-tight text-transparent}>
                DONATE SHAGUN
              </h4>
              <p className="mt-1 text-xs leading-5 text-neutral-600">
                Your blessings mean the world. If you’d like to send a shagun, scan the QR or use the UPI below.
              </p>

              <div className="mt-3 overflow-hidden rounded-xl border border-rose-200/60 bg-rose-50/40 p-2">
                <img
                  src="https://i.postimg.cc/zGy2LZkg/Untitled-design-1.png"
                  alt="Shagun QR"
                  className="mx-auto block h-auto w-full max-w-[220px] rounded-lg"
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-white p-2 text-[13px] ring-1 ring-rose-200">
                <div className="font-mono text-neutral-700">9971172740@fam</div>
                <button
                  onClick={() => { try { navigator.clipboard && navigator.clipboard.writeText("9971172740@fam"); } catch {} }}
                  className={rounded-lg ${ACCENT_BG} px-2 py-1 text-xs font-semibold text-white}
                  type="button"
                >
                  Copy
                </button>
              </div>

              <div className="mt-2 text-[11px] italic text-neutral-500">
                “Dhanyavaad! May your kindness return to you a hundredfold.”
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/************************** RSVP **************************/
function RSVP() {
  const ref = useRef(null);
  const [sent, setSent] = useState(false);

  return (
    <section id="rsvp" className="mx-auto max-w-3xl px-5 py-16">
      <SectionHeader title="RSVP" subtitle="We’d love to know you’re coming!" />

      <form
        ref={ref}
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
          if (ref.current) ref.current.reset();
        }}
        className="mx-auto mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 md:grid-cols-2"
      >
        <Input label="Your Name" name="name" placeholder="Full name" />
        <Input label="Contact Email" name="email" type="email" placeholder="you@example.com" />
        <Input label="# of Guests" name="guests" type="number" min={1} max={8} />
        <Input label="Song Request" name="song" placeholder="Optional" />
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Message</label>
          <textarea
            name="msg"
            placeholder="Leave a wish or note for the couple"
            className="h-28 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-rose-200 focus:bg-white focus:ring"
          />
        </div>
        <div className="md:col-span-2 flex items-center justify-between">
          <div className="text-xs text-neutral-500">We’ll reply with your pass & table info.</div>
          <button
            className={inline-flex items-center gap-2 rounded-xl ${ACCENT_BG} px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-95 active:scale-[0.99]}
          >
            <Send className="h-4 w-4" /> Send RSVP
          </button>
        </div>
        <AnimatePresence>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:col-span-2 rounded-xl bg-green-50 p-3 text-sm text-green-700"
            >
              Thank you! Your RSVP has been noted.
            </motion.div>
          ) : null}
        </AnimatePresence>
      </form>
    </section>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label>
      <input
        {...props}
        className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none ring-rose-200 focus:bg-white focus:ring"
      />
    </div>
  );
}

/************************** FOOTER **************************/
function Footer() {
  return (
    <footer className="relative mt-10 bg-gradient-to-b from-white to-rose-50 px-5 py-12 text-center">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={mx-auto inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br ${PRIMARY} px-5 py-3 text-white shadow-lg}
        >
          <Heart className="h-5 w-5" />
          <span className="font-semibold tracking-wide">Can’t wait to celebrate with you!</span>
        </motion.div>
        <p className="mt-4 text-xs text-neutral-500">
          Built with ♥ — update names, date & venue in code comments.
        </p>
      </div>
    </footer>
  );
}

/************************** SHARED **************************/
function Divider({ label }) {
  return (
    <div className="mx-auto my-4 flex max-w-5xl items-center gap-3 px-5">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
      <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-400">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-rose-200 to-transparent" />
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="text-center">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-2xl font-bold tracking-tight text-neutral-800"
      >
        {title}
      </motion.h3>
      {subtitle ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-1 text-sm text-neutral-500"
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}

function ScrollButton({ to, children, variant = "primary" }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        const el = document.querySelector(to);
        if (el && "scrollIntoView" in el) el.scrollIntoView({ behavior: "smooth" });
      }}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow active:scale-[0.99] ${
        variant === "secondary"
          ? "bg-white/80 ring-1 ring-black/5 backdrop-blur hover:bg-white"
          : ${ACCENT_BG} text-white hover:brightness-95
      }`}
    >
      {children}
    </a>
  );
}

/************************** PETAL RAIN (CSS + SVG) **************************/
function PetalRain() {
  const petals = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {petals.map((_, i) => (
        <Petal key={i} i={i} />
      ))}
    </div>
  );
}

function Petal({ i }) {
  const delay = (i % 12) * 1.2;
  const left = (i * 37) % 100; // pseudo-random spread
  const scale = 0.7 + ((i * 13) % 30) / 100;
  return (
    <div
      className="absolute -top-10"
      style={{ left: ${left}%, animation: petal 14s linear infinite, animationDelay: ${delay}s }}
    >
      <svg
        width={32 * scale}
        height={28 * scale}
        viewBox="0 0 32 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-60"
      >
        <path d="M16 2C10 6 7 10 6 14c-2 7 4 9 10 9s12-2 10-9c-1-4-4-8-10-12Z" fill="#fb7185" />
      </svg>
    </div>
  );
}

/************************** UTIL **************************/
function toDHMS(ms) {
  const cl = (n) => String(Math.max(0, Math.floor(n))).padStart(2, "0");
  const sec = Math.max(0, ms / 1000);
  const days = cl(sec / 86400);
  const hours = cl((sec % 86400) / 3600);
  const minutes = cl((sec % 3600) / 60);
  const seconds = cl(sec % 60);
  return { days, hours, minutes, seconds };
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function niceDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
