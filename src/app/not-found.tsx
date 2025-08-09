export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h1 style={{ fontSize: '3rem' }}>404 - Página não encontrada</h1>
      <p>Você se perdeu por aí, camarada?</p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Voltar pro início
      </a>
    </div>
  );
}
