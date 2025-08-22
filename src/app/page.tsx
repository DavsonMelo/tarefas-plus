// Importa componentes e módulos necessários para montar a página
import Head from 'next/head'; // Para alterar informações da <head> da página (título, meta tags, etc.)
import styles from '@/styles/home.module.css'; // Estilos CSS exclusivos dessa página
import Image from 'next/image'; // Componente otimizado para imagens no Next.js
import heroImg from '../../public/assets/hero.png'; // Imagem que será exibida no topo da página

// Importa a conexão com o banco de dados Firebase
import { db } from '@/services/firebaseConnection';
import { collection, getCountFromServer } from 'firebase/firestore'; // Funções para acessar coleções e contar documentos

// Define que a página será revalidada a cada 1 hora no modo estático (ISR - Incremental Static Regeneration)
export const revalidate = 3600;

// Função principal que renderiza a página Home
export default async function Home() {

  // Busca a quantidade total de tarefas no banco de dados
  const tasksSnapshot = await getCountFromServer(collection(db, 'tarefas'));
  const tasksCount = tasksSnapshot.data().count;

  // Busca a quantidade total de comentários no banco de dados
  const commentsSnapshot = await getCountFromServer(
    collection(db, 'comments')
  );
  const commentsCount = commentsSnapshot.data().count;

  // Retorna o conteúdo HTML/JSX da página
  return (
    <div className={styles.container}>
      {/* Define o título que aparece na aba do navegador */}
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>

      {/* Conteúdo principal da página */}
      <main className={styles.main}>
        
        {/* Área do logotipo/ilustração principal */}
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tarefas+"
            src={heroImg}
            priority // Faz com que essa imagem carregue primeiro
          />
        </div>

        {/* Título de destaque da página */}
        <h1 className={styles.title}>
          Sistema feito para você organizar <br />
          seus estudos e tarefas
        </h1>

        {/* Bloco que mostra a contagem de posts e comentários */}
        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+ {tasksCount} posts</span>
          </section>
          <section className={styles.box}>
            <span>+ {commentsCount} comentários</span>
          </section>
        </div>
      </main>
    </div>
  );
}
