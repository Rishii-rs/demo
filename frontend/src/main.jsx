import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, ChevronDown, CircleAlert, Minus, Plus, Ticket, WalletCards } from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const money = (paise) => `₹${(paise / 100).toFixed(2)}`;

async function request(path, options) {
  const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Something went wrong.');
  return body.data;
}

function App() {
  const [shows, setShows] = useState([]);
  const [showId, setShowId] = useState('');
  const [tier, setTier] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [member, setMember] = useState(false);
  const [festivalOffer, setFestivalOffer] = useState(false);
  const [quote, setQuote] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState('');

  const selectedShow = shows.find((item) => item._id === showId);
  const selectedTier = selectedShow?.tiers.find((item) => item.name === tier);

  useEffect(() => { request('/shows').then((data) => { setShows(data); setShowId(data[0]?._id || ''); }).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!selectedShow) return; const firstBookable = selectedShow.tiers.find((item) => item.available > 0); setTier(firstBookable?.name || ''); setQuote(null); setBooking(null); }, [showId]);
  useEffect(() => {
    if (!showId || !tier || !quantity || !selectedTier || quantity > selectedTier.available) { setQuote(null); return; }
    const timer = setTimeout(async () => { setQuoting(true); setError(''); try { setQuote(await request('/pricing/calculate', { method: 'POST', body: JSON.stringify({ showId, tier, quantity, member, festivalOffer }) })); } catch (err) { setError(err.message); } finally { setQuoting(false); } }, 250);
    return () => clearTimeout(timer);
  }, [showId, tier, quantity, member, festivalOffer]);

  const book = async () => { setError(''); setQuoting(true); try { setBooking(await request('/bookings', { method: 'POST', body: JSON.stringify({ showId, tier, quantity, member, festivalOffer }) })); } catch (err) { setError(err.message); } finally { setQuoting(false); } };
  const reset = () => { setBooking(null); request('/shows').then((data) => { setShows(data); setShowId(data.find((item) => item._id === showId)?._id || data[0]?._id || ''); }); };

  if (loading) return <main className="center-state"><div className="spinner" /><p>Opening tonight's shows...</p></main>;
  if (booking) return <main className="center-state"><section className="confirmation"><div className="success-icon"><Check /></div><p className="eyebrow">Booking confirmed</p><h1>Your seats are yours.</h1><p className="muted">{booking.movieTitle} · {booking.showtime} · {booking.quantity} {booking.tier} ticket{booking.quantity > 1 ? 's' : ''}</p><div className="confirmation-total"><span>Paid</span><strong>{money(booking.pricing.finalTotalPaise)}</strong></div><p className="reference">Reference {booking._id.slice(-8).toUpperCase()}</p><button className="secondary-button" onClick={reset}>Book another show</button></section></main>;

  return <main className="page-shell">
    <header className="topbar"><div className="brand"><Ticket size={21} /><span>COUNTER<span className="brand-dot">/</span>01</span></div><span className="status"><i /> Live pricing</span></header>
    <section className="intro"><p className="eyebrow">Friday night at the multiplex</p><h1>Pick a story.<br /><em>We’ll do the math.</em></h1><p className="intro-copy">Transparent tickets, honest totals, no surprises at the counter.</p></section>
    {error && <div className="error-banner"><CircleAlert size={18} />{error}</div>}
    <div className="booking-layout">
      <section className="selection-column">
        <div className="step-heading"><span>01</span><div><p className="eyebrow">Choose a screening</p><h2>Now showing</h2></div></div>
        <div className="show-list">{shows.map((show) => <button key={show._id} className={`show-card ${showId === show._id ? 'selected' : ''}`} onClick={() => setShowId(show._id)}><div className="show-poster"><span>{show.movieTitle.split(' ').map((word) => word[0]).join('')}</span></div><div className="show-info"><h3>{show.movieTitle}</h3><p>{show.description}</p><span>{show.duration} <b>·</b> {show.showtime}</span></div>{showId === show._id && <Check className="selected-check" size={18} />}</button>)}</div>
        <div className="step-heading tier-heading"><span>02</span><div><p className="eyebrow">Build your booking</p><h2>Choose your seats</h2></div></div>
        <div className="tier-grid">{selectedShow?.tiers.map((item) => <button key={item.name} disabled={item.available === 0} className={`tier-card ${tier === item.name ? 'selected' : ''}`} onClick={() => { setTier(item.name); setQuantity(1); }}><div className="tier-top"><span className={`tier-mark ${item.name.toLowerCase()}`} />{item.available === 0 ? <span className="sold-out">Sold out</span> : <span className="availability">{item.available} left</span>}</div><h3>{item.name}</h3><strong>{money(item.pricePaise)}</strong><small>per ticket</small></button>)}</div>
        <div className="controls"><div><label htmlFor="quantity">Quantity</label><div className="quantity-control"><button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)}><Minus size={16} /></button><strong>{quantity}</strong><button aria-label="Increase quantity" disabled={!selectedTier || quantity >= selectedTier.available} onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button></div></div><label className="toggle-label"><input type="checkbox" checked={member} onChange={(event) => setMember(event.target.checked)} /><span className="toggle" /><span>Member pricing</span></label><label className="toggle-label"><input type="checkbox" checked={festivalOffer} onChange={(event) => setFestivalOffer(event.target.checked)} /><span className="toggle" /><span>Festival offer</span></label></div>
      </section>
      <aside className="receipt"><div className="receipt-header"><div><p className="eyebrow">Your order</p><h2>Price breakdown</h2></div><WalletCards size={22} /></div>{quote ? <><div className="receipt-context"><span>{quote.show.movieTitle}</span><span>{quote.tier} · {quote.quantity} ticket{quote.quantity > 1 ? 's' : ''}</span></div><div className="line-items">{quote.breakdown.slice(0, -1).map((line, index) => <div className={`line-item ${line.amountPaise < 0 ? 'discount' : ''}`} key={`${line.label}-${index}`}><span>{line.label}</span><strong>{line.amountPaise < 0 ? '-' : ''}{money(Math.abs(line.amountPaise))}</strong></div>)}</div><div className="total-row"><span>Total payable</span><strong>{money(quote.finalTotalPaise)}</strong></div><button className="book-button" disabled={quoting} onClick={book}>{quoting ? 'Rechecking availability...' : 'Confirm booking'} <ChevronDown size={18} /></button><p className="trust-note">Final price is recalculated securely before booking.</p></> : <div className="empty-receipt"><Ticket size={28} /><p>Select a seat tier to see your exact total.</p></div>}</aside>
    </div>
    <footer><span>All prices include a clear tax and fee breakdown.</span><span>INR · amounts shown to the exact paisa</span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
