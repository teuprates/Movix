(() => {
  const groups = {
    owner: [{title:'MENU PRINCIPAL',items:[['Visão geral','/pages/proprietario/dashboard.html','grid'],['Minha frota','/pages/proprietario/veiculos.html','car'],['Locatários','/pages/proprietario/locatarios.html','users'],['Contratos','/pages/proprietario/contratos.html','file']]},{title:'GESTÃO',items:[['Financeiro','/pages/proprietario/financeiro.html','cash'],['Multas','/pages/proprietario/multas.html','alert'],['Manutenção','/pages/proprietario/manutencao.html','tool'],['Rastreamento','/pages/proprietario/rastreamento.html','pin'],['Ocorrências','/pages/proprietario/ocorrencias.html','alert']]},{title:'INTELIGÊNCIA',items:[['MOVIX IA','/pages/proprietario/movix-ia.html','spark']]}],
    renter: [{title:'MEU ESPAÇO',items:[['Início','/pages/locatario/dashboard.html','grid'],['Meu veículo','/pages/locatario/meu-veiculo.html','car'],['Meu contrato','/pages/locatario/contrato.html','file'],['Pagamentos','/pages/locatario/pagamentos.html','cash'],['Inspeção','/pages/locatario/inspecao.html','alert'],['Abastecimento','/pages/locatario/abastecimento.html','fuel'],['Assistência','/pages/locatario/assistencia.html','help']]},{title:'ASSISTENTE',items:[['MOVIX Assistant','/pages/locatario/assistant.html','spark']]}]
  };
  window.MovixNavigation = { groups };
})();
