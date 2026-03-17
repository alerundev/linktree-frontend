import React, { useEffect, useState } from 'react';
import { fetchAdminStats, fetchVisitors, fetchClicks } from '../api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import styles from './AdminPage.module.css';

/* ── 로그인 화면 ── */
function LoginScreen({ onLogin }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const BASE = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${BASE}/api/admin/stats`, {
        headers: { 'x-admin-token': token },
      });
      if (res.ok) {
        sessionStorage.setItem('admin_token', token);
        onLogin(token);
      } else {
        setError('토큰이 올바르지 않아요.');
      }
    } catch {
      setError('서버에 연결할 수 없어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>📊</div>
        <h1 className={styles.loginTitle}>Admin</h1>
        <p className={styles.loginSub}>어드민 토큰을 입력하세요</p>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Admin Token"
            className={styles.loginInput}
            autoFocus
          />
          {error && <p className={styles.loginError}>{error}</p>}
          <button type="submit" className={styles.loginBtn} disabled={loading || !token}>
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── 공통 컴포넌트 ── */
function StatCard({ label, value, sub, accent }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue} style={accent ? { color: accent } : {}}>
        {value !== null && value !== undefined ? value.toLocaleString() : '—'}
      </p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button className={`${styles.tab} ${active ? styles.tabActive : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

/* ── 메인 대시보드 ── */
function Dashboard({ adminToken, onLogout }) {
  const [stats, setStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAdminStats(adminToken), fetchVisitors(adminToken, 50), fetchClicks(adminToken, 50)])
      .then(([s, v, c]) => { setStats(s); setVisitors(v); setClicks(c); })
      .catch(() => setError('데이터를 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  }, [adminToken]);

  if (loading) return <div className={styles.center}>로딩 중...</div>;
  if (error) return <div className={styles.center} style={{ color: '#ff3b30' }}>{error}</div>;

  const ctr = stats.totalViews > 0
    ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1) + '%'
    : '0.0%';

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>📊 Analytics</h1>
          <div className={styles.headerRight}>
            <a href="/" className={styles.backBtn}>← 링크 페이지</a>
            <button className={styles.logoutBtn} onClick={onLogout}>로그아웃</button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <StatCard label="총 방문수" value={stats.totalViews} sub="페이지 뷰" />
          <StatCard label="총 클릭수" value={stats.totalClicks} sub="링크 클릭" />
          <StatCard label="CTR" value={null} sub={ctr} />
          <StatCard label="인기 링크" value={null} sub={stats.topLinks[0]?.link_title || '—'} />
        </div>

        <div className={styles.tabs}>
          <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>개요</TabButton>
          <TabButton active={tab === 'links'} onClick={() => setTab('links')}>링크</TabButton>
          <TabButton active={tab === 'geo'} onClick={() => setTab('geo')}>지역</TabButton>
          <TabButton active={tab === 'visitors'} onClick={() => setTab('visitors')}>방문자</TabButton>
          <TabButton active={tab === 'clicks'} onClick={() => setTab('clicks')}>클릭 로그</TabButton>
        </div>

        {/* 개요 */}
        {tab === 'overview' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>일별 방문수 (30일)</h2>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip labelFormatter={d => `날짜: ${d}`} />
                  <Line type="monotone" dataKey="count" stroke="#007aff" strokeWidth={2} dot={false} name="방문수" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>일별 클릭수 (30일)</h2>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.dailyClicks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip labelFormatter={d => `날짜: ${d}`} />
                  <Line type="monotone" dataKey="count" stroke="#34c759" strokeWidth={2} dot={false} name="클릭수" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 링크 */}
        {tab === 'links' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>링크별 클릭 순위</h2>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={Math.max(200, stats.topLinks.length * 45)}>
                <BarChart data={stats.topLinks} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="link_title" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#007aff" radius={[0, 4, 4, 0]} name="클릭수" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 지역 */}
        {tab === 'geo' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>국가별 방문수</h2>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={Math.max(200, (stats.topCountries?.length || 1) * 45)}>
                <BarChart data={stats.topCountries || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="country" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#5856d6" radius={[0, 4, 4, 0]} name="방문수" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>도시별 방문수</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>도시</th>
                    <th>국가</th>
                    <th>방문수</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.topCities || []).map((c, i) => (
                    <tr key={i}>
                      <td style={{ color: '#aeaeb2' }}>{i + 1}</td>
                      <td>{c.city || '—'}</td>
                      <td>{c.country || '—'}</td>
                      <td><strong>{c.count}</strong></td>
                    </tr>
                  ))}
                  {(!stats.topCities || stats.topCities.length === 0) && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#aeaeb2' }}>데이터 없음</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 방문자 */}
        {tab === 'visitors' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>최근 방문자 (50건)</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>시간</th>
                    <th>국가</th>
                    <th>도시</th>
                    <th>IP</th>
                    <th>Referer</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map(v => (
                    <tr key={v.id}>
                      <td>{new Date(v.visited_at).toLocaleString('ko-KR')}</td>
                      <td>{v.country_code ? `${v.country_code} ${v.country}` : '—'}</td>
                      <td>{v.city || '—'}</td>
                      <td>{v.ip}</td>
                      <td className={styles.truncate}>{v.referer || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 클릭 로그 */}
        {tab === 'clicks' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>최근 클릭 로그 (50건)</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>시간</th>
                    <th>링크</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {clicks.map(c => (
                    <tr key={c.id}>
                      <td>{new Date(c.clicked_at).toLocaleString('ko-KR')}</td>
                      <td>{c.link_title || c.link_id}</td>
                      <td>{c.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 메인 export ── */
export default function AdminPage() {
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('admin_token') || '');

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setAdminToken('');
  };

  if (!adminToken) {
    return <LoginScreen onLogin={setAdminToken} />;
  }

  return <Dashboard adminToken={adminToken} onLogout={handleLogout} />;
}
