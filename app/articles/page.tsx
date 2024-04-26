'use client'
import MarketingArea from "@/components/marketingArea";
import Navbar from "@/components/navbar";
import Image from "next/image";
import { articles } from '@/libs/articles';
import Link from "next/link";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronUp } from "@fortawesome/free-solid-svg-icons/faCircleChevronUp";
import { faCircleChevronDown } from "@fortawesome/free-solid-svg-icons/faCircleChevronDown";
import { faHeart } from "@fortawesome/free-regular-svg-icons/faHeart";
import { faFileLines } from "@fortawesome/free-regular-svg-icons";
import FormatDate from "@/libs/dateFormatter";

const Article = () => {
    const [visibleArticles, setVisibleArticles] = useState(6);

    const scrollTop = () => {
        return document.documentElement.scrollTop;
    }

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY; // Distância que a página foi rolada para baixo
            const windowHeight = window.innerHeight; // Altura da janela do navegador
            const pageHeight = document.documentElement.scrollHeight; // Altura total do conteúdo da página

            // Verifica se a soma da altura da janela e a distância rolada é igual ou maior que a altura total da página
            // Consideramos que estamos no final da página se essa condição for verdadeira
            const isAtBottom = (scrollTop + windowHeight) >= pageHeight;

            if (isAtBottom) {
                loadMoreArticles(3);
            }
        }

        const loadMoreArticles = (qt: number) => {
            setVisibleArticles(prevVisibleArticles => prevVisibleArticles + qt);
        }

        // Adiciona o ouvinte de evento
        window.addEventListener('scroll', handleScroll);

        // Retorna uma função de limpeza que remove o ouvinte de evento
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    function scrollToBottom() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth' // Isso faz com que a rolagem seja animada (suave) ao invés de instantânea
        });
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Isso faz com que a rolagem seja animada (suave) ao invés de instantânea
        });
    }

    return (
        <div className="h-screen flex flex-col items-center">

            <Navbar />

            <div className="flex flex-col justify-center items-center">
                <h1 className="uppercase font-semibold text-slate-500 sm:text-lg mt-3">Artigos</h1>
                <small className={`text-xs sm:text-base mb-3`}>Acompanhe nossas publicações</small>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4">
                    {articles.slice(0, visibleArticles).map((item, key) => (
                        <div key={key} className="fadeIn border border-gray-200 rounded-md shadow-md hover:scale-[1.01] hover:shadow-lg transition-all" style={{ maxWidth: '300px' }}>
                            <Link style={{ maxWidth: '100%', height: 'auto' }} href={`/articles/${item.slug}`}>
                                <Image src={`${item.img}`} alt={item.slug} width="300" height="300" style={{ width: '100%', height: 'auto', maxWidth: '300px', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }} priority={true} />
                                <div className="p-1">
                                    <div className="text-2xl text-slate-900 font-bold">{item.title}</div>
                                    <div><small>{item.subtitle}</small></div>
                                    <hr />
                                    <div className="flex justify-between">
                                        <div><small>Por {item.user.name}</small></div>
                                        <div><small>em <FormatDate format={"withNoHour"} date={item.created_at} /></small></div>
                                        <div><FontAwesomeIcon icon={faHeart} /> <small>{item.likes}</small></div>
                                        <div><FontAwesomeIcon icon={faFileLines} /> <small>{item.comments.length}</small></div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-4">
                {articles.length >= visibleArticles &&
                    <button onClick={scrollToBottom} className="bg-slate-200 text-slate-900 p-4 rounded w-fit">
                        <FontAwesomeIcon icon={faCircleChevronDown} size="2xl" />
                    </button>
                }

                {scrollTop() !== 0 &&
                    <button onClick={scrollToTop} className="bg-slate-200 text-slate-900 p-4 rounded w-fit">
                        <FontAwesomeIcon icon={faCircleChevronUp} size="2xl" />
                    </button>}
            </div>

            <MarketingArea />

        </div>
    );
}

export default Article;