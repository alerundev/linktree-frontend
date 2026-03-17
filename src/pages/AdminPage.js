import React, { useEffect, useState } from 'react';
import { fetchAdminStats, fetchVisitors, fetchClicks } from '../api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import styles from './AdminPage.module.css';

function StatCard({ label, value, sub }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value?.toLocaleString() ?? '-'}</p>
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

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAdminStats(), fetchVisitors(50), fetchClicks(50)])
      .then(([s, v, c]) => {
        setStats(s);
        setVisitors(v);
        setClicks(c);
      })
      .catch(() => setError('인증 실패 또는 서버 오류. REACT_APP_ADMIN_TOKEN을 확인하세요.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}>로딩 중...</div>;
  if (error) return <div className={styles.center} style={{ color: '#ff3b30' }}>{error}</div>;

  const ctr = stats.totalViews > 0
    ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1)
    : '0.0';

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>📊 Analytics</h1>
          <a href="/" className={styles.backBtn}>← 링크 페이지</a>
        </div>

        {/* Stat Cards */}
        <div className={styles.statsGrid}>
          <StatCard label="총 방문수" value={stats.totalViews} sub="페이지 뷰" />
          <StatCard label="총 클릭수" value={stats.totalClicks} sub="링크 클릭" />
          <StatCard label="CTR" value={null} sub={`${ctr}%`} />
          <StatCard label="인기 링크" value={null} sub={stats.topLinks[0]?.link_title || '-'} />
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>개요</TabButton>
          <TabButton active={tab === 'links'} onClick={() => setTab('links')}>링크 통계</TabButton>
          <TabButton active={tab === 'visitors'} onClick={() => setTab('visitors')}>방문자</TabButton>
          <TabButton active={tab === 'clicks'} onClick={() => setTab('clicks')}>클릭 로그</TabButton>
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>일별 방문수 (30일)</h2>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
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
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={d => `날짜: ${d}`} />
                  <Line type="monotone" dataKey="count" stroke="#34c759" strokeWidth={2} dot={false} name="클릭수" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Links */}
        {tab === 'links' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>링크별 클릭 순위</h2>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.topLinks} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="link_title" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#007aff" radius={[0, 4, 4, 0]} name="클릭수" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Visitors */}
        {tab === 'visitors' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>최근 방문자 (50건)</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>시간</th>
                    <th>IP</th>
                    <th>Referer</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map(v => (
                    <tr key={v.id}>
                      <td>{new Date(v.visited_at).toLocaleString('ko-KR')}</td>
                      <td>{v.ip}</td>
                      <td className={styles.truncate}>{v.referer || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clicks */}
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
