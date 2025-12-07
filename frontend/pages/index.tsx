import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import styles from '@/pages/Landing.module.scss';

export default function Landing() {
  const router = useRouter();

  return (
    <div className={styles.landing}>
      <div className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Collaborate in <span className={styles.gradient}>Real-Time</span>
            </h1>
            <p className={styles.subtitle}>
              Create, edit, and share documents with your team instantly.
              Experience seamless collaboration powered by cutting-edge technology.
            </p>
            <div className={styles.cta}>
              <Button
                size="lg"
                onClick={() => router.push('/register')}
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
            </div>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>⚡</span>
                <span>Lightning Fast</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🔒</span>
                <span>Secure</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>👥</span>
                <span>Team Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
