'use client';

import { useEffect, useState } from 'react';
import type { CastingCall as CastingCallType } from '@packages/core-contracts';

type EditableCastingCall = Partial<Omit<CastingCallType, 'id'>>;

export default function AdminValidationPage() {
  const [pendingCalls, setPendingCalls] = useState<CastingCallType[]>([]);
  const [selectedCall, setSelectedCall] = useState<CastingCallType | null>(null);
  const [editedCall, setEditedCall] = useState<EditableCastingCall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingCalls = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/casting-calls/pending');
      if (!res.ok) throw new Error('Failed to fetch pending casting calls');
      const data = await res.json();
      setPendingCalls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCalls();
  }, []);

  const handleSelectCall = (call: CastingCallType) => {
    setSelectedCall(call);
    setEditedCall({ ...call });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedCall) return;
    const { name, value } = e.target;
    setEditedCall(prev => ({ ...prev, [name]: value }));
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/v1/admin/casting-calls/${id}/approve`, { method: 'POST' });
    fetchPendingCalls();
    setSelectedCall(null);
  };
  
  const handleReject = async (id: string) => {
    await fetch(`/api/v1/admin/casting-calls/${id}/reject`, { method: 'POST' });
    fetchPendingCalls();
    setSelectedCall(null);
  };
  
  const handleEditAndApprove = async (id: string) => {
    if (!editedCall) return;
    await fetch(`/api/v1/admin/casting-calls/${id}/edit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedCall),
    });
    await handleApprove(id);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
      <div style={{ flex: 1 }}>
        <h2>Pending Casting Calls ({pendingCalls.length})</h2>
        <ul>
          {pendingCalls.map(call => (
            <li key={call.id} onClick={() => handleSelectCall(call)} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>
              <strong>{call.title}</strong><br />
              <small>{call.company} - {call.location}</small>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 2 }}>
        {selectedCall ? (
          <div>
            <h2>Review: {selectedCall.title}</h2>
            <p><a href={selectedCall.sourceUrl} target="_blank" rel="noopener noreferrer">Original Source</a></p>
            <div>
              {Object.entries(editedCall || {}).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>{key}</label>
                  <textarea name={key} value={value || ''} onChange={handleInputChange} style={{ width: '100%', minHeight: '50px' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => handleApprove(selectedCall.id!)}>Approve</button>
              <button onClick={() => handleEditAndApprove(selectedCall.id!)}>Save & Approve</button>
              <button onClick={() => handleReject(selectedCall.id!)} style={{ background: '#f44336' }}>Reject</button>
            </div>
          </div>
        ) : (
          <p>Select a casting call to review.</p>
        )}
      </div>
    </div>
  );
}
