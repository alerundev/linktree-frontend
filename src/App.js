import React, { useEffect } from 'react';
import { trackPageView, trackClick } from './api';
import LINKS from './links';
import SOCIAL from './social';
import styles from './App.module.css';

function App() {
  useEffect(() => {
    trackPageView();
  }, []);

  const handleClick = (link) => {
    trackClick(link.id, link.title);
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg} />

      <div className={styles.inner}>
        {/* Profile */}
        <div className={styles.profile}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>👤</div>
          </div>
          <h1 className={styles.name}>Your Name</h1>
          <p className={styles.bio}>Traveler. Creator. Dreamer.</p>
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
              <span className={styles.linkTitle}>{link.title}</span>
            </a>
          ))}
        </div>

        {/* Social icons */}
        <div className={styles.socials}>
          {SOCIAL.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              onClick={() => trackClick(s.id, s.label)}
              aria-label={s.label}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
