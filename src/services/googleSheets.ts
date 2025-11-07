// URL do seu script (substitua pelo ID real)
const SCRIPT_URL = 'https://script.google.com/macros/s/SEU_ID/exec';

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
