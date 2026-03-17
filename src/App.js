import React, { useEffect } from 'react';
import { trackPageView, trackClick } from './api';
import LINKS from './links';
import styles from './App.module.css';

function App() {
  useEffect(() => {
    trackPageView();
  }, []);

  const handleClick = (link) => {
    trackClick(link.id, link.title);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Profile */}
        <div className={styles.profile}>
          <div className={styles.avatar}>👤</div>
          <h1 className={styles.name}>Your Name</h1>
          <p className={styles.bio}>개발자 · 크리에이터 · 서울</p>
        </div>

        {/* Links */}
        <div className={styles.links}>
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkItem}
              onClick={() => handleClick(link)}
            >
              <span className={styles.linkEmoji}>{link.emoji}</span>
              <div className={styles.linkText}>
                <span className={styles.linkTitle}>{link.title}</span>
                <span className={styles.linkSubtitle}>{link.subtitle}</span>
              </div>
              <span className={styles.linkArrow}>›</span>
            </a>
          ))}
        </div>

        <p className={styles.footer}>© 2024 Your Name</p>
      </div>
    </div>
  );
}

export default App;
