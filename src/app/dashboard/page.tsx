'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

interface Video {
  id: number;
  course_id: number;
  title: string;
  description: string;
  youtube_url: string;
  duration: string;
  order_index: number;
  course_title: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string;
  subject: string;
  video_count: number;
}

const CAT_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  // Matematika
  trig:  { bg: '#f5f3ff', text: '#7c3aed', icon: '∿' },
  razl:  { bg: '#f0f9ff', text: '#0ea5e9', icon: '½' },
  funk:  { bg: '#f0fdf4', text: '#16a34a', icon: 'ƒ' },
  alg:   { bg: '#fff7ed', text: '#ea580c', icon: 'χ' },
  geo:   { bg: '#f7fee7', text: '#65a30d', icon: '△' },
  stat:  { bg: '#eff6ff', text: '#2563eb', icon: 'σ' },
  niz:   { bg: '#fffbeb', text: '#d97706', icon: '∑' },
  anal:  { bg: '#fdf4ff', text: '#c026d3', icon: '∫' },
  // Srpski jezik
  gram:  { bg: '#fff1f2', text: '#be123c', icon: 'Г' },
  prp:   { bg: '#fce7f3', text: '#9d174d', icon: 'П' },
  knj:   { bg: '#fefce8', text: '#92400e', icon: 'К' },
  // Kombinovani test
  komb:  { bg: '#ecfdf5', text: '#065f46', icon: '⊕' },
  komb2: { bg: '#f0fdf4', text: '#166534', icon: '≡' },
};

