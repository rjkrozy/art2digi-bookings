// app.js — Art2Digi Bookings Dashboard
//
// Private dashboard: log in with the one admin account you create in
// Supabase Auth, then view bookings + contact messages.
//
// This connects to the SAME art2digi-bookings Supabase project used by
// the registration pages on art2digi.com — not the hour-tracker project.
//
// Security note: this page's protection comes from Supabase RLS (only an
// authenticated user can SELECT from bookings/contacts), not from hiding
// the HTML or the URL. Someone could load this page without logging in,
// but every query returns empty/denied until they sign in with your
// real credentials.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://kpjftgaglzcnzqfczpcd.supabase.co',
  'sb_publishable_3bEXS_nVcR6TVPOYjezNMA_YnfOgLyA'
);

const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const loginError = document.getElementById('login-error');

async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    showApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.classList.add('visible');
  appView.classList.remove('visible');
}

async function showApp() {
  loginView.classList.remove('visible');
  appView.classList.add('visible');
  await Promise.all([loadBookings(), loadContacts()]);
}

// ---- Login / logout ----
document.getElementById('login-btn').addEventListener('click', async () => {
  loginError.textContent = '';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    loginError.textContent = 'Login failed — check your email/password.';
    console.error(error);
    return;
  }
  await showApp();
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  showLogin();
});

// ---- Tabs ----
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${btn.dataset.tab}-panel`).classList.add('active');
  });
});

// ---- Bookings ----
async function loadBookings() {
  const tbody = document.getElementById('bookings-tbody');
  tbody.innerHTML = '<tr><td colspan="8">Loading…</td></tr>';

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = '<tr><td colspan="8">Could not load bookings.</td></tr>';
    return;
  }

  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="8">No bookings yet.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(b => `
    <tr>
      <td>${b.campaign_type === 'malmok' ? 'Malmok' : 'Capture & Pose'}</td>
      <td>${escapeHtml(b.slot_label)}</td>
      <td>${escapeHtml(b.name)}</td>
      <td>${escapeHtml(b.email)}</td>
      <td>${escapeHtml(b.phone || '—')}</td>
      <td>AWG ${b.amount_awg}</td>
      <td>
        <select class="payment-status" data-id="${b.id}">
          <option value="pending" ${b.payment_status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="paid" ${b.payment_status === 'paid' ? 'selected' : ''}>Paid</option>
          <option value="cancelled" ${b.payment_status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>${new Date(b.created_at).toLocaleString()}</td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.payment-status').forEach(select => {
    select.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const payment_status = e.target.value;
      const { error } = await supabase.from('bookings').update({ payment_status }).eq('id', id);
      if (error) {
        console.error(error);
        alert('Could not update payment status — please try again.');
      }
    });
  });
}

// ---- Contacts ----
async function loadContacts() {
  const tbody = document.getElementById('contacts-tbody');
  tbody.innerHTML = '<tr><td colspan="4">Loading…</td></tr>';

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = '<tr><td colspan="4">Could not load messages.</td></tr>';
    return;
  }

  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="4">No messages yet.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(c => `
    <tr>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.message)}</td>
      <td>${new Date(c.created_at).toLocaleString()}</td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

init();
