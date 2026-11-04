import React from 'react';
import { Link } from 'react-router-dom';
import '../css/home.css';

export default function Home() {
  return (
    <main
      className="container"
      style={{
        padding: '60px 0',
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="card welcome-card-highlight"
        style={{
          maxWidth: '620px',
          width: '100%',
          textAlign: 'center',
          padding: '48px 36px'
        }}
      >
        <div
          className="welcome-logo-badge"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            marginBottom: '24px'
          }}
        >
          GIT
        </div>

        <p
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: 'var(--secondary)',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}
        >
          GREENFIELD INSTITUTE OF TECHNOLOGY
        </p>

        <h1
          style={{
            fontSize: '2.1rem',
            color: 'var(--primary-dark)',
            fontWeight: 800,
            marginBottom: '12px',
            lineHeight: 1.25
          }}
        >
          Campus Event Registration Portal
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--primary)',
            marginBottom: '16px'
          }}
        >
          &ldquo;Discover. Register. Participate.&rdquo;
        </p>

        <p
          style={{
            color: 'var(--muted)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            marginBottom: '32px',
            maxWidth: '480px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          Explore exciting campus activities, register for academic and cultural workshops, and engage with vibrant student life at Greenfield Institute of Technology.
        </p>

        <div>
          <Link
            to="/role-selection"
            className="btn btn-primary btn-lg"
            style={{ minWidth: '220px' }}
          >
            CONTINUE
          </Link>
        </div>
      </div>
    </main>
  );
}
