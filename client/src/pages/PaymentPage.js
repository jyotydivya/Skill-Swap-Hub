import React, { useState } from 'react';
import { paymentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['Up to 3 skills listed', '5 swap requests/month', 'Basic search', 'Community access'],
    color: '#6b7280',
    bg: '#f9fafb',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    period: 'per month',
    popular: true,
    features: ['Unlimited skills listed', 'Featured listing badge', 'Unlimited requests', 'Priority in search', 'Priority support'],
    color: '#1a7a5e',
    bg: '#f0fdf9',
  },
  {
    id: 'team',
    name: 'Team',
    price: '₹799',
    period: 'per month',
    features: ['Everything in Pro', '5 sub-accounts', 'Team analytics dashboard', 'Custom profile branding', 'Dedicated support'],
    color: '#7c3aed',
    bg: '#faf5ff',
  },
];

export default function PaymentPage() {
  const { user, updateUser } = useAuth();
  const [selected, setSelected]   = useState('pro');
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 4000);
  };

  const handlePayment = async () => {
    if (selected === 'free') { showToast('You are already on the free plan.', 'info'); return; }

    setLoading(true);
    try {
      const res = await paymentAPI.createOrder(selected);
      const { order, paymentId, key } = res.data;

      // Load Razorpay checkout script
      await loadRazorpayScript();

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'SkillSwap Hub',
        description: `${selected.toUpperCase()} Plan Subscription`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await paymentAPI.verify({
              paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
              plan: selected,
            });
            updateUser({ isPremium: true, premiumPlan: selected });
            showToast(`🎉 ${selected.toUpperCase()} plan activated successfully!`, 'success');
          } catch {
            showToast('Payment verification failed. Contact support.', 'error');
          }
        },
        prefill: {
          name:  `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        theme: { color: '#1a7a5e' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: toastType === 'error' ? '#dc2626' : toastType === 'info' ? '#1d4ed8' : '#1a7a5e',
          color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
        }}>
          {toast}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', marginBottom: 8 }}>
          Upgrade Your Plan
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280' }}>
          Get more visibility, unlimited requests, and premium features
        </p>
        {user?.isPremium && (
          <div style={{
            display: 'inline-block', marginTop: 12,
            background: '#fef3c7', color: '#b45309',
            padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
          }}>
            ⭐ You are currently on the {user.premiumPlan?.toUpperCase()} plan
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16, marginBottom: 40,
      }}>
        {PLANS.map(plan => (
          <div key={plan.id}
            onClick={() => setSelected(plan.id)}
            style={{
              background: plan.bg,
              border: `${selected === plan.id ? '2.5px' : '1px'} solid ${selected === plan.id ? plan.color : '#e5e7eb'}`,
              borderRadius: 16, padding: '24px 20px', cursor: 'pointer',
              transition: 'all 0.15s', position: 'relative',
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                background: '#1a7a5e', color: '#fff',
                padding: '3px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                Most Popular
              </div>
            )}

            <div style={{ fontWeight: 800, fontSize: 16, color: plan.color, marginBottom: 4 }}>
              {plan.name}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', marginBottom: 2 }}>
              {plan.price}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 18 }}>{plan.period}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#374151' }}>
                  <span style={{ color: plan.color, fontWeight: 700, fontSize: 14 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>

            {selected === plan.id && (
              <div style={{
                marginTop: 16, textAlign: 'center', fontSize: 12,
                color: plan.color, fontWeight: 600,
              }}>
                ● Selected
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment section */}
      {selected !== 'free' && (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 16, padding: 28, maxWidth: 420, margin: '0 auto',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
            Complete Your Purchase
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            Powered by Razorpay — test mode enabled
          </p>

          <div style={{
            background: '#f9fafb', borderRadius: 10, padding: '14px 16px',
            marginBottom: 20, border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
              <span style={{ color: '#6b7280' }}>Plan</span>
              <span style={{ fontWeight: 700 }}>
                {PLANS.find(p => p.id === selected)?.name}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#6b7280' }}>Amount</span>
              <span style={{ fontWeight: 700, color: '#1a7a5e' }}>
                {PLANS.find(p => p.id === selected)?.price}/month
              </span>
            </div>
          </div>

          <div style={{
            background: '#fef9ee', border: '1px solid #fde68a',
            borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#b45309',
          }}>
            <strong>Test card:</strong> 4111 1111 1111 1111 · Any future date · Any CVV · OTP: 1234
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#9ca3af' : '#1a7a5e',
              color: '#fff', border: 'none', borderRadius: 9,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processing...' : `Pay with Razorpay →`}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
            Secure payment · Cancel anytime · No real charges in test mode
          </p>
        </div>
      )}
    </div>
  );
}
