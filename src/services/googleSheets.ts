// URL do seu script (configurada via variável de ambiente)
const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz6BmO1rhI8LTRNzakiQ8ryL1cO2tAaNSFfWx9fh0ZFHqZ0b2FgW4WJxg19B8VC5WkH/exec';

// Exemplo de uso
async function testarSistema() {
  try {
    // Testar conexão
    const teste = await fetch(`${SCRIPT_URL}?action=test`);
    const resultadoTeste = await teste.json();
    console.log('Conexão:', resultadoTeste);
    
    // Buscar usuário
    const usuario = await fetch(`${SCRIPT_URL}?action=getUserRole&email=admin@email.com`);
    const resultadoUsuario = await usuario.json();
    console.log('Usuário:', resultadoUsuario);
    
    // Listar candidatos
    const candidatos = await fetch(`${SCRIPT_URL}?action=getCandidates`);
    const resultadoCandidatos = await candidatos.json();
    console.log('Candidatos:', resultadoCandidatos);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}
