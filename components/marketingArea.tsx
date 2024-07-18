'use client'
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";

const MarketingArea = () => {

    return (
        <div className="flex flex-col items-center text-center mt-3 bg-white">

            <div className="container flex flex-col items-center px-3 lg:flex-row">

                <div className="my-3 mx-3 flex flex-col items-center pb-3 lg:w-1/2">
                    <div className="roboto-mono-subtitle">Considere ser um patrocinador com qualquer valor e ajude nossos projetos GRATUITOS!</div>

                    <button className="mt-3 border border-slate-300 rounded-lg">
                        <a href="https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380848eed4752018eedb8ca7f0039" target="_blank" className="">
                            <div className='flex items-center bg-black py-3 px-1 rounded-lg text-white border-2 border-slate-400 w-[200px] h-[50px] text-start leading-3'>
                                <FontAwesomeIcon icon={faHeart} beat style={{ color: "#b40000" }} size='xl' className='mx-4' />
                                <span className='text-md roboto-mono-comment'>SEJA UM <br /> <span className='text-lg roboto-mono-title'>PATROCINADOR</span></span>
                            </div>
                        </a>
                    </button>
                </div>

                <div className="my-3 mx-3 flex flex-col items-center lg:w-1/2">
                    <div className='roboto-mono-subtitle'>Baixe o App da Calculadora de Renda Passiva e a tenha sempre a mão, mesmo sem internet!</div>

                    <button className="">
                        <a href='https://play.google.com/store/apps/details?id=com.cwrsiqueira.crp_app&pcampaignid=web_share&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1' target="_blank">
                            <Image
                                src="https://play.google.com/intl/en_us/badges/static/images/badges/pt_badge_web_generic.png"
                                width={200}
                                height={50}
                                alt="Disponível no Google Play"
                            />
                        </a>
                    </button>
                </div>

            </div>


            <div className="text-center sm:w-80 p-4 mt-4 font-semibold">
                Conheça meus outros projetos, nas minhas redes sociais. <br /><hr className="mb-2" />

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