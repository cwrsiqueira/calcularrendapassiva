'use client'
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";
import Link from 'next/link';

const MarketingArea = () => {

    return (
        <div className="flex flex-col items-center text-center mt-3">

            {/* <div className="flex flex-col sm:flex-row">

                <Link href={'https://go.hotmart.com/I92666184R'} target='_blank'>
                    <div className='flex flex-col items-center'>
                        <div className="text-center sm:w-80 p-4 mt-4 font-semibold">Planilha Excel para Cálculo de Financiamento e de Desconto dos Juros para Antecipação de Parcelas.</div>

                        <Image
                            src="https://static-media.hotmart.com/xmC2TQ3svtXHAnDtNjk2rgVjMOQ=/filters:quality(100):format(webp)/klickart-prod/uploads/media/file/7813145/planilhas_excel_1200x1200.png"
                            alt="Landscape picture"
                            width={200}
                            height={200}
                        />


                        <div className="text-center sm:w-80 p-4 mt-4 font-semibold">Utilize o código CRP20 e ganhe 20% de desconto.</div>
                    </div>
                </Link>

            </div> */}

            <div className="flex flex-col sm:flex-row">

                <div>
                    <div className="text-center sm:w-80 p-4 mt-4 font-semibold">Considere ser um patrocinador por apenas R$ 4,99 por mês e ajude a manter a Calculadora de Renda Passiva sempre GRATUITA!</div>

                    <button className="border border-slate-600 p-4 rounded-md bg-slate-900 text-white text-2xl font-semibold">
                        <a href="https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c938084882ea1dd0188305e8e0e00bc" target="_blank" className='flex items-center'>
                            <FontAwesomeIcon icon={faHeart} beat style={{ color: "#b40000", }} width={29} />
                            &nbsp; Seja um Patrocinador</a>
                    </button>
                </div>

                <div className="text-center sm:w-80 p-4 mt-4 font-semibold">
                    Baixe o App da Calculadora de Renda Passiva e tenha a calculadora a mão, mesmo sem internet. <br /><br />
                    <div className="flex justify-center">
                        <a href='https://play.google.com/store/apps/details?id=com.cwrsiqueira.crp_app&pcampaignid=web_share&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1' target="_blank">
                            <Image
                                src="https://play.google.com/intl/en_us/badges/static/images/badges/pt_badge_web_generic.png"
                                width={300}
                                height={70}
                                alt="Disponível no Google Play"
                            />
                        </a>
                    </div>
                </div>
            </div>


            <div className="text-center sm:w-80 p-4 mt-4 font-semibold">
                Conheça meus outros projetos nas minhas redes <br /><hr className="mb-2" />

                <div className="flex justify-center">
                    <a href="https://github.com/cwrsiqueira?tab=repositories" target="_blank" className="mx-3">
                        <FontAwesomeIcon icon={faGithub} size="xl" />
                    </a>
                    <a href="https://www.linkedin.com/in/carloswagner1975/" target="_blank" className="mx-3">
                        <FontAwesomeIcon icon={faLinkedin} size="xl" />
                    </a>
                    <a href="https://www.youtube.com/channel/UC32eliBwKUGGc_uTgcxTJXw" target="_blank" className="mx-3">
                        <FontAwesomeIcon icon={faYoutube} size="xl" />
                    </a>
                    <a href="mailto:suporte@calcularrendapassiva.com.br" target="_blank" className="mx-3">
                        <FontAwesomeIcon icon={faEnvelope} size="xl" />
                    </a>
                </div>

            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 mt-4 font-semibold text-sm">
                <a className="m-2" href="/politica-de-privacidade">Políticas de Privacidade e Termos de uso</a>
                <p className="m-2">© {new Date().getFullYear()} Calcular Renda Passiva. Todos os direitos reservados.</p>
            </div>
        </div>
    );
}
export default MarketingArea;