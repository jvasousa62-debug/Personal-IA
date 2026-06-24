export default function PrivacyPolicyPage() {
  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto", lineHeight: 1.6 }}>
      <h1>Política de Privacidade – IronFit</h1>

      <p style={{ opacity: 0.7, fontSize: 14 }}>
        Última atualização: 23/06/2026
      </p>

      <p>
        <strong>
          [AVISO INTERNO — REMOVER ANTES DE PUBLICAR: este documento foi
          gerado como rascunho para evitar página vazia antes do fechamento
          com a primeira academia. Precisa de revisão de advogado
          especializado em LGPD, especialmente quanto ao tratamento de dados
          de saúde (categoria sensível), base legal de cada operação, prazos
          reais de retenção e identificação dos operadores/suboperadores
          (Supabase, provedores de IA, RapidAPI/ExerciseDB). Campos entre
          colchetes [ASSIM] são placeholders.]
        </strong>
      </p>

      <h2>1. Quem trata seus dados</h2>
      <p>
        Esta Política de Privacidade descreve como{" "}
        <strong>
          [RAZÃO SOCIAL DA EMPRESA], CNPJ [CNPJ], com sede em [ENDEREÇO]
        </strong>{" "}
        (&quot;Empresa&quot;, &quot;nós&quot;), na qualidade de controladora
        de dados, trata as informações pessoais coletadas através da
        plataforma IronFit (&quot;Plataforma&quot;), em conformidade com a
        Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 —
        LGPD).
      </p>
      <p>
        O IronFit é contratado por academias e estabelecimentos de atividade
        física (&quot;Academia&quot;), que também podem atuar como
        controladoras de dados de seus alunos em determinados contextos
        (ex.: gestão de matrícula). Quando isso ocorrer, a relação entre a
        Empresa e a Academia quanto ao tratamento de dados será detalhada em
        instrumento próprio (Termo de Tratamento de Dados / DPA), sem
        prejuízo desta Política, que regula a relação entre a Empresa e o
        Usuário Final dentro do app.
      </p>
      <p>
        Encarregado de Proteção de Dados (DPO): <strong>[NOME OU CARGO]</strong>,
        contato <strong>[E-MAIL DO DPO/PRIVACIDADE]</strong>.
      </p>

      <h2>2. Quais dados coletamos</h2>
      <p>Coletamos as seguintes categorias de dados:</p>
      <h3>2.1. Dados de cadastro e identificação</h3>
      <ul>
        <li>Nome completo, e-mail, senha (armazenada de forma criptografada);</li>
        <li>Vínculo com a Academia (qual unidade/estabelecimento);</li>
        <li>Foto de perfil/avatar, quando enviada pelo usuário.</li>
      </ul>
      <h3>2.2. Dados corporais e de saúde (categoria sensível)</h3>
      <p>
        Para personalizar treinos e calcular cargas, séries e progressão, o
        IronFit coleta, de forma inserida diretamente pelo usuário:
      </p>
      <ul>
        <li>Peso, altura, idade, gênero;</li>
        <li>Percentual de gordura corporal e percentual de massa muscular;</li>
        <li>Medidas corporais (peito, cintura, quadril, braços, coxas, panturrilha);</li>
        <li>Objetivo de treino (hipertrofia, força, emagrecimento etc.), nível de experiência e frequência semanal;</li>
        <li>Observações livres inseridas em check-ins (ex.: disposição, sono, dores relatadas), quando o usuário optar por preenchê-las.</li>
      </ul>
      <p>
        <strong>
          Estes dados podem se qualificar como dados sensíveis relacionados
          à saúde, nos termos do art. 5º, II, da LGPD.
        </strong>{" "}
        Seu fornecimento é voluntário; alguns recursos da Plataforma
        (cálculo de carga personalizada, IMC, recomendações específicas)
        dependem desses dados para funcionar de forma personalizada e podem
        ficar limitados sem eles.
      </p>
      <h3>2.3. Conteúdo gerado pelo uso</h3>
      <ul>
        <li>Histórico de mensagens trocadas com o assistente de IA (&quot;Personal IA&quot;);</li>
        <li>Treinos montados ou salvos pelo usuário;</li>
        <li>Preferências de uso do app (estilo de IA escolhido, nível de detalhamento, tema, idioma).</li>
      </ul>
      <h3>2.4. Dados técnicos</h3>
      <ul>
        <li>Dados de autenticação e sessão (tokens, identificador de usuário);</li>
        <li>Informações de dispositivo e navegador, logs de acesso e uso, quando aplicável, para fins de segurança e diagnóstico.</li>
      </ul>

      <h2>3. Para que usamos seus dados (finalidades e base legal)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, marginBottom: 12 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
            <th style={{ padding: 8 }}>Finalidade</th>
            <th style={{ padding: 8 }}>Base legal (LGPD)</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: 8 }}>Criar e manter sua conta, autenticação e segurança</td>
            <td style={{ padding: 8 }}>Execução de contrato (art. 7º, V)</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: 8 }}>Gerar treinos, cargas e recomendações personalizadas (inclui dados de saúde)</td>
            <td style={{ padding: 8 }}>Consentimento específico e destacado (art. 11, I) e execução de contrato</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: 8 }}>Operar o assistente de IA (&quot;Personal IA&quot;) e manter histórico de conversas</td>
            <td style={{ padding: 8 }}>Execução de contrato e consentimento, quando aplicável</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: 8 }}>Acompanhar evolução de peso, medidas e progresso ao longo do tempo</td>
            <td style={{ padding: 8 }}>Consentimento específico (dado de saúde) e execução de contrato</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: 8 }}>Gestão do relacionamento com a Academia (vínculo, faturamento do plano da Academia)</td>
            <td style={{ padding: 8 }}>Execução de contrato e legítimo interesse</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: 8 }}>Segurança, prevenção a fraude e cumprimento de obrigação legal</td>
            <td style={{ padding: 8 }}>Cumprimento de obrigação legal/regulatória e legítimo interesse</td>
          </tr>
          <tr>
            <td style={{ padding: 8 }}>Melhoria do produto (uso agregado/anonimizado quando possível)</td>
            <td style={{ padding: 8 }}>Legítimo interesse</td>
          </tr>
        </tbody>
      </table>
      <p>
        Quando a base legal for o consentimento, você pode retirá-lo a
        qualquer momento, sem prejuízo das operações já realizadas antes da
        retirada. A retirada do consentimento para dados de saúde pode
        limitar ou impedir o uso de funcionalidades de personalização do
        treino.
      </p>

      <h2>4. Uso de Inteligência Artificial</h2>
      <p>
        4.1. O IronFit utiliza modelos de inteligência artificial de
        terceiros para gerar respostas do assistente &quot;Personal
        IA&quot; (atualmente, provedores como Anthropic e/ou OpenAI,
        conforme disponibilidade técnica e roteamento interno do sistema).
        As mensagens enviadas ao assistente, incluindo dados de perfil
        relevantes para a personalização da resposta (ex.: peso, objetivo,
        semana do programa), são processadas por esses provedores
        exclusivamente para gerar a resposta.
      </p>
      <p>
        4.2. Conforme nossas configurações contratuais com esses provedores,
        as mensagens não são utilizadas para treinar os modelos de IA de
        terceiros. [PLACEHOLDER: confirmar e detalhar a política real de
        retenção/treinamento de cada provedor de IA efetivamente em uso,
        incluindo prazo de retenção contratual com cada um.]
      </p>
      <p>
        4.3. As respostas geradas por IA podem conter imprecisões e não
        substituem avaliação profissional — ver Termos de Uso, Seção 7.
      </p>

      <h2>5. Com quem compartilhamos seus dados</h2>
      <p>Podemos compartilhar dados pessoais com:</p>
      <ul>
        <li>
          <strong>Provedores de infraestrutura e banco de dados</strong> (ex.: Supabase), que armazenam e processam dados em nosso nome, sob instruções contratuais de confidencialidade e segurança;
        </li>
        <li>
          <strong>Provedores de inteligência artificial</strong> (ex.: Anthropic, OpenAI), para geração das respostas do assistente, conforme item 4;
        </li>
        <li>
          <strong>Provedores de conteúdo de exercícios</strong> (ex.: ExerciseDB via RapidAPI), para exibição de GIFs/ilustrações de execução de exercícios — nestes casos, normalmente apenas o termo de busca do exercício é enviado, não dados pessoais do usuário;
        </li>
        <li>
          <strong>A Academia</strong> à qual você está vinculado, que pode visualizar informações de vínculo, plano contratado e, dependendo da configuração acordada, indicadores agregados de uso e progresso de seus alunos para fins de acompanhamento pedagógico;
        </li>
        <li>
          <strong>Autoridades públicas</strong>, quando exigido por lei, ordem judicial ou para proteção de direitos da Empresa, de terceiros ou de segurança da Plataforma.
        </li>
      </ul>
      <p>
        Não vendemos dados pessoais a terceiros para fins de publicidade.
      </p>

      <h2>6. Onde seus dados são armazenados e transferência internacional</h2>
      <p>
        Seus dados podem ser armazenados e processados em servidores
        localizados fora do Brasil, em razão da infraestrutura dos
        provedores utilizados (ex.: hospedagem em nuvem, provedores de IA).
        Nesses casos, adotamos os mecanismos exigidos pela LGPD para
        transferência internacional de dados, como cláusulas contratuais
        padrão ou verificação de nível de proteção adequado do país
        destinatário. [PLACEHOLDER: detalhar localização real dos servidores
        Supabase utilizados e demais provedores.]
      </p>

      <h2>7. Por quanto tempo guardamos seus dados</h2>
      <p>
        Mantemos seus dados pessoais enquanto sua conta estiver ativa e por
        prazo adicional necessário para cumprir obrigações legais, fiscais,
        regulatórias ou para exercício de direitos em processos
        administrativos ou judiciais. Histórico de chat, check-ins e treinos
        salvos são mantidos enquanto a conta existir, podendo ser excluídos
        a seu pedido conforme Seção 9. [PLACEHOLDER: definir prazo padrão de
        retenção após exclusão de conta, ex. 30/90 dias para backups, antes
        da exclusão definitiva.]
      </p>

      <h2>8. Segurança da informação</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger seus
        dados, incluindo controle de acesso por autenticação, uso de Row
        Level Security (RLS) no banco de dados para isolar dados entre
        usuários, e criptografia em trânsito (HTTPS/TLS). Nenhum sistema é
        100% livre de risco; em caso de incidente de segurança que possa
        acarretar risco ou dano relevante, notificaremos a Autoridade
        Nacional de Proteção de Dados (ANPD) e os titulares afetados, na
        forma da LGPD.
      </p>

      <h2>9. Seus direitos como titular de dados</h2>
      <p>Nos termos do art. 18 da LGPD, você pode solicitar:</p>
      <ul>
        <li>Confirmação da existência de tratamento;</li>
        <li>Acesso aos seus dados;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;</li>
        <li>Portabilidade dos dados a outro fornecedor de serviço, mediante requisição expressa;</li>
        <li>Eliminação dos dados pessoais tratados com base em consentimento (com as ressalvas legais de retenção obrigatória);</li>
        <li>Informação sobre compartilhamento de dados com terceiros;</li>
        <li>Revogação do consentimento, quando essa for a base legal aplicável;</li>
        <li>Revisão de decisões automatizadas que afetem seus interesses, quando aplicável.</li>
      </ul>
      <p>
        Para exercer esses direitos, envie sua solicitação para{" "}
        <strong>[E-MAIL DE CONTATO/PRIVACIDADE]</strong>. Responderemos em
        prazo razoável, observados os limites legais. Você também pode
        excluir sua conta e os dados associados diretamente no app, na
        seção de Perfil, opção &quot;Excluir Conta&quot;.
      </p>

      <h2>10. Crianças e adolescentes</h2>
      <p>
        O IronFit é destinado a maiores de 18 anos. Caso a Academia
        permita uso por menores sob supervisão, o tratamento de dados desses
        usuários dependerá de consentimento específico de pai, mãe ou
        responsável legal, conforme art. 14 da LGPD, formalizado pela
        Academia ou diretamente pela Empresa, conforme o caso.
        [PLACEHOLDER: definir fluxo real caso a Academia opte por permitir
        menores na plataforma.]
      </p>

      <h2>11. Cookies e tecnologias similares</h2>
      <p>
        A Plataforma pode utilizar armazenamento local do navegador
        (localStorage) para manter sessão, preferências de tema e cache de
        dados de uso, a fim de melhorar a experiência e reduzir
        carregamentos repetidos. Esses dados ficam armazenados no próprio
        dispositivo do usuário. [PLACEHOLDER: detalhar se cookies de
        analytics/terceiros forem adicionados no futuro.]
      </p>

      <h2>12. Alterações desta Política</h2>
      <p>
        Esta Política pode ser atualizada periodicamente para refletir
        mudanças legais, técnicas ou no funcionamento da Plataforma.
        Alterações relevantes serão comunicadas por aviso na Plataforma e/ou
        e-mail, com indicação da data de atualização no topo deste
        documento.
      </p>

      <h2>13. Contato</h2>
      <p>
        Dúvidas, solicitações ou reclamações sobre esta Política e sobre o
        tratamento de seus dados pessoais podem ser enviadas para{" "}
        <strong>[E-MAIL DE CONTATO/PRIVACIDADE]</strong>. Você também pode
        contatar a Autoridade Nacional de Proteção de Dados (ANPD) caso
        entenda necessário.
      </p>
    </main>
  );
}