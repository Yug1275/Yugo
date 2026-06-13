import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Theme toggle state
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute('data-theme') || 'light'
  );
  
  // Navbar scroll state
  const [scrolled, setScrolled] = useState(false);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yugo-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { q: "How do I book a ride on YUGO?", a: "Simply enter your destination in the 'Where to?' box, select your preferred ride option, and confirm. A driver will be matched with you instantly." },
    { q: "Is YUGO available in my city?", a: "YUGO currently operates in 10+ major cities across Gujarat, including Ahmedabad, Surat, Vadodara, and Rajkot. We're expanding rapidly!" },
    { q: "How are YUGO drivers verified?", a: "Safety is our priority. Every YUGO driver undergoes a rigorous background check, document verification, and vehicle inspection before they can accept rides." },
    { q: "What payment methods does YUGO accept?", a: "You can pay effortlessly using UPI, credit/debit cards, or cash directly to the driver at the end of your trip." },
    { q: "What if I forget something in the car?", a: "Don't worry! You can contact your driver through the app up to 24 hours after your ride, or reach out to our 24/7 support team for assistance." }
  ];

  return (
    <div style={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', color: 'var(--color-text-primary)', background: 'var(--color-bg)', overflowX: 'hidden' }}>
      
      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 5%', 
        position: 'fixed', 
        top: 0, 
        width: '100%', 
        zIndex: 100, 
        transition: 'all 0.3s ease',
        background: scrolled ? 'var(--color-surface)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent'
      }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: scrolled ? 'var(--color-text-primary)' : '#fff', letterSpacing: '-1px', transition: 'color 0.3s' }}>
          YUGO
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            onClick={toggleTheme} 
            style={{ 
              background: 'rgba(128,128,128,0.2)', 
              border: 'none', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: scrolled ? 'var(--color-text-primary)' : '#fff',
              transition: 'all 0.2s'
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {isAuthenticated ? (
            <Link to={`/${user?.role || 'rider'}`} style={{ 
              background: 'var(--gradient-primary)', color: '#fff', padding: '10px 24px', borderRadius: '99px', fontWeight: 600, textDecoration: 'none'
            }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ fontWeight: 600, color: scrolled ? 'var(--color-text-primary)' : '#fff', textDecoration: 'none', padding: '10px 16px' }}>Log In</Link>
              <Link to="/register" style={{ background: scrolled ? 'var(--color-text-primary)' : '#fff', color: scrolled ? 'var(--color-surface)' : '#000', padding: '10px 24px', borderRadius: '99px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ─── SECTION 1: HERO ──────────────────────────────────────── */}
      <section style={{ 
        position: 'relative',
        paddingTop: '120px', 
        paddingBottom: '80px', 
        paddingLeft: '5%', 
        paddingRight: '5%', 
        background: 'linear-gradient(135deg, #0f172a 0%, #1a2744 60%, #1e3a8a 100%)', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {/* Animated background circles */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'rgba(37,99,235,0.05)', animation: 'spin 40s linear infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'rgba(37,99,235,0.08)', animation: 'spin 30s linear infinite reverse', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px', maxWidth: '1280px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          
          <div style={{ flex: '1 1 500px', animation: 'fadeInDown 0.8s ease' }}>
            <h1 style={{ fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', color: '#fff', lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-2.5px', fontWeight: 800 }}>
              Move smarter.<br/>Arrive better.
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginBottom: '40px', maxWidth: '500px', lineHeight: 1.6 }}>
              Book rides instantly across Gujarat. Safe, affordable, real-time tracking.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <Link to="/register" style={{ background: 'var(--gradient-primary)', color: '#fff', padding: '16px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Book a Ride →
              </Link>
              <Link to="/register" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.3)', padding: '16px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600 }}>
                Drive with YUGO
              </Link>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '99px', color: '#fff', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>⭐ 4.9 Rating</div>
              <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '99px', color: '#fff', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>🚗 500+ Drivers</div>
              <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '99px', color: '#fff', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>📍 10+ Cities</div>
            </div>
          </div>

          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', animation: 'fadeIn 1s ease 0.2s both' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', color: '#000' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '24px', color: '#000', letterSpacing: '-1px' }}>Where to?</h2>
              
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <div style={{ position: 'absolute', left: '20px', top: '24px', bottom: '24px', width: '2px', background: '#e5e7eb', zIndex: 1 }} />
                <div style={{ position: 'absolute', left: '16px', top: '16px', width: '10px', height: '10px', borderRadius: '50%', background: '#000', zIndex: 2 }} />
                <div style={{ position: 'absolute', left: '16px', bottom: '16px', width: '10px', height: '10px', background: '#000', zIndex: 2 }} />

                <input type="text" placeholder="Enter pickup location" style={{ width: '100%', background: '#f3f4f6', border: 'none', padding: '16px 16px 16px 44px', borderRadius: '8px', marginBottom: '8px', fontSize: '1rem', outline: 'none', color: '#000' }} />
                <input type="text" placeholder="Enter destination" style={{ width: '100%', background: '#f3f4f6', border: 'none', padding: '16px 16px 16px 44px', borderRadius: '8px', fontSize: '1rem', outline: 'none', color: '#000' }} />
              </div>

              <Link to="/register" style={{ display: 'block', textAlign: 'center', background: 'var(--gradient-primary)', color: '#fff', padding: '16px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>
                See Prices →
              </Link>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>or</div>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#4b5563' }}>
                <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>Sign up</Link> to get 30% off your first ride
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── SECTION 2: RIDE OPTIONS GRID ──────────────────────── */}
      <section style={{ padding: '100px 5%', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', textAlign: 'center', marginBottom: '60px', letterSpacing: '-1px' }}>Everything you need to move</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              { icon: '🚗', title: 'City Rides', desc: 'Quick, affordable rides across the city' },
              { icon: '🛡️', title: 'Safe Rides', desc: 'Top-rated drivers, real-time tracking' },
              { icon: '💳', title: 'Easy Payments', desc: 'Pay via UPI, card, or cash' },
              { icon: '⚡', title: 'Instant Booking', desc: 'Confirmed in under 60 seconds' },
              { icon: '📍', title: 'Live Tracking', desc: 'Track your driver in real time' },
              { icon: '⭐', title: 'Rate & Review', desc: 'Share your experience after every ride' }
            ].map((feature, idx) => (
              <div key={idx} style={{ 
                background: 'var(--color-surface)', 
                padding: '32px', 
                borderRadius: '16px', 
                border: '1px solid var(--color-border)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-100), var(--color-primary-50))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '20px' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: HOW IT WORKS ───────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 5%', background: 'var(--color-surface-2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '80px', letterSpacing: '-1px' }}>Ride in 3 simple steps</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', position: 'relative' }}>
            {/* Connecting line (hidden on mobile) */}
            <div style={{ position: 'absolute', top: '30px', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, var(--color-primary) 0%, transparent 50%, var(--color-primary) 100%)', opacity: 0.2, zIndex: 0, '@media (maxWidth: 768px)': { display: 'none' } }} />

            {[
              { step: 1, icon: '📍', title: 'Enter your destination', desc: 'Open the app and tell us where you want to go.' },
              { step: 2, icon: '🚗', title: 'Get matched with a driver', desc: 'See your driver\'s details and track their arrival.' },
              { step: 3, icon: '✅', title: 'Arrive safely', desc: 'Enjoy the ride and pay seamlessly at the end.' }
            ].map((item) => (
              <div key={item.step} style={{ flex: '1 1 250px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 10px 20px rgba(37,99,235,0.3)' }}>
                  {item.step}
                </div>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: '280px' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: STATS BANNER ───────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '60px 5%' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { stat: '50,000+', label: 'Rides Completed' },
            { stat: '500+', label: 'Active Drivers' },
            { stat: '10+', label: 'Cities Covered' },
            { stat: '4.9★', label: 'Average Rating' }
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-1px' }}>{item.stat}</div>
              <div style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 5: DRIVER CTA SECTION ─────────────────────── */}
      <section style={{ padding: '100px 5%', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 500px' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', marginBottom: '24px', letterSpacing: '-1.5px' }}>Earn on your schedule</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
              Join 500+ YUGO drivers earning extra income. Set your own hours, keep more of what you earn.
            </p>
            <Link to="/register" style={{ display: 'inline-block', background: 'var(--gradient-primary)', color: '#fff', padding: '16px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, marginBottom: '40px' }}>
              Start Driving →
            </Link>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '10px 20px', borderRadius: '99px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Flexible hours</div>
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '10px 20px', borderRadius: '99px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Weekly payouts</div>
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '10px 20px', borderRadius: '99px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Top support</div>
            </div>
          </div>

          <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center', position: 'relative', height: '400px' }}>
            <div style={{ width: '280px', height: '280px', background: 'linear-gradient(135deg, var(--color-primary-100), var(--color-primary-50))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
              🚗
            </div>
            {/* Floating cards */}
            <div style={{ position: 'absolute', top: '20%', left: '10%', background: 'var(--color-surface)', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '8px', animation: 'blob-float 6s infinite' }}>
              <span>💸</span> ₹850 earned today
            </div>
            <div style={{ position: 'absolute', bottom: '20%', right: '10%', background: 'var(--color-surface)', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', animation: 'blob-float 8s infinite reverse' }}>
              <span>⭐</span> 4.9 rating
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: FAQ ACCORDION ──────────────────────────── */}
      <section style={{ padding: '100px 5%', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', marginBottom: '40px', textAlign: 'center', letterSpacing: '-1px' }}>Frequently asked questions</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s' }}>
                <button 
                  onClick={() => toggleFaq(idx)}
                  style={{ width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', textAlign: 'left' }}
                >
                  {faq.q}
                  <span style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
                    ▼
                  </span>
                </button>
                <div style={{ 
                  maxHeight: openFaq === idx ? '200px' : '0px', 
                  opacity: openFaq === idx ? 1 : 0, 
                  overflow: 'hidden', 
                  transition: 'all 0.3s ease',
                  padding: openFaq === idx ? '0 24px 24px 24px' : '0 24px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6
                }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: FOOTER ─────────────────────────────────── */}
      <footer style={{ background: 'var(--color-secondary)', color: '#fff', padding: '80px 5% 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px', letterSpacing: '-1px' }}>YUGO</div>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>Move smarter. Arrive better.<br/>Your premium ride partner.</p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '1.5rem' }}>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>🐦</a>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>📘</a>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>📸</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '24px', fontSize: '1.1rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '16px' }}>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>About</a></li>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Careers</a></li>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Blog</a></li>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Press</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '24px', fontSize: '1.1rem' }}>Product</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '16px' }}>
              <li><Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Book a Ride</Link></li>
              <li><Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Drive</Link></li>
              <li><a href="#safety" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Safety</a></li>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Cities</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '24px', fontSize: '1.1rem' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '16px' }}>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Help Center</a></li>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</a></li>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Terms</a></li>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy</a></li>
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', color: '#64748b', fontSize: '0.9rem' }}>
          <div>&copy; 2026 YUGO Technologies. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
