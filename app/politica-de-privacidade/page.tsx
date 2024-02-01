const politicaDePrivacidade = () => {
    return (
        <div className="p-2 sm:p-3">
            <div className="mx-auto mt-20 max-w-4xl">
                <h1 className="text-center text-3xl font-bold mb-5">Política de Privacidade e Termos de Uso</h1>

                <h2 className="text-xl font-semibold mt-5">Política de Privacidade</h2>
                <p className="mt-3 text-lg">
                    Bem-vindo ao nosso aplicativo de Calcular Renda Passiva. Levamos sua privacidade a sério. Este
                    aplicativo não coleta, armazena ou processa quaisquer dados pessoais dos usuários. Toda informação inserida
                    é processada localmente no seu dispositivo e não é compartilhada conosco ou com terceiros.
                </p>
                <p className="mt-2">
                    O aplicativo permite que você calcule seus rendimentos com base em entradas como prazo, investimento
                    inicial, investimento recorrente e taxa. Os resultados gerados são exibidos apenas no seu dispositivo e
                    podem ser compartilhados por você através de meios como WhatsApp, e-mail, entre outros, a seu critério.
                </p>

                <h2 className="text-xl font-semibold mt-5">Uso de Dados</h2>
                <p className="mt-2">Nenhum dado pessoal é coletado ou armazenado pelo aplicativo. Todos os cálculos e resultados são gerados e
                    mantidos localmente no seu dispositivo. Não temos acesso a essas informações.</p>

                <h2 className="text-xl font-semibold mt-5">Monetização por Anúncios</h2>
                <p className="mt-2">O aplicativo é gratuito e se monetiza por meio de anúncios fornecidos pelas plataformas da Google para Play
                    Store e Apple para App Store. Não coletamos dados para a exibição de anúncios.</p>

                <h2 className="text-xl font-semibold mt-5">Termos de Uso</h2>
                <p className="mt-2">Os termos a seguir regem o uso do aplicativo de Calcular Renda Passiva.</p>
                <h3 className="text-lg font-semibold mt-4">Uso do Aplicativo</h3>
                <p className="mt-2">Este aplicativo é destinado à realização de cálculos de rendimentos e é fornecido &quot;como está&quot;, sem garantias
                    de precisão ou atualidade das informações. Os cálculos realizados são estimativas e não devem ser
                    considerados como aconselhamento financeiro profissional.</p>

                <h3 className="text-lg font-semibold mt-4">Limitação de Responsabilidade</h3>
                <p className="mt-2">Não nos responsabilizamos por decisões tomadas com base nas informações fornecidas pelo aplicativo. A
                    utilização do aplicativo e de suas funcionalidades é de sua inteira responsabilidade.</p>

                <h3 className="text-lg font-semibold mt-4">Compartilhamento de Informações</h3>
                <p className="mt-2">Qualquer compartilhamento de resultados gerados pelo aplicativo é feito por iniciativa do usuário. Não temos
                    acesso ou controle sobre as informações compartilhadas por você.</p>

                <h3 className="text-lg font-semibold mt-4">Alterações nos Termos</h3>
                <p className="mt-2">Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Quaisquer alterações serão
                    efetivas imediatamente após a publicação no aplicativo.</p>

                <h3 className="text-lg font-semibold mt-4">Contato</h3>
                <p className="mt-2">Se tiver dúvidas ou preocupações com relação à nossa Política de Privacidade ou Termos de Uso, entre em
                    contato conosco através do e-mail: <a href="mailto:contato@calcularrendapassiva.com.br" className="text-blue-600 hover:underline">contato@calcularrendapassiva.com.br</a></p>

                <footer className="mt-5 mb-3 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 mt-4 font-semibold text-sm">
                        <a className="m-2" href="/">Voltar para Calculadora</a>
                        <p className="m-2">© {new Date().getFullYear()} Calcular Renda Passiva. Todos os direitos reservados.</p>
                    </div>
                </footer>
            </div>

        </div>
    )
}

export default politicaDePrivacidade;