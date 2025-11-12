import { useEffect, useMemo, useRef, useState } from 'react'
import { Plane, Map, Clock, ChevronRight, CreditCard, PlaneTakeoff, PlaneLanding } from 'lucide-react'
import Spline from '@splinetool/react-spline'

// Simple dataset of locations (IATA) with coordinates
const LOCATIONS = [
  { code: 'JFK', city: 'New York', country: 'USA', lat: 40.6413, lon: -73.7781 },
  { code: 'LAX', city: 'Los Angeles', country: 'USA', lat: 33.9416, lon: -118.4085 },
  { code: 'SFO', city: 'San Francisco', country: 'USA', lat: 37.6213, lon: -122.379 },
  { code: 'ORD', city: 'Chicago', country: 'USA', lat: 41.9742, lon: -87.9073 },
  { code: 'LHR', city: 'London', country: 'UK', lat: 51.4700, lon: -0.4543 },
  { code: 'CDG', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479 },
  { code: 'DXB', city: 'Dubai', country: 'UAE', lat: 25.2532, lon: 55.3657 },
  { code: 'HND', city: 'Tokyo', country: 'Japan', lat: 35.5494, lon: 139.7798 },
  { code: 'NRT', city: 'Tokyo-Narita', country: 'Japan', lat: 35.7719, lon: 140.3929 },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915 },
  { code: 'SYD', city: 'Sydney', country: 'Australia', lat: -33.9399, lon: 151.1753 },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622 },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683 },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', lat: 41.2974, lon: 2.0833 },
  { code: 'GRU', city: 'Sao Paulo', country: 'Brazil', lat: -23.4356, lon: -46.4731 },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', lat: -26.1337, lon: 28.2420 },
]

const AIRLINES = [
  'American Airlines',
  'Delta Air Lines',
  'United Airlines',
  'British Airways',
  'Air France',
  'Emirates',
  'Qatar Airways',
  'Singapore Airlines',
  'Lufthansa',
  'KLM',
]

// Average cruise speeds in km/h for common aircraft
const AIRCRAFT = [
  { type: 'Airbus A320', speed: 828 },
  { type: 'Airbus A350', speed: 905 },
  { type: 'Boeing 737-800', speed: 842 },
  { type: 'Boeing 777-300ER', speed: 892 },
  { type: 'Boeing 787-9', speed: 903 },
]

function toRad(d) { return (d * Math.PI) / 180 }
function haversineKm(a, b) {
  const R = 6371 // km
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const s1 = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1))
  return R * c
}

function currency(n) { return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) }

