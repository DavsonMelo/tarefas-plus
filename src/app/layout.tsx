import '@/styles/globals.css';
import { Header } from '@/components/Header';
import AuthProvider from '@/providers/AuthProvider';


export const metadata = {
  title: 'Tarefa+ | Organize suas tarefas de forma fácil',
  description: 'Feito com o poder do App Router',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="pt-br">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