const SUBJECTS = [
  { key: 'srpski',      label: 'Srpski jezik',     icon: 'С', bg: '#fff1f2', text: '#be123c' },
  { key: 'matematika',  label: 'Matematika',        icon: '∑', bg: '#eff6ff', text: '#1d4ed8' },
  { key: 'kombinovani', label: 'Kombinovani test',  icon: '⊕', bg: '#ecfdf5', text: '#065f46' },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    Promise.all([
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/videos').then(r => r.json()),
      fetch('/api/progress').then(r => r.json()),
    ]).then(([c, v, p]) => {
      setCourses(c);
      setVideos(v);
      setWatchedIds(new Set(p));
      setLoadingCourses(false);
    });
  }, [status]);

  const toggleWatched = useCallback(async (videoId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isWatched = watchedIds.has(videoId);
    setTogglingId(videoId);
    setWatchedIds(prev => {
      const next = new Set(prev);
      isWatched ? next.delete(videoId) : next.add(videoId);
      return next;
    });
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, watched: !isWatched }),
    });
    setTogglingId(null);
  }, [watchedIds]);

  const getCourseVideos = (courseId: number) => videos.filter(v => v.course_id === courseId);

  const getCourseProgress = (courseId: number) => {
    const cvids = getCourseVideos(courseId);
    if (!cvids.length) return 0;
    return Math.round((cvids.filter(v => watchedIds.has(v.id)).length / cvids.length) * 100);
  };

  const getSubjectStats = (subjectKey: string) => {
    const subjectCourses = courses.filter(c => c.subject === subjectKey);
    const allVids = subjectCourses.flatMap(c => getCourseVideos(c.id));
    const watched = allVids.filter(v => watchedIds.has(v.id)).length;
    const total = allVids.length;
    return {
      courseCount: subjectCourses.length,
      total,
      watched,
      progress: total > 0 ? Math.round((watched / total) * 100) : 0,
    };
  };

  const totalWatched = watchedIds.size;
  const totalVideos = videos.length;

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.description.toLowerCase().includes(search.toLowerCase())
  );

  if (status === 'loading') return <div className={styles.loading}><span className={styles.spinner} /></div>;

  // Video player view
  if (selectedVideo) {
    const course = courses.find(c => c.id === selectedVideo.course_id);
    const subjectMeta = SUBJECTS.find(s => s.key === course?.subject);
    const subjectCourses = courses.filter(c => c.subject === course?.subject);
    const subjectVideos = subjectCourses.flatMap(c => getCourseVideos(c.id));
    const subjectWatched = subjectVideos.filter(v => watchedIds.has(v.id)).length;
    const subjectProgress = subjectVideos.length > 0
      ? Math.round((subjectWatched / subjectVideos.length) * 100)
      : 0;
    const isWatched = watchedIds.has(selectedVideo.id);
    const colors = subjectMeta
      ? { bg: subjectMeta.bg, text: subjectMeta.text, icon: subjectMeta.icon }
      : CAT_COLORS[course?.thumbnail || ''] || CAT_COLORS['alg'];

    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <nav className={styles.nav}>
            <NavBrand />
            <NavRight session={session} />
          </nav>
          <div className={`${styles.content} ${styles.contentPlayerView}`}>
            <div className={styles.playerLayout}>
              {/* Left: video */}
              <div className={styles.playerLeft}>
                <button className={styles.backBtn} onClick={() => setSelectedVideo(null)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Nazad
                </button>

                <div className={styles.playerWrap}>
                  <iframe
                    className={styles.player}
                    src={selectedVideo.youtube_url || ''}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className={styles.videoMeta}>
                  <div className={styles.videoMetaTop}>
                    <div>
                      <p className={styles.videoCourseLabel}>{selectedVideo.course_title}</p>
                      <h2 className={styles.videoHeading}>{selectedVideo.title}</h2>
                      <p className={styles.videoDesc}>{selectedVideo.description}</p>
                    </div>
                    <button
                      className={`${styles.watchedBtn} ${isWatched ? styles.watchedBtnDone : ''}`}
                      onClick={(e) => toggleWatched(selectedVideo.id, e)}
                      disabled={togglingId === selectedVideo.id}
                    >
                      <span className={styles.watchedBtnCheck}>
                        {isWatched ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" fill="var(--green)" opacity="0.2" stroke="var(--green)" strokeWidth="1.5"/>
                            <path d="M5 8l2.5 2.5L11 5.5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        )}
                      </span>
                      {isWatched ? 'Odgledano ✓' : 'Označi kao odgledano'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: playlist */}
              <div className={styles.playerSidebar}>
                <div className={styles.playlistHeader} style={{ background: colors.bg }}>
                  <span className={styles.playlistIcon} style={{ color: colors.text }}>{colors.icon}</span>
                  <div>
                    <p className={styles.playlistTitle}>{subjectMeta?.label ?? course?.title}</p>
                    <p className={styles.playlistMeta}>
                      {subjectWatched}/{subjectVideos.length} odgledano
                    </p>
                  </div>
                </div>
                <div className={styles.playlistProgress}>
                  <div className={styles.playlistProgressBar}>
                    <div
                      className={styles.playlistProgressFill}
                      style={{ width: `${subjectProgress}%` }}
                    />
                  </div>
                  <span>{subjectProgress}%</span>
                </div>
                <div className={styles.playlist}>
                  {subjectVideos.map((v, idx) => {
                    const active = v.id === selectedVideo.id;
                    const done = watchedIds.has(v.id);
                    return (
                      <button
                        key={v.id}
                        className={`${styles.playlistItem} ${active ? styles.playlistItemActive : ''} ${done ? styles.playlistItemDone : ''}`}
                        onClick={() => setSelectedVideo(v)}
                      >
                        <span className={styles.plNum}>
                          {done ? (
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="6" fill="var(--green)" opacity="0.2" stroke="var(--green)" strokeWidth="1.3"/>
                              <path d="M4.5 7l2 2 3-3" stroke="var(--green)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <span className={active ? styles.plNumActive : ''}>{idx + 1}</span>
                          )}
                        </span>
                        <div className={styles.plInfo}>
                          <span className={styles.plTitle}>{v.title}</span>
                          <span className={styles.plDur}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                            {v.duration}
                          </span>
                        </div>
                        {active && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M3 2.5l6 3.5-6 3.5V2.5z" fill="var(--accent)"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav className={styles.nav}>
          <NavBrand />
          <NavRight session={session} />
        </nav>

        <div className={styles.content}>
          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Zdravo, <em>{session?.user?.name?.split(' ')[0]}</em>
              </h1>
              <p className={styles.heroSub}>Nastavi učenje — svaki zadatak te približava cilju.</p>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <span className={styles.statNum}>{totalVideos}</span>
                <span className={styles.statLabel}>Lekcija</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum} style={{ color: 'var(--green)' }}>{totalWatched}</span>
                <span className={styles.statLabel}>Odgledano</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum} style={{ color: 'var(--accent)' }}>
                  {totalVideos > 0 ? Math.round((totalWatched / totalVideos) * 100) : 0}%
                </span>
                <span className={styles.statLabel}>Napredak</span>
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className={styles.overallProgress}>
            <p className={styles.overallProgressLabel}>Ukupno pregledano</p>
            <div className={styles.overallProgressBar}>
              <div
                className={styles.overallProgressFill}
                style={{ width: `${totalVideos > 0 ? Math.round((totalWatched / totalVideos) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <h2 className={styles.sectionLabel}>Oblasti</h2>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                className={styles.search}
                placeholder="Pretraži kurseve..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          {loadingCourses ? (
            <div className={styles.skeletonList}>
              {[1,2,3].map(i => <div key={i} className={styles.skeletonRow} style={{ height: '80px' }} />)}
            </div>
          ) : search ? (
            // ── Flat search results ──
            <div>
              {filteredVideos.length === 0 ? (
                <p className={styles.emptyMsg}>Nema rezultata za &ldquo;{search}&rdquo;</p>
              ) : (
                <FlatVideoList
                  videos={filteredVideos}
                  watchedIds={watchedIds}
                  togglingId={togglingId}
                  onSelectVideo={setSelectedVideo}
                  onToggleWatched={toggleWatched}
                />
              )}
            </div>
          ) : (
            // ── Subject grouped view ──
            <div className={styles.subjectList}>
              {SUBJECTS.map(subject => {
                const stats = getSubjectStats(subject.key);
                const isOpen = expandedSubject === subject.key;
                const subjectCourses = courses.filter(c => c.subject === subject.key);

                return (
                  <div
                    key={subject.key}
                    className={`${styles.subjectSection} ${isOpen ? styles.subjectSectionOpen : ''}`}
                  >
                    <button
                      className={styles.subjectHeader}
                      onClick={() => setExpandedSubject(isOpen ? null : subject.key)}
                    >
                      <div className={styles.subjectIconWrap} style={{ background: subject.bg }}>
                        <span className={styles.subjectIcon} style={{ color: subject.text }}>{subject.icon}</span>
                      </div>

                      <div className={styles.subjectInfo}>
                        <div className={styles.subjectInfoTop}>
                          <h2 className={styles.subjectTitle}>{subject.label}</h2>
                          <span className={styles.subjectCountPill}>
                            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                              <rect x="1" y="2" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M5.5 5l4 2-4 2V5z" fill="currentColor"/>
                            </svg>
                            {stats.total} lekcija
                          </span>
                        </div>
                        <div className={styles.progressRow}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${stats.progress}%`, background: subject.text }}
                            />
                          </div>
                          <span
                            className={styles.progressPct}
                            style={{ color: stats.progress === 100 ? 'var(--green)' : 'var(--text-muted)' }}
                          >
                            {stats.progress}%
                          </span>
                        </div>
                      </div>

                      <div className={styles.chevron} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>

                    {isOpen && (
                      <div className={styles.subjectContent}>
                        {(() => {
                          const subjectVideos = subjectCourses.flatMap(c => getCourseVideos(c.id));
                          return subjectVideos.length === 0 ? (
                            <p className={styles.emptyMsg}>Nema lekcija u ovoj oblasti.</p>
                          ) : (
                            <FlatVideoList
                              videos={subjectVideos}
                              watchedIds={watchedIds}
                              togglingId={togglingId}
                              onSelectVideo={setSelectedVideo}
                              onToggleWatched={toggleWatched}
                            />
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>2026 &copy; Nauči Matematiku</p>
        <p className={styles.footerSubText}>Powered by L.Z. Design</p>
      </footer>
    </div>
  );
}

// ─── Flat Video List Component ───────────────────────────────────────────────

interface FlatVideoListProps {
  videos: Video[];
  watchedIds: Set<number>;
  togglingId: number | null;
  onSelectVideo: (v: Video) => void;
  onToggleWatched: (id: number, e: React.MouseEvent) => void;
}

function FlatVideoList({ videos, watchedIds, togglingId, onSelectVideo, onToggleWatched }: FlatVideoListProps) {
  return (
    <div className={styles.videoRows}>
      {videos.map((v, idx) => {
        const done = watchedIds.has(v.id);
        return (
          <div key={v.id} className={`${styles.videoRow} ${done ? styles.videoRowDone : ''}`}>
            <button className={styles.videoRowPlay} onClick={() => onSelectVideo(v)}>
              <div className={styles.videoRowNum}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="var(--green)" opacity="0.15" stroke="var(--green)" strokeWidth="1.3"/>
                    <path d="M4.5 7l2 2 3-3" stroke="var(--green)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <div className={styles.videoRowInfo}>
                <span className={styles.lessonTag}>Lekcija {idx + 1}</span>
                <span className={styles.videoRowTitle}>{v.title}</span>
                <span className={styles.videoRowDesc}>{v.description}</span>
              </div>
              <div className={styles.videoRowRight}>
                <span className={styles.videoRowDur}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {v.duration}
                </span>
                <span className={styles.videoRowPlayIcon}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 2.5l8 4.5-8 4.5V2.5z" fill="currentColor"/>
                  </svg>
                </span>
              </div>
            </button>

            <button
              className={`${styles.checkBtn} ${done ? styles.checkBtnDone : ''}`}
              onClick={(e) => onToggleWatched(v.id, e)}
              disabled={togglingId === v.id}
              title={done ? 'Označi kao neodgledano' : 'Označi kao odgledano'}
            >
              {togglingId === v.id ? (
                <span className={styles.miniSpinner} />
              ) : done ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Odgledano
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  Nije odgledano
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Nav Components ─────────────────────────────────────────────────────────

function NavBrand() {
  return (
    <div className={styles.navBrand}>
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
    </div>
  );
}

function NavRight({ session }: { session: any }) {
  const router = useRouter();
  const isAdmin = (session?.user as any)?.role === 'admin';
  return (
    <div className={styles.navRight}>
      {isAdmin && (
        <button className={styles.adminNavBtn} onClick={() => router.push('/admin')}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M2 14c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M12 2v3M10.5 3.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span>Nalozi</span>
        </button>
      )}
      <div className={styles.userBadge}>
        <div className={styles.avatar}>
          {session?.user?.name?.[0] || 'U'}
        </div>
        <span className={styles.userName}>{session?.user?.name}</span>
      </div>
      <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className={styles.logoutBtnText}>Odjavi se</span>
      </button>
    </div>
  );
}