function App() {
  const [origin, setOrigin] = useState(LOCATIONS[0])
  const [destination, setDestination] = useState(LOCATIONS[4])
  const [airline, setAirline] = useState(AIRLINES[0])
  const [aircraft, setAircraft] = useState(AIRCRAFT[2])
  const [date, setDate] = useState('')
  const [estimated, setEstimated] = useState(null)

  const distanceKm = useMemo(() => haversineKm(origin, destination), [origin, destination])
  const timeHours = useMemo(() => distanceKm / aircraft.speed, [distanceKm, aircraft])

  const price = useMemo(() => {
    // Simple price model: base + per-km + small carrier multiplier
    const base = 79
    const perKm = 0.12
    const carrierFactor = 1 + (AIRLINES.indexOf(airline) % 3) * 0.05
    return Math.max(59, base + distanceKm * perKm) * carrierFactor
  }, [distanceKm, airline])

  function submitEstimate(e) {
    e.preventDefault()
    setEstimated({ distanceKm, timeHours, price })
    const el = document.getElementById('summary')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white">
      {/* Hero with Spline cover */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <Spline scene="https://prod.spline.design/O-AdlP9lTPNz-i8a/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/20 to-neutral-950/95" />
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <Plane className="h-4 w-4 text-orange-400" />
              <span className="text-white/90">HanzTravel — Book. Fly. Explore.</span>
            </div>
            <h1 className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight">
              Seamless flights with modern comfort
            </h1>
            <p className="mt-3 text-white/70 text-base sm:text-lg">
              Choose your route, favorite airline and aircraft, preview the map distance, and get an instant time and fare estimate.
            </p>
            <a href="#booking" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 font-semibold text-neutral-900 shadow-lg">
              Start your journey <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={submitEstimate} className="lg:col-span-2 rounded-xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-white/70">From</label>
                <div className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3">
                  <PlaneTakeoff className="h-4 w-4 text-orange-400" />
                  <select
                    className="w-full bg-transparent py-2 outline-none"
                    value={origin.code}
                    onChange={(e) => setOrigin(LOCATIONS.find(l => l.code === e.target.value))}
                  >
                    {LOCATIONS.map(l => (
                      <option key={l.code} value={l.code} className="bg-neutral-900">{l.city} ({l.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">To</label>
                <div className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3">
                  <PlaneLanding className="h-4 w-4 text-orange-400" />
                  <select
                    className="w-full bg-transparent py-2 outline-none"
                    value={destination.code}
                    onChange={(e) => setDestination(LOCATIONS.find(l => l.code === e.target.value))}
                  >
                    {LOCATIONS.map(l => (
                      <option key={l.code} value={l.code} className="bg-neutral-900">{l.city} ({l.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">Airline</label>
                <div className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3">
                  <Plane className="h-4 w-4 text-orange-400" />
                  <select className="w-full bg-transparent py-2 outline-none" value={airline} onChange={(e)=>setAirline(e.target.value)}>
                    {AIRLINES.map(a => (
                      <option key={a} value={a} className="bg-neutral-900">{a}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">Aircraft</label>
                <div className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3">
                  <Plane className="h-4 w-4 text-orange-400" />
                  <select className="w-full bg-transparent py-2 outline-none" value={aircraft.type} onChange={(e)=>setAircraft(AIRCRAFT.find(x=>x.type===e.target.value))}>
                    {AIRCRAFT.map(a => (
                      <option key={a.type} value={a.type} className="bg-neutral-900">{a.type} · {a.speed} km/h</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/70">Departure date</label>
                <input type="date" className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none" value={date} onChange={(e)=>setDate(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-neutral-800 p-3">
              <div className="flex items-center gap-3 text-white/80">
                <Map className="h-5 w-5 text-emerald-400" />
                <span>{origin.city} → {destination.city}</span>
                <span className="text-white/50">•</span>
                <span>{distanceKm.toFixed(0)} km</span>
                <span className="text-white/50">•</span>
                <div className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {timeHours.toFixed(2)} h</div>
              </div>
              <button type="submit" className="rounded-md bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 font-semibold text-neutral-900">Estimate</button>
            </div>
          </form>

          {/* Map preview using OpenStreetMap embeds for both points */}
          <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-3 backdrop-blur">
            <p className="mb-2 text-sm text-white/70">Map preview (origin & destination)</p>
            <div className="grid grid-cols-2 gap-3">
              <OSMCard title={`Origin: ${origin.city} (${origin.code})`} lat={origin.lat} lon={origin.lon} />
              <OSMCard title={`Destination: ${destination.city} (${destination.code})`} lat={destination.lat} lon={destination.lon} />
            </div>
            <p className="mt-3 text-xs text-white/50">Tip: This preview helps visualize distance. Route geometry may differ from actual flight path.</p>
          </div>
        </div>
      </section>

      {/* Estimate summary and PayPal */}
      <section id="summary" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-neutral-900/60 p-6">
            <h3 className="text-xl font-semibold">Trip summary</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryTile label="Distance" value={`${distanceKm.toFixed(0)} km`} icon={<Map className="h-4 w-4" />} />
              <SummaryTile label="Est. time" value={`${timeHours.toFixed(2)} h`} icon={<Clock className="h-4 w-4" />} />
              <SummaryTile label="Fare" value={currency(price)} icon={<CreditCard className="h-4 w-4" />} />
            </div>
            <div className="mt-6 rounded-lg bg-neutral-800 p-4 text-sm text-white/70">
              <p><span className="font-semibold text-white">Route:</span> {origin.city} ({origin.code}) → {destination.city} ({destination.code})</p>
              <p><span className="font-semibold text-white">Airline:</span> {airline}</p>
              <p><span className="font-semibold text-white">Aircraft:</span> {aircraft.type}</p>
              {date && <p><span className="font-semibold text-white">Date:</span> {date}</p>}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-6">
            <h3 className="mb-2 text-xl font-semibold">Pay with PayPal</h3>
            <p className="text-sm text-white/70">Secure checkout powered by PayPal. This demo uses a sandbox client for testing.</p>
            <PayPalButton amount={Math.round(price)} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-neutral-950">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-white/70">
          <p>© 2025 HanzTravel — Visit the Whole World</p>
          <p className="text-white/50">Crafted with precision and passion</p>
        </div>
      </footer>
    </div>
  )
}

function SummaryTile({ label, value, icon }) {
  return (
    <div className="rounded-lg bg-neutral-800 p-4">
      <div className="flex items-center gap-2 text-white/60">{icon}<span className="text-sm">{label}</span></div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}

function OSMCard({ title, lat, lon }) {
  // Build an OpenStreetMap embed URL centered on the given coords with a marker
  const zoom = 4
  const src = `https://www.openstreetmap.org/export/embed.html?&marker=${lat}%2C${lon}&layers=mapnik&bbox=${lon-5}%2C${lat-3}%2C${lon+5}%2C${lat+3}`
  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <div className="bg-neutral-800 px-3 py-2 text-sm text-white/80">{title}</div>
      <iframe title={title} className="h-52 w-full" src={src} />
    </div>
  )
}

function PayPalButton({ amount }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      // If PayPal already loaded, render directly
      if (window.paypal) {
        renderButtons()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD'
      script.async = true
      script.onload = () => isMounted && renderButtons()
      document.body.appendChild(script)
      return () => { script.remove() }
    }

    function renderButtons() {
      if (!containerRef.current) return
      containerRef.current.innerHTML = ''
      window.paypal.Buttons({
        style: { layout: 'vertical', shape: 'rect', color: 'gold' },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: String(amount) }, description: 'HanzTravel Flight Booking' }]
          })
        },
        onApprove: async (data, actions) => {
          try {
            const details = await actions.order.capture()
            alert(`Payment successful! Thank you, ${details.payer.name.given_name}.`)
          } catch (e) {
            console.error(e)
            alert('Payment approved but capture failed.')
          }
        },
        onError: (err) => {
          console.error(err)
          alert('PayPal error occurred. Please try again.')
        }
      }).render(containerRef.current)
    }

    const cleanup = load()
    return () => {
      isMounted = false
      if (typeof cleanup === 'function') cleanup()
    }
  }, [amount])

  return (
    <div className="mt-4 rounded-lg bg-neutral-800 p-4">
      <div className="mb-2 text-sm text-white/80">Amount due today: <span className="font-semibold text-white">{currency(amount)}</span></div>
      <div ref={containerRef} />
    </div>
  )
}

export default App
