// Ativa o modo 'use client' para que esse componente rode no lado do cliente (navegador)
'use client';

import styles from '@/components/Header/styles.module.css'; // Importa os estilos específicos para o Header
import { useSession, signIn, signOut } from 'next-auth/react'; // Importa funções de autenticação e gerenciamento de sessão do NextAuth
import { usePathname } from 'next/navigation'; // Importa função para pegar o caminho atual da URL
import Link from 'next/link'; // Importa componente de link interno do Next.js

export function Header() {// Componente que renderiza o cabeçalho (Header) do site

  // Pega o caminho atual da página
  const pathname = usePathname();

  // Pega dados da sessão (usuário logado) e status do carregamento
  const { data: session, status } = useSession();

  // Retorna a estrutura visual do cabeçalho
  return (
    <header className={styles.header}>
      <section className={styles.content}>
        {/* Menu de navegação */}
        <nav className={styles.nav}>
          {/* Logo que leva para a página inicial */}
          <Link href="/">
            <h1 className={styles.logo}>
              Tarefas<span>+</span>
            </h1>
          </Link>

          {/* Se o usuário estiver logado, mostra o link para o painel (dashboard) */}
          {session?.user && (
            <Link href="/dashboard" className={styles.link}>
              Meu Painel
            </Link>
          )}
        </nav>

        {/* Se ainda estiver carregando a sessão, mostra "Carregando..." */}
        {/* Se estiver logado, mostra botão para deslogar com o nome do usuário */}
        {/* Se não estiver logado, mostra botão para entrar com Google */}
        {status === 'loading' ? (
          <p>Carregando...</p>
        ) : session ? (
          <>
            <button 
              className={styles.loginButton} 
              onClick={() => signOut()} // Função para sair da conta
            >
              Olá {session.user?.name}
            </button>
          </>
        ) : (
          <button
            className={styles.loginButton}
            onClick={() => signIn('google', { callbackUrl: pathname })} // Login pelo Google
          >
            Entrar
          </button>
        )}
      </section>
    </header>
  );
}
