import Head from "next/head";
import styles from "./styles.module.css"

import { db } from "@/services/firebaseConnection";
import { doc, getDoc } from "firebase/firestore";
import { redirect } from "next/navigation";

interface TaskPageProps {
  params: {
    id: string;
  };
}

interface TaskData {
  tarefa: string;
  created: string;
  public: boolean;
  user: string;
  taskId: string;
}

export default async function Task({ params }: TaskPageProps) {
  
  const id = params.id;

  const docRef = doc(db, 'tarefas', id);
  const docSnap = await getDoc(docRef);

  if(docSnap.data() === undefined) {
    redirect('/');
  }
  if(!docSnap.data()?.public) {
    redirect('/');
  }
  const miliseconds = docSnap.data()?.created?.seconds * 1000;
  const task: TaskData = {
    tarefa: docSnap.data()?.tarefa,
    created: new Date(miliseconds).toLocaleDateString('pt-BR'),
    public: docSnap.data()?.public,
    user: docSnap.data()?.user,
    taskId: id,
  }
  // console.log(task);

  return(
    <div className={styles.container}>
      <Head>
        <title>Tarefa - Detalhes da tarefa</title>
      </Head>
      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={ styles.task }>
          <p>
            { task.tarefa }
          </p>
        </article>
      </main>
    </div>
  );
}