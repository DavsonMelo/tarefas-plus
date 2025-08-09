// src/app/dashboard/DashboardClient.tsx
'use client';

import styles from '@/app/dashboard/styles.module.css';
import { ChangeEvent, useState, FormEvent, useEffect } from 'react';
import { Textarea } from '@/components/Textarea';
import { FaShare, FaTrash } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { db } from '@/services/firebaseConnection';
import {
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';

interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}

export default function DashboardClient() {
  const { data: session } = useSession();

  const [input, setInput] = useState('');
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  useEffect(() => {
    async function loadTarefas() {
      if (!session?.user?.email) return;

      const tarefaRef = collection(db, 'tarefas');

      const q = query(
        tarefaRef,
        orderBy('created', 'desc'),
        where('user', '==', session?.user?.email)
      );
      onSnapshot(q, (snapshot) => {
        let lista = [] as TaskProps[];
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            tarefa: doc.data().tarefa,
            created: doc.data().created.toDate(),
            public: doc.data().public,
            user: doc.data().user,
          });
        });
        // console.log(lista);
        setTasks(lista);
      });
    }
    loadTarefas();
  }, [session?.user?.email]);

  function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
    // console.log(e.target.checked);
    setPublicTask(e.target.checked);
  }

  async function handleRegisterTask(e: FormEvent) {
    e.preventDefault();

    if (input === '') return;

    if (!session || !session.user) {
      console.log('Usuário não está logado!');
      return;
    }

    try {
      await addDoc(collection(db, 'tarefas'), {
        tarefa: input,
        created: new Date(),
        user: session?.user?.email,
        public: publicTask,
      });

      setInput('');
      setPublicTask(false);
      console.log('Tarefa registrada com sucesso!');
    } catch (error) {
      console.log(error);
    }
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task}/${id}`
    );
    alert('Link copiado com sucesso!');
  }

  async function handleDeleteTask(id: string) {
    const docRef = doc(db, 'tarefas', id);
    await deleteDoc(docRef);
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>
            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder="Digite sua tarefa..."
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(e.target.value)
                }
              />
              <div className={styles.checkboxArea}>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa pública?</label>
              </div>
              <button type="submit" className={styles.button}>
                Registrar
              </button>
            </form>
          </div>
        </section>
        <section className={styles.taskContainer}>
          <h1>Minhas tarefas</h1>
          {tasks.map((item) => (
            <article key={item.id} className={styles.task}>
              {item.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>PUBLICO</label>
                  <button
                    className={styles.shareButton}
                    onClick={() => 
                      handleShare(item.id)}
                  >
                    <FaShare size={22} color="#3183ff" />
                  </button>
                </div>
              )}
              <div className={styles.taskContent}>
                {item.public ? (
                  <Link href={`/task/${item.id}`}>
                    <p>{item.tarefa}</p>
                  </Link>
                ) : (
                  <p>{item.tarefa}</p>
                )}
                <button
                  className={styles.trashButton}
                  onClick={() => handleDeleteTask(item.id)}
                >
                  <FaTrash size={24} color="#ea3140" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
