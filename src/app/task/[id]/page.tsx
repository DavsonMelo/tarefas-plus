'use client';

import { useSession } from 'next-auth/react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import styles from './styles.module.css';
import { db } from '@/services/firebaseConnection';
import { doc, getDoc, addDoc, collection, onSnapshot, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { Textarea } from '@/components/Textarea';
import { useRouter } from 'next/navigation';
import { FaTrash } from 'react-icons/fa';

/* Interface para definir a estrutura de um comentário */
interface CommentProps {
  id: string;
  comment: string;
  user: string;
  taskId: string;
  name: string;
}


// Componente principal da página de detalhes da tarefa
export default function Task({ params }: { params: { id: string } }) {
  // Hooks para gerenciar a sessão do usuário, roteamento e estados do componente
  const { data: session } = useSession();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [input, setInput] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  // Efeito para carregar os detalhes da tarefa quando o componente é montado ou o ID da tarefa muda
  useEffect(() => {
    async function loadTask() {
      const docRef = doc(db, 'tarefas', params.id);
      const docSnap = await getDoc(docRef);
      // Se a tarefa não existir ou não for pública, redireciona para a página inicial
      if (!docSnap.exists() || !docSnap.data()?.public) {
        router.push('/');
        return;
      }

      // Formata os dados da tarefa e atualiza o estado
      const ms = docSnap.data()?.created?.seconds * 1000;
      setTask({
        tarefa: docSnap.data()?.tarefa,
        created: new Date(ms).toLocaleDateString('pt-BR'),
        public: docSnap.data()?.public,
        user: docSnap.data()?.user,
        taskId: params.id,
      });
    }
    loadTask();
  }, [params.id, router]);

  // Efeito para buscar e ouvir em tempo real os comentários da tarefa
  useEffect(() => {
    // Só executa se o ID da tarefa estiver disponível
    if(!task?.taskId) return;

    const commentsRef = collection(db, 'comments');
    // Cria uma query para buscar comentários da tarefa atual, ordenados por data de criação
    const q = query(
      commentsRef, 
      where('taskId', '==', task?.taskId),
      orderBy('created', 'desc')
    );
    // Escuta as atualizações em tempo real na coleção de comentários
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let list: CommentProps[] = [];
      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          comment: doc.data().Comment,
          user: doc.data().user,
          taskId: doc.data().taskId,
          name: doc.data().name
        });
      });

      console.log(list);
      setComments(list);
    
    })
    // Função de limpeza para remover o listener quando o componente é desmontado
    return () => unsubscribe();
  }, [task?.taskId])

  // Função para lidar com o envio de um novo comentário
  async function handleComment(event: FormEvent)   {
    event.preventDefault();
    // Impede o envio de comentários vazios
    if (input === "") return;
    // Verifica se o usuário está logado
    if(!session?.user?.name || !session?.user?.email) return;

    try {
      // Adiciona o novo comentário à coleção 'comments' no Firestore
      const docRef = await addDoc(collection(db, 'comments'), {
        Comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: task?.taskId,
      })

      // Limpa o campo de input e loga o sucesso
      setInput('');
      console.log('Comentário adicionado com sucesso:', docRef.id);
    }catch(error){
      console.log(error);
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      const docRef = doc(db, 'comments', commentId);
      await deleteDoc(docRef);
    }catch(error){
      console.log(error);
    }
  }

  // Renderiza uma mensagem de carregamento enquanto a tarefa não é carregada
  if (!task) return <p>Carregando...</p>;

  // Renderização principal do componente
  return (
    <div className={styles.container}>
      {/* Define o título da página */}
      <Head>
        <title>Tarefa - Detalhes</title>
      </Head>
      {/* Seção principal para exibir os detalhes da tarefa */}
      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{task.tarefa}</p>
        </article>
      </main>
      {/* Seção para adicionar um novo comentário */}
      <section className={styles.commentsContainer}>
        <h2>Deixar comentário</h2>
        <form onSubmit={handleComment}>
          <Textarea
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            placeholder="digite seu comentário..."
          />
          <button disabled={!session?.user} className={styles.button}>
            Enviar comentário
          </button>
        </form>
      </section>
      {/* Seção para exibir todos os comentários existentes */}
      <section className={styles.commentsContainer}>
        <h2>Todos os comentários</h2>
        {/* Mensagem exibida se não houver comentários */}
        {comments.length === 0 && (
          <span>Nenhum comentário encontrado.</span>
        )}
        {/* Mapeia e renderiza cada comentário */}
        {comments.map((comment) => (
          <article key={comment.id} className={styles.comment}>
            <div className={styles.headComment}>
              <label className={styles.commentsLabel}>{comment.name}</label>
              {comment.user === session?.user?.email && (
                <button className={styles.buttonTrash}
                onClick={() => handleDeleteComment(comment.id)}>
                <FaTrash size={18} color='#ea3140' />
              </button>
              )}
            </div>
            <p>{comment.comment}</p>

          </article>
        ))}
      </section>
    </div>
  );
}
