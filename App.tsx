import React, { useState } from 'react';

type FlightInput = {
  airline: string;     // IB, AM, KL…
  number: string;      // 150, 40…
  date: string;        // 2025-12-08
};

type FlightStatus = 'on_time' | 'delayed' | 'cancelled' | 'unknown';

type FlightInfo = FlightInput & {
  id: string;
  from?: string;
  to?: string;
  departureTimeLocal?: string;
  arrivalTimeLocal?: string;
  registration?: string;       // Matrícula, ej: EC-MYC
  aircraftType?: string;       // A359, 789, 77W…
  aircraftAgeYears?: number;   // 6.3
  previousLegStatus?: FlightStatus;
  previousLegDelayMinutes?: number | null;
  loading: boolean;
  error?: string | null;
};

// === MOCK: aquí simulo la respuesta de una API real ===
// Cambias esta función para llamar a AeroDataBox / AviationStack / lo que uses.
async function fetchFlightInfoFromApi(
  input: FlightInput,
): Promise<Omit<FlightInfo, 'id' | 'loading'>> {
  // TODO: sustituir por llamada real:
  // const res = await fetch('https://TU_API/flights?...', { headers: {...} });
  // const data = await res.json();

  // Mock para que veas la estructura:
  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeAge = 5.7; // años
      resolve({
        ...input,
        from: 'MAD',
        to: 'CUN',
        departureTimeLocal: `${input.date}T15:40`,
        arrivalTimeLocal: `${input.date}T20:10`,
        registration: 'EC-MYC',
        aircraftType: 'A359',
        aircraftAgeYears: fakeAge,
        previousLegStatus: 'on_time',
        previousLegDelayMinutes: 0,
        error: null,
      });
    }, 800);
  });
}

const formatAge = (age?: number) => {
  if (age == null) return '—';
  if (age < 0.5) return 'Menos de 1 año';
  return `${age.toFixed(1)} años`;
};

const formatStatus = (status?: FlightStatus, delay?: number | null) => {
  if (!status || status === 'unknown') return 'Sin datos';
  if (status === 'on_time') return 'Último tramo: en horario';
  if (status === 'cancelled') return 'Último tramo: cancelado';
  if (status === 'delayed') {
    const mins = delay ?? 0;
    if (mins <= 0) return 'Último tramo: con retraso';
    return `Último tramo: +${mins} min`;
  }
  return 'Sin datos';
};

const App: React.FC = () => {
  const [airline, setAirline] = useState('IB');
  const [number, setNumber] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10), // hoy por defecto
  );

  const [flights, setFlights] = useState<FlightInfo[]>([]);

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNumber = number.trim();
    const trimmedAirline = airline.trim().toUpperCase();

    if (!trimmedAirline || !trimmedNumber || !date) return;

    const base: FlightInput = {
      airline: trimmedAirline,
      number: trimmedNumber,
      date,
    };

    const id = `${trimmedAirline}${trimmedNumber}-${date}-${Date.now()}`;

    // Añadimos el vuelo en estado "cargando"
    setFlights((prev) => [
      {
        ...base,
        id,
        loading: true,
        error: null,
      },
      ...prev,
    ]);

    try {
      const apiData = await fetchFlightInfoFromApi(base);

      setFlights((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                ...apiData,
                loading: false,
              }
            : f,
        ),
      );
    } catch (err) {
      console.error(err);
      setFlights((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                loading: false,
                error: 'No se pudo obtener la info del vuelo',
              }
            : f,
        ),
      );
    }
  };

  const handleRemoveFlight = (id: string) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex justify-center px-3 py-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header simple */}
        <header className="mb-2">
          <h1 className="text-xl font-bold tracking-tight">
            Demasiado Vuelos
          </h1>
          <p className="text-xs text-slate-400">
            Añade tus próximos vuelos y mira matrícula y antigüedad del avión.
          </p>
        </header>

        {/* Formulario de alta rápida */}
        <form
          onSubmit={handleAddFlight}
          className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3"
        >
          <div className="flex gap-2">
            <div className="w-20">
              <label className="block text-[10px] font-medium text-slate-400 mb-1">
                Aerolínea
              </label>
              <input
                value={airline}
                onChange={(e) => setAirline(e.target.value.toUpperCase())}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-sm text-center"
                maxLength={3}
                placeholder="IB"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-medium text-slate-400 mb-1">
                Nº de vuelo
              </label>
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1 text-sm"
                placeholder="150"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-medium text-slate-400 mb-1">
                Fecha (salida local)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1 text-sm"
              />
            </div>
            <button
              type="submit"
              className="whitespace-nowrap rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
            >
              Añadir vuelo
            </button>
          </div>
        </form>

        {/* Lista de vuelos */}
        <section className="space-y-2">
          {flights.length === 0 && (
            <div className="text-xs text-slate-500 border border-dashed border-slate-700 rounded-2xl p-4 text-center">
              No tienes vuelos cargados. Empieza añadiendo IB 6401, QR 150,
              etc.
            </div>
          )}

          {flights.map((f) => (
            <article
              key={f.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 text-xs space-y-2"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold">
                      {f.airline} {f.number}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {f.date}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {f.from && f.to ? (
                      <>
                        {f.from} → {f.to}
                      </>
                    ) : (
                      'Ruta pendiente de cargar'
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {f.departureTimeLocal && f.arrivalTimeLocal
                      ? `Sale ${f.departureTimeLocal} · Llega ${f.arrivalTimeLocal}`
                      : 'Horarios aún no cargados'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFlight(f.id)}
                  className="text-[10px] text-slate-500 hover:text-rose-400"
                >
                  Quitar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">
                    Matrícula
                  </div>
                  <div className="text-xs font-semibold">
                    {f.loading
                      ? 'Cargando…'
                      : f.registration || 'Sin datos aún'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Modelo:{' '}
                    <span className="text-slate-200">
                      {f.aircraftType || '—'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">
                    Antigüedad
                  </div>
                  <div className="text-xs font-semibold">
                    {f.loading ? 'Cargando…' : formatAge(f.aircraftAgeYears)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {f.loading
                      ? ''
                      : formatStatus(
                          f.previousLegStatus,
                          f.previousLegDelayMinutes,
                        )}
                  </div>
                </div>
              </div>

              {f.error && (
                <div className="text-[10px] text-rose-400 mt-1">
                  {f.error}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default App;

