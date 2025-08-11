'use client';

import styles from '@/components/Header/styles.module.css';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className={styles.header}>
      <section className={styles.content}>
        <nav className={styles.nav}>
          <Link href="/">
            <h1 className={styles.logo}>
              Tarefas<span>+</span>
            </h1>

          {/* Se tiver sessão, ou, usuario logado, mostrar link para dashboard */}
          </Link>
          {session?.user && (
            <Link href="/dashboard" className={styles.link}>
              Meu Painel
            </Link>
          )}
        </nav>

        {/* Se o status for loading, mostra mensagem, se tiver usuario logado, mostrar no botão de logar
        o nome do usuário */}
        {status === 'loading' ? (
          <p>Carregando...</p>
        ) : session ? (
          <>
            <button 
            className={styles.loginButton} onClick={() => signOut()}>
              Olá {session.user?.name}
            </button>
          </>
        ) : (
          <button
            className={styles.loginButton}
            onClick={() => signIn('google', { callbackUrl: pathname })}
          >
            Entrar
          </button>
        )}
      </section>
    </header>
  );
}
