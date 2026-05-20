'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && (session.user as any).role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && (session.user as any).role === 'admin') {
      loadUsers();
    }
  }, [status, session]);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setFormError(data.error || 'Greška pri kreiranju naloga.');
    } else {
      setFormSuccess(`Nalog "${data.email}" je uspešno kreiran!`);
      setEmail('');
      setPassword('');
      setName('');
      setRole('student');
      loadUsers();
    }
  }

  async function handleDelete(id: number, userEmail: string) {
    if (!confirm(`Sigurno želite da obrišete nalog "${userEmail}"?`)) return;
    setDeletingId(id);
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setDeletingId(null);
    loadUsers();
  }

  if (status === 'loading') return <div className={styles.loading}><span className={styles.spinner} /></div>;
  if ((session?.user as any)?.role !== 'admin') return null;

  const students = users.filter(u => u.role === 'student');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <Image 
              src="/images/logo.png" 
              alt="Logo" 
              width={36} 
              height={36} 
              priority
            />
          </div>
          <span className={styles.brandName}>Nauči Matematiku</span>
          <span className={styles.adminBadge}>Admin panel</span>
        </div>
        <div className={styles.navRight}>
          <button className={styles.dashBtn} onClick={() => router.push('/dashboard')}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            <span>Dashboard</span>
          </button>
          <div className={styles.userBadge}>
            <div className={styles.avatar}>A</div>
            <span className={styles.userName}>{session?.user?.name}</span>
          </div>
          <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Odjavi se</span>
          </button>
        </div>
      </nav>

      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Upravljanje nalozima</h1>
          <p className={styles.pageSubtitle}>Kreirajte i upravljajte korisničkim nalozima.</p>
        </div>

        <div className={styles.layout}>
          {/* LEFT — Create form */}
          <div className={styles.formSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrap}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M15 3v4M13 5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className={styles.cardTitle}>Novi nalog</h2>
                  <p className={styles.cardSub}>Unesite podatke za novog korisnika</p>
                </div>
              </div>

              <form className={styles.form} onSubmit={handleCreate}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Ime i prezime
                    <span className={styles.optional}>opciono</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M2 13.5c0-2.485 2.686-4.5 6-4.5s6 2.015 6 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="npr. Nikola Jovanović"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Email adresa
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M1 5.5L8 9.5L15 5.5" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="korisnik@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Lozinka
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <circle cx="8" cy="11" r="1" fill="currentColor"/>
                    </svg>
                    <input
                      className={styles.input}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 karaktera"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                          <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.4"/>
                          <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
                          <path d="M3 3l10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                          <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.4"/>
                          <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {password.length > 0 && password.length < 6 && (
                    <p className={styles.fieldHint}>Još {6 - password.length} karaktera</p>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Tip naloga</label>
                  <div className={styles.roleToggle}>
                    <button
                      type="button"
                      className={`${styles.roleBtn} ${role === 'student' ? styles.roleBtnActive : ''}`}
                      onClick={() => setRole('student')}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M2 14c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      Student
                    </button>
                    <button
                      type="button"
                      className={`${styles.roleBtn} ${role === 'admin' ? styles.roleBtnActiveAdmin : ''}`}
                      onClick={() => setRole('admin')}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1l1.5 3.5L13 5l-2.5 2.5.5 3.5L8 9.5 5 11l.5-3.5L3 5l3.5-.5L8 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                      </svg>
                      Admin
                    </button>
                  </div>
                </div>

                {formError && (
                  <div className={styles.errorBox}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="var(--red)" strokeWidth="1.4"/>
                      <path d="M7 4v3M7 9.5v.5" stroke="var(--red)" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className={styles.successBox}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="var(--green)" strokeWidth="1.4"/>
                      <path d="M4.5 7l2 2 3-3" stroke="var(--green)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {formSuccess}
                  </div>
                )}

                <button className={styles.submitBtn} type="submit" disabled={submitting}>
                  {submitting ? (
                    <span className={styles.spinner} />
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      Kreiraj nalog
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT — User list */}
          <div className={styles.listSection}>
            <div className={styles.statsRow}>
              <div className={styles.statPill}>
                <span className={styles.statPillNum}>{users.length}</span>
                <span className={styles.statPillLabel}>Ukupno naloga</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statPillNum} style={{ color: 'var(--blue)' }}>{students.length}</span>
                <span className={styles.statPillLabel}>Studenata</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statPillNum} style={{ color: 'var(--accent)' }}>{admins.length}</span>
                <span className={styles.statPillLabel}>Admina</span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrap}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className={styles.cardTitle}>Svi nalozi</h2>
                  <p className={styles.cardSub}>{users.length} registrovanih korisnika</p>
                </div>
              </div>

              {loading ? (
                <div className={styles.listLoading}>
                  {[1,2,3].map(i => <div key={i} className={styles.skeletonUser} />)}
                </div>
              ) : (
                <div className={styles.userList}>
                  {users.map(user => {
                    const isSelf = String(user.id) === String((session?.user as any)?.id);
                    const initials = user.name
                      ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                      : user.email[0].toUpperCase();

                    return (
                      <div key={user.id} className={`${styles.userRow} ${isSelf ? styles.userRowSelf : ''}`}>
                        <div className={`${styles.userAvatar} ${user.role === 'admin' ? styles.userAvatarAdmin : ''}`}>
                          {initials}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userInfoTop}>
                            <span className={styles.userName2}>{user.name}</span>
                            <span className={`${styles.rolePill} ${user.role === 'admin' ? styles.rolePillAdmin : styles.rolePillStudent}`}>
                              {user.role === 'admin' ? 'Admin' : 'Student'}
                            </span>
                            {isSelf && <span className={styles.selfPill}>Vi</span>}
                          </div>
                          <span className={styles.userEmail}>{user.email}</span>
                          <span className={styles.userDate}>
                            Kreiran: {new Date(user.createdAt).toLocaleDateString('sr-RS', {
                              day: '2-digit', month: '2-digit', year: 'numeric'
                            })}
                          </span>
                        </div>
                        {!isSelf && (
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(user.id, user.email)}
                            disabled={deletingId === user.id}
                            title="Obriši nalog"
                          >
                            {deletingId === user.id ? (
                              <span className={styles.miniSpinner} />
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M3 4h10M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5 4l.5 9h5L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
