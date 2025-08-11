import Head from 'next/head';
import styles from '@/styles/home.module.css';
import Image from 'next/image';
import heroImg from '../../public/assets/hero.png';

import { db } from '@/services/firebaseConnection';
import { collection, getCountFromServer } from 'firebase/firestore';

export const revalidate = 3600;

// Esta função carrega a pagina principal, ou home. A principio nao possui funcionalidade alguma exceto
// no header
export default async function Home() {

  const tasksSnapshot = await getCountFromServer(collection(db, 'tarefas'));
  const tasksCount = tasksSnapshot.data().count;

  const commentsSnapshot = await getCountFromServer(
    collection(db, 'comments')
  );
  const commentsCount = commentsSnapshot.data().count;

  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tarefas+"
            src={heroImg}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar <br />
          seus estudos e tarefas
        </h1>

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
