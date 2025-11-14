export async function getAnalysts(): Promise<User[]> {
  try {
    console.log('🔍 Buscando analistas...');
    const result = await sheetsService.fetchData('getAnalysts');
    console.log('📥 Resultado completo de getAnalysts:', result);

    // CORREÇÃO: Verificar múltiplas estruturas possíveis
    let analysts = [];
    
    if (result.success && result.data && Array.isArray(result.data.analysts)) {
      // Estrutura: { success: true, data: { analysts: [...] } }
      analysts = result.data.analysts;
    } else if (result.success && Array.isArray(result.analysts)) {
      // Estrutura: { success: true, analysts: [...] }
      analysts = result.analysts;
    } else if (Array.isArray(result.data)) {
      // Estrutura: { data: [...] }
      analysts = result.data;
    } else if (Array.isArray(result)) {
      // Estrutura: [...] (array direto)
      analysts = result;
    } else {
      console.warn('⚠️ Estrutura de dados inesperada:', result);
      analysts = [];
    }

    console.log('✅ Analistas extraídos:', analysts);
    console.log('📊 Total de analistas:', analysts.length);

    // Mapear para o formato User
    return analysts.map((analyst: any) => ({
      id: analyst.id || analyst.Email || analyst.email,
      email: analyst.Email || analyst.email,
      name: analyst.Nome || analyst.name || 'Nome não informado',
      role: analyst.Role || analyst.role || 'analyst',
      active: analyst.Ativo !== undefined ? analyst.Ativo : (analyst.active !== false)
    }));

  } catch (error) {
    console.error('❌ Erro ao buscar analistas:', error);
    // Retornar array vazio em caso de erro para não quebrar a UI
    return [];
  }
}
