// src/app/dashboard/DashboardClient.tsx

// Ativa modo 'use client' para que o componente rode no navegador
'use client';

// Importa os estilos específicos dessa página do dashboard
import styles from '@/app/dashboard/styles.module.css';

// Importa hooks e tipos do React
import { ChangeEvent, useState, FormEvent, useEffect } from 'react';

// Importa componente de textarea personalizado
import { Textarea } from '@/components/Textarea';

// Importa ícones para botões
import { FaShare, FaTrash } from 'react-icons/fa';

// Importa hook de autenticação para pegar dados do usuário logado
import { useSession } from 'next-auth/react';

// Importa componente de link interno do Next.js
import Link from 'next/link';

// Importa conexão com Firebase
import { db } from '@/services/firebaseConnection';

// Importa funções do Firestore para manipular dados
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

// Define o formato esperado para uma tarefa
interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}

// Componente principal do dashboard
export default function DashboardClient() {
  // Pega dados da sessão do usuário logado
  const { data: session } = useSession();

  // Estados para controlar o formulário e as tarefas
  const [input, setInput] = useState('');
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  // Carrega as tarefas do usuário assim que a página abre ou a sessão muda
  useEffect(() => {
    async function loadTarefas() {
      if (!session?.user?.email) return;

      // Referência à coleção de tarefas no Firestore
      const tarefaRef = collection(db, 'tarefas');

      // Cria uma query para buscar as tarefas do usuário logado, ordenadas pela data de criação
      const q = query(
        tarefaRef,
        orderBy('created', 'desc'),
        where('user', '==', session?.user?.email)
      );

      // Escuta em tempo real mudanças na lista de tarefas
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
        setTasks(lista);
      });
    }
    loadTarefas();
  }, [session?.user?.email]);

  // Função para alterar se a tarefa será pública ou não
  function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
    setPublicTask(e.target.checked);
  }

  // Função para registrar nova tarefa no banco
  async function handleRegisterTask(e: FormEvent) {
    e.preventDefault();

    if (input === '') return; // Não permite salvar tarefa vazia
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

      // Limpa o formulário após salvar
      setInput('');
      setPublicTask(false);
      console.log('Tarefa registrada com sucesso!');
    } catch (error) {
      console.log(error);
    }
  }

  // Função para copiar link de tarefa pública para a área de transferência
  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task}/${id}`
    );
    alert('Link copiado com sucesso!');
  }

  // Função para deletar uma tarefa
  async function handleDeleteTask(id: string) {
    const docRef = doc(db, 'tarefas', id);
    await deleteDoc(docRef);
  }

  // Estrutura visual do dashboard
  return (
    <div className={styles.container}>
      <main className={styles.main}>

        {/* Formulário para adicionar nova tarefa */}
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

        {/* Lista das tarefas do usuário */}
        <section className={styles.taskContainer}>
          <h1>Minhas tarefas</h1>
          {tasks.map((item) => (
            <article key={item.id} className={styles.task}>

              {/* Se a tarefa for pública, mostra tag e botão de compartilhar */}
              {item.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>PUBLICO</label>
                  <button
                    className={styles.shareButton}
                    onClick={() => handleShare(item.id)}
                  >
                    <FaShare size={22} color="#3183ff" />
                  </button>
                </div>
              )}

              {/* Conteúdo da tarefa + botão para deletar */}
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
