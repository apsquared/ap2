'use client';

export default function LogoutButton() {
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    window.location.assign('/admin/login');
  }
  return (
    <button onClick={logout} className="btn-ghost text-sm">
      Log out
    </button>
  );
}
