import React, { useEffect, useState } from 'react';
import { requestsAPI, sessionsAPI, reviewsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = [
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#fef3c7', color: '#b45309' },
];
function getAv(name = '') {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function Avatar({ name = '', size = 40 }) {
  const av = getAv(name);
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: av.bg, color: av.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:   { bg: '#fef9ee', color: '#b45309', label: 'Pending' },
    accepted:  { bg: '#dcfce7', color: '#15803d', label: 'Accepted' },
    rejected:  { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
    cancelled: { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
    upcoming:  { bg: '#eff6ff', color: '#1d4ed8', label: 'Upcoming' },
    completed: { bg: '#dcfce7', color: '#15803d', label: 'Completed' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, padding: '3px 10px',
      borderRadius: 20, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [incoming, setIncoming]   = useState([]);
  const [outgoing, setOutgoing]   = useState([]);
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm]   = useState({ rating: 5, comment: '' });
  const [tab, setTab] = useState('incoming');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = () => {
    setLoading(true);
    Promise.all([requestsAPI.getMy(), sessionsAPI.getMy()])
      .then(([rRes, sRes]) => {
        setIncoming(rRes.data.incoming);
        setOutgoing(rRes.data.outgoing);
        setSessions(sRes.data.sessions);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await requestsAPI.updateStatus(id, status);
      showToast(status === 'accepted' ? 'Request accepted! Session created.' : 'Request declined.');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleComplete = async (sessionId) => {
    try {
      await sessionsAPI.complete(sessionId);
      showToast('Session marked as complete!');
      load();
    } catch {
      showToast('Could not mark session complete.');
    }
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    try {
      await reviewsAPI.create({
        session: reviewModal.session._id,
        reviewee: reviewModal.reviewee,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        skillSwapped: reviewModal.session.request?.skillOffered + ' ↔ ' + reviewModal.session.request?.skillWanted,
      });
      showToast('Review submitted!');
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading...</div>;

  const upcoming = sessions.filter(s => s.status === 'upcoming');
  const past     = sessions.filter(s => s.status === 'completed');

  const tabStyle = (t) => ({
    padding: '8px 18px', borderRadius: 8,
    border: 'none', fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
    background: tab === t ? '#1a7a5e' : '#f3f4f6',
    color: tab === t ? '#fff' : '#6b7280',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: '#1a7a5e', color: '#fff',
          padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
        }}>{toast}</div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 400,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Leave a Review</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
                Rating
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                    style={{
                      width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: n <= reviewForm.rating ? '#f59e0b' : '#f3f4f6',
                      color: n <= reviewForm.rating ? '#fff' : '#9ca3af',
                      fontSize: 18,
                    }}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
                Comment
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience..."
                style={{
                  width: '100%', padding: '10px 12px', height: 90, resize: 'vertical',
                  border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleReview} style={{
                flex: 1, padding: '10px', background: '#1a7a5e', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Submit Review
              </button>
              <button onClick={() => setReviewModal(null)} style={{
                padding: '10px 18px', background: '#f3f4f6', color: '#6b7280',
                border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Bookings & Requests</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button style={tabStyle('incoming')} onClick={() => setTab('incoming')}>
          Incoming ({incoming.length})
        </button>
        <button style={tabStyle('outgoing')} onClick={() => setTab('outgoing')}>
          Sent ({outgoing.length})
        </button>
        <button style={tabStyle('upcoming')} onClick={() => setTab('upcoming')}>
          Upcoming ({upcoming.length})
        </button>
        <button style={tabStyle('past')} onClick={() => setTab('past')}>
          Past ({past.length})
        </button>
      </div>

      {/* ── Incoming Requests ───────────────────────── */}
      {tab === 'incoming' && (
        <div>
          {incoming.length === 0 ? (
            <Empty msg="No incoming requests yet." />
          ) : incoming.map(req => {
            const name = `${req.from?.firstName} ${req.from?.lastName}`;
            return (
              <RequestCard key={req._id}>
                <Avatar name={name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    Offers: <b>{req.skillOffered}</b> &nbsp;·&nbsp; Wants: <b>{req.skillWanted}</b>
                  </div>
                  {req.message && (
                    <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 4 }}>
                      "{req.message}"
                    </div>
                  )}
                  {req.proposedDate && (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                      📅 {new Date(req.proposedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  {req.status === 'pending' ? (
                    <>
                      <button onClick={() => handleStatus(req._id, 'accepted')} style={{
                        background: '#1a7a5e', color: '#fff', padding: '7px 16px',
                        borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>
                        Accept
                      </button>
                      <button onClick={() => handleStatus(req._id, 'rejected')} style={{
                        background: '#f3f4f6', color: '#6b7280', padding: '7px 16px',
                        borderRadius: 7, border: 'none', fontSize: 13, cursor: 'pointer',
                      }}>
                        Decline
                      </button>
                    </>
                  ) : (
                    <StatusBadge status={req.status} />
                  )}
                </div>
              </RequestCard>
            );
          })}
        </div>
      )}

      {/* ── Outgoing Requests ───────────────────────── */}
      {tab === 'outgoing' && (
        <div>
          {outgoing.length === 0 ? (
            <Empty msg="You haven't sent any requests yet." />
          ) : outgoing.map(req => {
            const name = `${req.to?.firstName} ${req.to?.lastName}`;
            return (
              <RequestCard key={req._id}>
                <Avatar name={name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    Your offer: <b>{req.skillOffered}</b> &nbsp;·&nbsp; You want: <b>{req.skillWanted}</b>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                    Sent {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </RequestCard>
            );
          })}
        </div>
      )}

      {/* ── Upcoming Sessions ───────────────────────── */}
      {tab === 'upcoming' && (
        <div>
          {upcoming.length === 0 ? (
            <Empty msg="No upcoming sessions." />
          ) : upcoming.map(s => {
            const other = s.participants?.find(p => p._id !== user?._id);
            const name = other ? `${other.firstName} ${other.lastName}` : 'Unknown';
            return (
              <RequestCard key={s._id}>
                <Avatar name={name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {s.request?.skillOffered} ↔ {s.request?.skillWanted}
                  </div>
                  <div style={{ fontSize: 12, color: '#1a7a5e', marginTop: 4 }}>
                    📅 {new Date(s.scheduledAt).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })} · {s.duration} mins
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <StatusBadge status="upcoming" />
                  <button onClick={() => handleComplete(s._id)} style={{
                    background: '#dcfce7', color: '#15803d', padding: '6px 14px',
                    borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Mark Done
                  </button>
                </div>
              </RequestCard>
            );
          })}
        </div>
      )}

      {/* ── Past Sessions ───────────────────────────── */}
      {tab === 'past' && (
        <div>
          {past.length === 0 ? (
            <Empty msg="No completed sessions yet." />
          ) : past.map(s => {
            const other = s.participants?.find(p => p._id !== user?._id);
            const name = other ? `${other.firstName} ${other.lastName}` : 'Unknown';
            return (
              <RequestCard key={s._id}>
                <Avatar name={name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {s.request?.skillOffered} ↔ {s.request?.skillWanted}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                    Completed {new Date(s.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <StatusBadge status="completed" />
                  {other && (
                    <button
                      onClick={() => setReviewModal({ session: s, reviewee: other._id })}
                      style={{
                        background: '#eff6ff', color: '#1d4ed8', padding: '6px 14px',
                        borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Rate
                    </button>
                  )}
                </div>
              </RequestCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequestCard({ children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: 12, padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      marginBottom: 10, flexWrap: 'wrap',
    }}>
      {children}
    </div>
  );
}

function Empty({ msg }) {
  return (
    <div style={{
      textAlign: 'center', padding: 48, background: '#f9fafb',
      borderRadius: 14, border: '1px dashed #d1d5db',
      fontSize: 14, color: '#9ca3af',
    }}>
      {msg}
    </div>
  );
}
