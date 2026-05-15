export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold">
        Política de Privacidade - IronFit
      </h1>

      <p className="text-sm opacity-70">
        Última atualização: 12/05/2026
      </p>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">
          1. Introdução
        </h2>

        <p>
          O IronFit valoriza sua privacidade e protege
          seus dados pessoais conforme a Lei Geral de
          Proteção de Dados (LGPD - Lei nº 13.709/2018).
        </p>

        <p>
          Ao utilizar nossa plataforma, você concorda
          com os termos desta Política de Privacidade.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">
          2. Dados coletados
        </h2>

        <ul className="list-disc pl-6 space-y-1">
          <li>Nome completo</li>
          <li>E-mail</li>
          <li>Telefone</li>
          <li>Foto de perfil</li>
          <li>Peso e altura</li>
          <li>Objetivos fitness</li>
          <li>Frequência de treino</li>
          <li>Medidas corporais</li>
          <li>Dados técnicos de acesso</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">
          3. Uso das informações
        </h2>

        <p>
          Os dados são utilizados para:
        </p>

        <ul className="list-disc pl-6 space-y-1">
          <li>Personalização de treinos</li>
          <li>Análise de evolução física</li>
          <li>Sugestões de macros e objetivos fitness</li>
          <li>Melhoria da experiência do usuário</li>
          <li>Segurança da plataforma</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">
          4. Inteligência Artificial
        </h2>

        <p>
          O IronFit utiliza inteligência artificial
          para sugerir treinos e distribuição de macros.
        </p>

        <p>
          As sugestões possuem caráter informativo e
          não substituem orientação médica,
          nutricional ou profissional.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">
          5. Compartilhamento de dados
        </h2>

        <p>
          O IronFit não vende dados pessoais.
        </p>

        <p>
          Algumas informações poderão ser processadas
          por serviços terceiros necessários para
          funcionamento da plataforma, incluindo
          autenticação e armazenamento.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">
          6. Exclusão de conta
        </h2>

        <p>
          O usuário poderá solicitar exclusão
          permanente da conta e dos dados associados.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">
          7. Menores de idade
        </h2>

        <p>
          Usuários entre 14 e 17 anos deverão possuir
          autorização de responsável legal.
        </p>
      </section>
    </main>
  );
}