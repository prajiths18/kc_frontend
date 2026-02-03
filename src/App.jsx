import React, { useState, useEffect, useCallback } from "react";

// ─── API BASE URLS ────────────────────────────────────────────
// const API_MOVIE   = "http://localhost:8081/movies";
// const API_SHOW    = "http://localhost:8082/shows";
// const API_BOOKING = "http://localhost:8083/booking";
// ✅ CORRECT URLs for production
const API_MOVIE   = "https://kc-movie-service.onrender.com/movies";
const API_SHOW    = "https://show-service-hxin.onrender.com/shows";
const API_BOOKING = "https://kc-booking-service.onrender.com/booking";
const MAX_SEATS = 6;

// ─── STEP CONSTANTS ───────────────────────────────────────────
const STEP = { MOVIES: 0, SHOWS: 1, SEATS: 2, CONFIRM: 3 };

// ─── STYLES ───────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* White-Red Theme (RedBus/BookMyShow inspired) */
    --bg:          #f5f5f5;
    --surface:     #ffffff;
    --surface2:    #fafafa;
    --border:      #e0e0e0;
    --border-light:#eeeeee;
    --red:         #e51937;
    --red-dark:    #c41630;
    --red-light:   #fff0f2;
    --text:        #212121;
    --text-dim:    #666666;
    --text-light:  #999999;
    --green:       #2e7d32;
    --green-light: #e8f5e9;
    --shadow:      0 2px 8px rgba(0,0,0,0.08);
    --shadow-hover: 0 4px 16px rgba(0,0,0,0.12);
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .app-shell { max-width: 1000px; margin: 0 auto; padding: 24px 16px 60px; }

  /* ── header ── */
  .header { 
    background: var(--red); 
    margin: -24px -16px 24px -16px; 
    padding: 28px 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .header h1 {
    font-family: 'Roboto', sans-serif;
    font-size: clamp(1.6rem, 4vw, 2rem);
    font-weight: 700;
    color: white;
    letter-spacing: -0.5px;
    text-align: center;
  }
  .header p { 
    color: rgba(255,255,255,0.9); 
    font-size: 0.9rem; 
    margin-top: 6px; 
    text-align: center;
    font-weight: 400;
  }

  /* ── breadcrumb nav ── */
  .breadcrumb {
    display: flex; 
    align-items: center; 
    justify-content: center;
    gap: 8px; 
    margin-bottom: 28px; 
    flex-wrap: wrap;
    background: white;
    padding: 12px;
    border-radius: 8px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border-light);
  }
  .crumb {
    font-size: 0.75rem; 
    text-transform: uppercase; 
    letter-spacing: 0.5px;
    color: var(--text-dim); 
    cursor: pointer; 
    padding: 6px 14px;
    border-radius: 20px; 
    border: 1px solid transparent;
    transition: all 0.2s ease; 
    user-select: none;
    font-weight: 500;
  }
  .crumb:hover:not(.active):not(.disabled) { 
    color: var(--red); 
    background: var(--red-light);
    border-color: var(--red-light);
  }
  .crumb.active { 
    color: white; 
    background: var(--red); 
    border-color: var(--red);
    font-weight: 600; 
    box-shadow: 0 2px 4px rgba(229,25,55,0.3);
  }
  .crumb.disabled { 
    opacity: 0.4; 
    cursor: default; 
    color: var(--text-light);
  }
  .crumb-sep { 
    color: var(--border); 
    font-size: 0.8rem; 
    font-weight: 300;
  }

  /* ── card shell ── */
  .card {
    background: var(--surface); 
    border: 1px solid var(--border); 
    border-radius: 12px;
    padding: 24px; 
    animation: fadeUp 0.3s ease;
    box-shadow: var(--shadow);
  }
  @keyframes fadeUp { 
    from { opacity:0; transform: translateY(10px); } 
    to { opacity:1; transform: translateY(0); } 
  }

  /* ── movie grid ── */
  .movie-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
    gap: 20px; 
  }
  .movie-card {
    background: var(--surface); 
    border: 1px solid var(--border); 
    border-radius: 12px;
    cursor: pointer; 
    transition: all 0.2s ease; 
    position: relative; 
    overflow: hidden;
    display: flex; 
    flex-direction: column;
    box-shadow: var(--shadow);
  }
  .movie-card:hover { 
    border-color: var(--red); 
    transform: translateY(-2px); 
    box-shadow: var(--shadow-hover);
  }

  /* poster image area */
  .movie-img-wrap {
    width: 100%; 
    aspect-ratio: 2/3; 
    position: relative; 
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px 12px 0 0;
  }
  .movie-img-wrap img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
    display: block; 
  }
  .movie-img-placeholder {
    width: 100%; 
    height: 100%; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-size: 3rem; 
    color: rgba(255,255,255,0.5);
  }
  .movie-img-wrap .genre-overlay {
    position: absolute; 
    bottom: 8px; 
    left: 8px;
    font-size: 0.7rem; 
    text-transform: uppercase; 
    letter-spacing: 0.5px;
    color: white; 
    background: rgba(0,0,0,0.7); 
    padding: 4px 8px; 
    border-radius: 4px; 
    font-weight: 500;
  }

  /* card info below poster */
  .movie-info { 
    padding: 16px; 
    flex: 1;
    display: flex; 
    flex-direction: column;
    gap: 12px;
  }
  .movie-info h3 { 
    font-family: 'Roboto', sans-serif;
    font-size: 1.1rem; 
    font-weight: 700; 
    color: var(--text);
    line-height: 1.3;
  }
  .movie-info .lang { 
    font-size: 0.8rem; 
    color: var(--text-dim); 
    font-weight: 500;
  }
  
  /* Book Ticket Button */
  .book-btn {
    width: 100%;
    padding: 10px;
    background: var(--red);
    color: white;
    border: none;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: auto;
    box-shadow: 0 2px 4px rgba(229,25,55,0.2);
  }
  .book-btn:hover {
    background: var(--red-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(229,25,55,0.3);
  }

  /* ── section title ── */
  .section-title { 
    font-family: 'Roboto', sans-serif;
    font-size: 1.25rem; 
    margin-bottom: 20px; 
    color: var(--text);
    font-weight: 700;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-light);
  }
  .section-title span { 
    color: var(--red); 
    font-weight: 700;
  }

  /* ── theatre group ── */
  .theatre-group { 
    margin-bottom: 24px; 
    background: var(--surface2);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--border-light);
  }
  .theatre-group:last-child { margin-bottom: 0; }
  .theatre-label {
    font-size: 0.85rem; 
    font-weight: 700;
    color: var(--text); 
    margin-bottom: 12px;
    display: flex; 
    align-items: center; 
    gap: 8px;
    text-transform: none;
    letter-spacing: 0;
  }
  .theatre-label::after {
    content: ''; 
    flex: 1; 
    height: 1px;
    background: var(--border);
  }
  .show-times { display: flex; flex-wrap: wrap; gap: 12px; }
  .show-btn {
    position: relative; 
    background: white; 
    border: 1px solid var(--border);
    border-radius: 8px; 
    padding: 12px 18px; 
    cursor: pointer;
    transition: all 0.2s ease; 
    text-align: center;
    min-width: 100px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .show-btn:hover:not(.full) { 
    border-color: var(--red); 
    background: var(--red-light);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(229,25,55,0.15);
  }
  .show-btn .time { 
    font-family: 'Roboto', sans-serif;
    font-size: 1rem; 
    color: var(--green); 
    font-weight: 700;
  }
  .show-btn .avail { 
    font-size: 0.75rem; 
    color: var(--text-dim); 
    margin-top: 4px;
    font-weight: 500;
  }
  .show-btn.full { 
    opacity: 0.5; 
    cursor: not-allowed; 
    background: var(--surface2);
  }
  .show-btn.full .time { 
    color: var(--text-light); 
  }

  /* FULL badge */
  .full-badge {
    position: absolute; 
    top: -8px; 
    right: -8px;
    background: var(--text-light); 
    color: white; 
    font-size: 0.65rem;
    text-transform: uppercase; 
    letter-spacing: 0.5px; 
    font-weight: 700;
    padding: 3px 8px; 
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  /* ── screen indicator ── */
  .screen-wrap { text-align: center; margin: 24px 0; }
  .screen-bar {
    display: inline-block; 
    width: 60%; 
    height: 4px;
    background: linear-gradient(90deg, transparent 0%, var(--border) 20%, var(--border) 80%, transparent 100%);
    border-radius: 2px;
    margin-bottom: 8px;
  }
  .screen-label { 
    font-size: 0.75rem; 
    color: var(--text-light); 
    letter-spacing: 1px; 
    text-transform: uppercase;
    font-weight: 600;
  }

  /* ── seat legend ── */
  .seat-legend { 
    display: flex; 
    gap: 24px; 
    margin-bottom: 20px; 
    flex-wrap: wrap;
    padding: 12px;
    background: var(--surface2);
    border-radius: 8px;
    justify-content: center;
  }
  .legend-item { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    font-size: 0.8rem; 
    color: var(--text-dim);
    font-weight: 500;
  }
  .legend-dot { 
    width: 20px; 
    height: 20px; 
    border-radius: 4px; 
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .legend-dot.available { 
    background: white; 
    border: 2px solid var(--green); 
  }
  .legend-dot.selected  { 
    background: var(--red); 
    border: 2px solid var(--red); 
  }
  .legend-dot.booked    { 
    background: var(--red-light); 
    border: 2px solid var(--red); 
    opacity: 0.5;
  }

  /* ── seat grid ── */
  .seat-grid { 
    display: grid; 
    grid-template-columns: repeat(10, 1fr); 
    gap: 8px;
    max-width: 500px;
    margin: 0 auto;
  }
  .seat {
    aspect-ratio: 1; 
    border-radius: 4px;
    background: white; 
    border: 2px solid var(--green);
    display: flex; 
    align-items: center; 
    justify-content: center;
    font-size: 0.7rem; 
    color: var(--green); 
    cursor: pointer;
    transition: all 0.15s ease; 
    user-select: none; 
    font-weight: 700;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .seat:hover:not(.booked):not(.at-limit) { 
    border-color: var(--red); 
    background: var(--red-light);
    color: var(--red);
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(229,25,55,0.2);
  }
  .seat.selected { 
    background: var(--red); 
    border-color: var(--red); 
    color: white; 
    font-weight: 700; 
    box-shadow: 0 2px 8px rgba(229,25,55,0.3);
    transform: scale(1.05);
  }
  .seat.booked { 
    background: var(--red-light); 
    border-color: var(--red); 
    color: var(--red);
    cursor: not-allowed;
    opacity: 0.4;
    text-decoration: line-through;
  }
  .seat.at-limit { 
    cursor: not-allowed; 
    opacity: 0.3; 
    border-color: var(--border);
    color: var(--text-light);
  }

  /* ── summary bar ── */
  .summary-bar {
    margin-top: 24px; 
    padding: 16px 20px; 
    background: var(--surface2);
    border: 1px solid var(--border); 
    border-radius: 8px;
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    flex-wrap: wrap; 
    gap: 12px;
  }
  .summary-bar .left { 
    font-size: 0.9rem; 
    color: var(--text-dim); 
    font-weight: 500;
  }
  .summary-bar .left strong { 
    color: var(--red); 
    font-weight: 700; 
    font-size: 1rem;
  }
  .summary-bar .limit-msg { 
    font-size: 0.75rem; 
    color: var(--text-light); 
    margin-top: 4px;
    font-weight: 500;
  }
  .summary-bar .limit-msg.warn { 
    color: var(--red); 
    font-weight: 600;
  }
  .summary-bar .total { 
    font-family: 'Roboto', sans-serif;
    font-size: 1.5rem; 
    color: var(--red); 
    font-weight: 700;
  }

  /* ── confirm ── */
  .confirm-detail { 
    display: flex; 
    justify-content: space-between; 
    padding: 14px 0; 
    border-bottom: 1px solid var(--border-light); 
    font-size: 0.95rem;
    align-items: center;
  }
  .confirm-detail:last-of-type { border-bottom: none; }
  .confirm-detail .label { 
    color: var(--text-dim); 
    font-weight: 500;
  }
  .confirm-detail .value { 
    color: var(--text); 
    font-weight: 600;
    text-align: right;
  }
  .confirm-detail .value.gold { 
    color: var(--red); 
    font-weight: 700;
    font-size: 1.1rem;
  }

  /* ── buttons ── */
  .btn {
    display: inline-flex; 
    align-items: center; 
    justify-content: center; 
    gap: 6px;
    padding: 12px 24px; 
    border-radius: 6px; 
    border: none; 
    font-family: inherit;
    font-size: 0.85rem; 
    font-weight: 600; 
    letter-spacing: 0.3px; 
    cursor: pointer;
    transition: all 0.2s ease; 
    text-transform: uppercase;
  }
  .btn-gold { 
    background: var(--red); 
    color: white; 
    box-shadow: 0 2px 4px rgba(229,25,55,0.2);
  }
  .btn-gold:hover { 
    background: var(--red-dark); 
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(229,25,55,0.3);
  }
  .btn-gold:disabled { 
    background: #ccc; 
    color: #666; 
    cursor: not-allowed; 
    box-shadow: none;
    transform: none;
  }
  .btn-outline { 
    background: white; 
    color: var(--text-dim); 
    border: 1px solid var(--border);
    font-weight: 600;
  }
  .btn-outline:hover { 
    border-color: var(--red); 
    color: var(--red);
    background: var(--red-light);
  }
  .btn-row { 
    display: flex; 
    gap: 12px; 
    margin-top: 24px; 
    justify-content: flex-end; 
  }

  /* ── success ── */
  .success-screen { text-align: center; padding: 24px 0; }
  .success-icon { 
    font-size: 4rem; 
    margin-bottom: 16px; 
    animation: pop 0.4s ease;
    color: var(--green);
  }
  @keyframes pop { 
    0% { transform: scale(0.4); } 
    60% { transform: scale(1.15); } 
    100% { transform: scale(1); } 
  }
  .success-screen h2 { 
    font-family: 'Roboto', sans-serif;
    font-size: 1.8rem; 
    color: var(--text); 
    margin-bottom: 8px;
    font-weight: 700;
  }
  .success-screen p { 
    color: var(--text-dim); 
    font-size: 1rem;
    font-weight: 500;
  }
  .success-screen .booking-id { 
    margin-top: 20px; 
    font-size: 0.9rem; 
    color: var(--text-dim);
    background: var(--surface2);
    padding: 12px 24px;
    border-radius: 24px;
    display: inline-block;
    font-weight: 600;
  }
  .success-screen .booking-id span { 
    color: var(--red); 
    font-weight: 700;
  }

  /* ── loader / error ── */
  .loader { 
    text-align: center; 
    padding: 44px 0; 
    color: var(--text-dim); 
    font-size: 0.9rem;
    font-weight: 500;
  }
  .loader .spin { 
    display: inline-block; 
    width: 24px; 
    height: 24px; 
    border: 3px solid var(--border-light); 
    border-top-color: var(--red); 
    border-radius: 50%; 
    animation: spin 0.6s linear infinite; 
    margin-bottom: 12px; 
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-box { 
    background: var(--red-light); 
    border: 1px solid rgba(229,25,55,0.3); 
    border-radius: 8px; 
    padding: 14px 18px; 
    color: var(--red); 
    font-size: 0.9rem; 
    margin-top: 16px;
    font-weight: 600;
  }

  /* ── input ── */
  .input-label { 
    font-size: 0.8rem; 
    text-transform: uppercase; 
    letter-spacing: 0.5px; 
    color: var(--text-dim); 
    margin-bottom: 8px; 
    display: block;
    font-weight: 600;
  }
  .input-field {
    width: 100%; 
    padding: 12px 16px; 
    background: white; 
    border: 2px solid var(--border);
    border-radius: 6px; 
    color: var(--text); 
    font-family: inherit; 
    font-size: 1rem; 
    outline: none;
    transition: all 0.2s;
    font-weight: 500;
  }
  .input-field:focus { 
    border-color: var(--red); 
    box-shadow: 0 0 0 3px rgba(229,25,55,0.1);
  }
  .input-field::placeholder { 
    color: var(--text-light); 
    font-weight: 400;
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────
function groupByTheatre(shows) {
  const map = {};
  shows.forEach(s => {
    const key = s.theatre || "Unknown Theatre";
    if (!map[key]) map[key] = [];
    map[key].push(s);
  });
  return map;
}

function fmt12(timeStr) {
  if (!timeStr) return timeStr;
  
  // Handle cases where time might already contain AM/PM or spaces
  // Remove any existing AM/PM (case insensitive) and trim spaces
  const clean = timeStr.replace(/\s*[AaPp][Mm]\s*/, '').trim();
  const parts = clean.split(":");
  
  if (parts.length < 2) return timeStr; // fallback if format is wrong
  
  let [h, m] = parts.map(Number);
  
  // If minutes is NaN (e.g., "00AM" was not cleaned properly), try to parse from original
  if (isNaN(m)) {
    // Extract just the digits for minutes
    const minMatch = parts[1].match(/\d+/);
    if (minMatch) m = parseInt(minMatch[0]);
  }
  
  if (isNaN(h) || isNaN(m)) return timeStr;
  
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [step, setStep]                     = useState(STEP.MOVIES);
  const [movies, setMovies]                 = useState([]);
  const [selectedMovie, setSelectedMovie]  = useState(null);
  const [shows, setShows]                   = useState([]);
  const [selectedShow, setSelectedShow]    = useState(null);
  const [seats, setSeats]                   = useState([]);
  const [selectedSeats, setSelectedSeats]  = useState([]);
  const [userName, setUserName]             = useState("");
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [booking, setBooking]               = useState(null);
  const [showSeatCounts, setShowSeatCounts] = useState({});

  // ── fetch movies on mount ──
  useEffect(() => {
    fetch(API_MOVIE)
      .then(r => r.json())
      .then(data => { setMovies(data); setLoading(false); })
      .catch(() => { setError("Failed to load movies. Is movie-service running?"); setLoading(false); });
  }, []);

  // ── fetch seat counts for FULL badge ──
  const fetchSeatCounts = useCallback(async (showsList) => {
    const counts = {};
    await Promise.all(
      showsList.map(async (s) => {
        try {
          const res  = await fetch(`${API_SHOW}/${s.showId}/seats`);
          const data = await res.json();
          counts[s.showId] = data.filter(seat => seat.status !== "BOOKED").length;
        } catch { counts[s.showId] = -1; }
      })
    );
    setShowSeatCounts(counts);
  }, []);


  const pickMovie = useCallback(async (movie) => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API_SHOW}?movieId=${movie.movieId}`);
      const data = await res.json();
      setSelectedMovie(movie);
      setShows(data);
      setStep(STEP.SHOWS);
      fetchSeatCounts(data);
    } catch { setError("Failed to load shows. Is show-service running?"); }
    finally { setLoading(false); }
  }, [fetchSeatCounts]); // FIXED HERE

  // ── pick show → load seats ──
  const pickShow = useCallback(async (show) => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API_SHOW}/${show.showId}/seats`);
      const data = await res.json();
      setSelectedShow(show);
      setSeats(data);
      setSelectedSeats([]);
      setStep(STEP.SEATS);
    } catch { setError("Failed to load seats."); }
    finally { setLoading(false); }
  }, []);

  // ── toggle seat (max 6) ──
  const toggleSeat = (seat) => {
    if (seat.status === "BOOKED") return;
    const already = selectedSeats.find(s => s.seatNo === seat.seatNo);
    if (!already && selectedSeats.length >= MAX_SEATS) return;
    setSelectedSeats(prev =>
      already ? prev.filter(s => s.seatNo !== seat.seatNo) : [...prev, seat]
    );
  };

  // ── submit booking ──
  const submitBooking = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BOOKING}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId:      selectedShow.showId,
          seats:       selectedSeats.map(s => s.seatNo).join(","),
          totalAmount: selectedSeats.length * 190,
          userName:    userName.trim()
        })
      });
      if (!res.ok) throw new Error(await res.text());
      setBooking(await res.json());
    } catch (e) { setError(e.message || "Booking failed."); }
    finally { setLoading(false); }
  };

  // ── restart ──
  const restart = () => {
    setStep(STEP.MOVIES); setSelectedMovie(null); setSelectedShow(null);
    setSeats([]); setSelectedSeats([]); setUserName(""); setBooking(null);
    setError(null); setShowSeatCounts({});
  };

  // ── breadcrumb navigation ──
  const goTo = (s) => {
    if (s === STEP.MOVIES) {
      setStep(STEP.MOVIES); setSelectedMovie(null); setSelectedShow(null);
      setSeats([]); setSelectedSeats([]);
    } else if (s === STEP.SHOWS && step > STEP.SHOWS) {
      setStep(STEP.SHOWS); setSelectedShow(null);
      setSeats([]); setSelectedSeats([]);
    } else if (s === STEP.SEATS && step > STEP.SEATS) {
      setStep(STEP.SEATS); setSelectedSeats([]);
    }
  };

  const totalAmount = selectedSeats.length * 190;
  const atLimit     = selectedSeats.length >= MAX_SEATS;
  const grouped     = groupByTheatre(shows);

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="app-shell">

        {/* ── Header ── */}
        <div className="header">
          <h1>KC Online Ticket Booking</h1>
          <p>Reserve your cinema seats in seconds</p>
        </div>

        {/* ── Breadcrumb ── */}
        <div className="breadcrumb">
          {[
            { label: "Movies",  s: STEP.MOVIES  },
            { label: "Shows",   s: STEP.SHOWS   },
            { label: "Seats",   s: STEP.SEATS   },
            { label: "Confirm", s: STEP.CONFIRM }
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <span className="crumb-sep">›</span>}
              <span
                className={`crumb ${step === item.s ? "active" : ""} ${item.s > step ? "disabled" : ""}`}
                onClick={() => item.s < step && goTo(item.s)}
              >
                {item.label}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* ── Error banner ── */}
        {error && <div className="error-box">⚠ {error}</div>}

        {/* ════════════════════════════════════════════════
            STEP 0 – MOVIES
        ════════════════════════════════════════════════ */}
        {step === STEP.MOVIES && (
          <div className="card">
            {loading ? (
              <div className="loader"><div className="spin" />Loading movies…</div>
            ) : (
              <div className="movie-grid">
                {movies.map(m => (
                  <div key={m.movieId} className="movie-card">
                    <div className="movie-img-wrap" onClick={() => pickMovie(m)}>
                      {m.image
                        ? <img src={m.image} alt={m.title} />
                        : <div className="movie-img-placeholder">🎬</div>
                      }
                      <div className="genre-overlay">{m.genre}</div>
                    </div>
                    <div className="movie-info">
                      <div>
                        <h3>{m.title}</h3>
                        <div className="lang">{m.language}</div>
                      </div>
                      <button className="book-btn" onClick={() => pickMovie(m)}>
                        Book Tickets
                      </button>
                    </div>
                  </div>
                ))}
                {movies.length === 0 && !error && (
                  <div className="loader">No movies found. Add some via POST /movies first.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            STEP 1 – SHOWS (grouped by theatre)
        ════════════════════════════════════════════════ */}
        {step === STEP.SHOWS && (
          <div className="card">
            <div className="section-title">Shows for <span>{selectedMovie?.title}</span></div>
            {loading ? (
              <div className="loader"><div className="spin" />Loading shows…</div>
            ) : shows.length === 0 ? (
              <div>
                <div className="loader" style={{ padding: "24px 0" }}>
                  No shows available for this movie yet.<br />
                  <strong style={{ color: "var(--red)", fontSize: "0.9rem" }}>
                    Add via <code style={{ background: "var(--surface2)", padding: "4px 8px", borderRadius: 4 }}>POST http://localhost:8082/shows</code>
                  </strong>
                </div>
                <div className="btn-row">
                  <button className="btn btn-outline" onClick={() => goTo(STEP.MOVIES)}>← Back</button>
                </div>
              </div>
            ) : (
              <>
                {Object.entries(grouped).map(([theatre, showList]) => (
                  <div key={theatre} className="theatre-group">
                    <div className="theatre-label">{theatre}</div>
                    <div className="show-times">
                      {showList.map(s => {
                        const avail  = showSeatCounts[s.showId];
                        const isFull = avail === 0;
                        return (
                          <div
                            key={s.showId}
                            className={`show-btn ${isFull ? "full" : ""}`}
                            onClick={() => !isFull && pickShow(s)}
                          >
                            {isFull && <div className="full-badge">Full</div>}
                            <div className="time">{fmt12(s.showTime)}</div>
                            <div className="avail">
                              {avail === undefined || avail === -1
                                ? "Loading…"
                                : isFull
                                  ? "No seats left"
                                  : `${avail} seats left`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="btn-row">
                  <button className="btn btn-outline" onClick={() => goTo(STEP.MOVIES)}>← Back</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            STEP 2 – SEATS
        ════════════════════════════════════════════════ */}
        {step === STEP.SEATS && (
          <div className="card">
            <div className="section-title">
              Pick your seats <span>— {fmt12(selectedShow?.showTime)}</span>
            </div>
            {loading ? (
              <div className="loader"><div className="spin" />Loading seats…</div>
            ) : (
              <>
                {/* screen */}
                <div className="screen-wrap">
                  <div className="screen-bar" />
                  <div className="screen-label">Screen</div>
                </div>

                {/* legend */}
                <div className="seat-legend">
                  <div className="legend-item"><div className="legend-dot available" /> Available</div>
                  <div className="legend-item"><div className="legend-dot selected" /> Selected</div>
                  <div className="legend-item"><div className="legend-dot booked" /> Booked</div>
                </div>

                {/* seats */}
                <div className="seat-grid">
                  {seats.map(seat => {
                    const isSelected = !!selectedSeats.find(s => s.seatNo === seat.seatNo);
                    const isBooked   = seat.status === "BOOKED";
                    const isBlocked  = !isBooked && !isSelected && atLimit;
                    return (
                      <div
                        key={seat.seatId}
                        className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""} ${isBlocked ? "at-limit" : ""}`}
                        onClick={() => toggleSeat(seat)}
                      >
                        {seat.seatNo}
                      </div>
                    );
                  })}
                </div>

                {/* summary */}
                <div className="summary-bar">
                  <div className="left">
                    {selectedSeats.length === 0
                      ? <>Select up to {MAX_SEATS} seats</>
                      : <><strong>{selectedSeats.map(s => s.seatNo).join(", ")}</strong> — {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}</>
                    }
                    <div className={`limit-msg ${atLimit ? "warn" : ""}`}>
                      {atLimit
                        ? `Maximum ${MAX_SEATS} seats reached`
                        : `${MAX_SEATS - selectedSeats.length} more seat${MAX_SEATS - selectedSeats.length !== 1 ? "s" : ""} allowed`}
                    </div>
                  </div>
                  <div className="total">₹{totalAmount.toLocaleString()}</div>
                </div>

                <div className="btn-row">
                  <button className="btn btn-outline" onClick={() => goTo(STEP.SHOWS)}>← Back</button>
                  <button className="btn btn-gold" disabled={selectedSeats.length === 0} onClick={() => setStep(STEP.CONFIRM)}>
                    Proceed →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            STEP 3 – CONFIRM
        ════════════════════════════════════════════════ */}
        {step === STEP.CONFIRM && !booking && (
          <div className="card">
            <div className="section-title">Confirm your <span>booking</span></div>

            <div className="confirm-detail"><span className="label">Movie</span><span className="value">{selectedMovie?.title}</span></div>
            <div className="confirm-detail"><span className="label">Language</span><span className="value">{selectedMovie?.language}</span></div>
            <div className="confirm-detail"><span className="label">Show</span><span className="value">{fmt12(selectedShow?.showTime)} — {selectedShow?.theatre}</span></div>
            <div className="confirm-detail"><span className="label">Seats</span><span className="value gold">{selectedSeats.map(s => s.seatNo).join(", ")}</span></div>
            <div className="confirm-detail"><span className="label">Total</span><span className="value gold">₹{totalAmount.toLocaleString()}</span></div>

            <div style={{ marginTop: 24 }}>
              <label className="input-label">Your Name</label>
              <input className="input-field" placeholder="Enter your name" value={userName} onChange={e => setUserName(e.target.value)} />
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <div className="btn-row">
              <button className="btn btn-outline" onClick={() => goTo(STEP.SEATS)}>← Back</button>
              <button className="btn btn-gold" disabled={!userName.trim() || loading} onClick={submitBooking}>
                {loading ? "Booking…" : "Confirm Booking ✓"}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            SUCCESS
        ════════════════════════════════════════════════ */}
        {step === STEP.CONFIRM && booking && (
          <div className="card">
            <div className="success-screen">
              <div className="success-icon">✓</div>
              <h2>Booking Confirmed!</h2>
              <p>Enjoy <strong style={{ color: "var(--text)" }}>{selectedMovie?.title}</strong></p>
              <div className="booking-id">Booking ID: <span>#{booking.bookingId}</span></div>
              <div style={{ marginTop: 8, color: "var(--text-dim)", fontSize: "0.9rem", fontWeight: 500 }}>
                Seats: {selectedSeats.map(s => s.seatNo).join(", ")} &nbsp;|&nbsp; ₹{totalAmount.toLocaleString()}
              </div>
              <div style={{ marginTop: 28 }}>
                <button className="btn btn-gold" onClick={restart}>Book Another Movie</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}