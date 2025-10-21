import React, { useEffect, useState } from 'react'

const ENDPOINT = import.meta.env.VITE_BEECEPTOR_URL || '';

export function formatInternalNote(order) {
  const id = order?.orderId ?? 'N/A';
  const items = Array.isArray(order?.items) ? order.items.join(',') : 'none';
  return `Customer requested help with order ${id}, items ${items}.`;
}

export default function App() {
  const [data, setData] = useState(null);
  const [state, setState] = useState('idle'); // idle | loading | ok | error
  const [mappedFields, setMappedFields] = useState(null);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    if (!ENDPOINT) {
      setState('error');
      setErrorMsg('No Beeceptor URL set. Add VITE_BEECEPTOR_URL to your .env.');
      return;
    }
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(ENDPOINT, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const safe = {
        orderId: String(json.orderId ?? ''),
        customer: String(json.customer ?? ''),
        items: Array.isArray(json.items) ? json.items.map(String) : []
      };
      setData(safe);
      setState('ok');
    } catch (e) {
      setState('error');
      setErrorMsg('Couldn’t load data. Please retry.');
    }
  };

  useEffect(() => {
    // Auto-fetch on first load so you can screenshot immediately
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const populateTicketFields = () => {
    if (!data) return;
    setMappedFields({
      custom_order_id: data.orderId,
      custom_item_codes: data.items.join(',')
    });
  };

  const addInternalNote = () => {
    if (!data) return;
    setNote(formatInternalNote(data));
  };

  return (
    <main>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Zendesk Demo Panel</h1>
        <span className="badge">{state.toUpperCase()}</span>
      </header>

      <div className="toolbar">
        <button className="primary" onClick={fetchData}>Fetch Order</button>
        <button onClick={populateTicketFields} disabled={!data}>Populate Fields</button>
        <button onClick={addInternalNote} disabled={!data}>Add Internal Note</button>
      </div>

      {state === 'loading' && <p>Loading…</p>}

      {state === 'error' && (
        <div className="alert" role="alert">
          {errorMsg}
        </div>
      )}

      {state === 'ok' && data && (
        <section className="panel" aria-label="Order">
          <p><strong>Order:</strong> {data.orderId || '—'}</p>
          <p><strong>Customer:</strong> {data.customer || '—'}</p>
          <p><strong>Items:</strong> {data.items.length ? data.items.join(', ') : 'none'}</p>
        </section>
      )}

      {mappedFields && (
        <section style={{marginTop: 16}}>
          <h2>Mapped Fields (demo)</h2>
          <pre>{JSON.stringify(mappedFields, null, 2)}</pre>
        </section>
      )}

      {note && (
        <section style={{marginTop: 16}}>
          <h2>Internal Note (preview)</h2>
          <pre>{note}</pre>
        </section>
      )}

      <footer style={{marginTop: 20, color: '#666'}}>
        <small>Set your Beeceptor URL in <code>.env</code> → <code>VITE_BEECEPTOR_URL</code></small>
      </footer>
    </main>
  )
}
