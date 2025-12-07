// src/App.tsx
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

type Flight = {
  id: string;
  flightNumber: string;
  tailNumber: string;
  ageYears?: number;
  departureDate?: string; // ISO: 2025-12-08, por ejemplo
};

const App: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  const [flightNumber, setFlightNumber] = useState('');
  const [tailNumber, setTailNumber] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [departureDate, setDepartureDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suscripción a Firestore
  useEffect(() => {
    const colRef = collection(db, 'flights');
    const q = query(colRef, orderBy('departureDate', 'asc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data: Flight[] = snapshot.docs.map((doc) => {
          const raw = doc.data() as any;
          return {
            id: doc.id,
            flightNumber: raw.flightNumber ?? '',
            tailNumber: raw.tailNumber ?? '',
            ageYears: raw.ageYears,
            departureDate: raw.departureDate,
          };
        });

        setFlights(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error al escuchar flights:', err);
        setError('No se pudo cargar la lista de vuelos.');
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!flightNumber.trim()) {
      setError('El número de vuelo es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const age = ageYears ? parseFloat(ageYears.replace(',', '.')) : undefined;

      await addDoc(collection(db, 'flights'), {
        flightNumber: flightNumber.trim(),
        tailNumber: tailNumber.trim() || null,
        ageYears: age ?? null,
        departureDate: departureDate || null,
        createdAt: new Date().toISOString(),
      });

      setFlightNumber('');
      setTailNumber('');
      setAgeYears('');
      setDepartureDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      console.error('Error al guardar vuelo:', err);
      setError('No se pudo guardar el vuelo. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 24,
          border: '2px solid #38bdf8',
          padding: 20,
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          background:
            'radial-gradient(circle at top, rgba(56,189,248,0.15), transparent 55%), #020617',
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 4,
            textAlign: 'center',
          }}
        >
          Vuelapp ✈️
        </h1>
        <p
          style={{
            fontSize: 12,
            opacity: 0.8,
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          Lista rápida de próximos vuelos, con matrícula y antigüedad manual.
        </p>

        {/* Formulario */}
        <form onSubmit={handleAddFlight} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, opacity: 0.7 }}>
                Número de vuelo *
              </label>
              <input
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="Ej: AM010, KL702"
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(148,163,184,0.6)',
                  backgroundColor: '#020617',
                  color: 'white',
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, opacity: 0.7 }}>
                Matrícula (tail number)
              </label>
              <input
                value={tailNumber}
                onChange={(e) => setTailNumber(e.target.value.toUpperCase())}
                placeholder="Ej: N123AB, PH-BXA"
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(148,163,184,0.6)',
                  backgroundColor: '#020617',
                  color: 'white',
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, opacity: 0.7 }}>
                  Antigüedad (años)
                </label>
                <input
                  value={ageYears}
                  onChange={(e) => setAgeYears(e.target.value)}
                  placeholder="Ej: 8,5"
                  inputMode="decimal"
                  style={{
                    width: '100%',
                    marginTop: 4,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid rgba(148,163,184,0.6)',
                    backgroundColor: '#020617',
                    color: 'white',
                    fontSize: 13,
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, opacity: 0.7 }}>
                  Fecha vuelo
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: 4,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid rgba(148,163,184,0.6)',
                    backgroundColor: '#020617',
                    color: 'white',
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  fontSize: 11,
                  color: '#fca5a5',
                  marginTop: 4,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: 4,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 999,
                border: 'none',
                background:
                  'linear-gradient(90deg, #38bdf8, #6366f1)',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Guardando…' : 'Agregar vuelo'}
            </button>
          </div>
        </form>

        {/* Lista de vuelos */}
        <div
          style={{
            borderRadius: 16,
            border: '1px solid rgba(148,163,184,0.35)',
            padding: 10,
            maxHeight: 260,
            overflowY: 'auto',
            background:
              'linear-gradient(to bottom, rgba(15,23,42,0.9), rgba(15,23,42,0.98))',
          }}
        >
          <div
            style={{
              fontSize: 11,
              opacity: 0.7,
              marginBottom: 6,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Próximos vuelos</span>
            {loading && <span>Cargando…</span>}
          </div>

          {!loading && flights.length === 0 && (
            <div
              style={{
                fontSize: 12,
                opacity: 0.7,
                textAlign: 'center',
                padding: '12px 4px',
              }}
            >
              Aún no agregaste vuelos. Empieza arriba.
            </div>
          )}

          {flights.map((f) => (
            <div
              key={f.id}
              style={{
                padding: '8px 10px',
                borderRadius: 12,
                border: '1px solid rgba(148,163,184,0.3)',
                marginBottom: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background:
                  'radial-gradient(circle at top left, rgba(56,189,248,0.18), transparent 60%)',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                  }}
                >
                  {f.flightNumber}
                </div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>
                  {f.tailNumber || 'Sin matrícula'}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11 }}>
                {f.ageYears != null && !isNaN(f.ageYears) && (
                  <div>{f.ageYears.toFixed(1)} años</div>
                )}
                <div style={{ opacity: 0.7 }}>
                  {f.departureDate || 'Fecha sin definir'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
