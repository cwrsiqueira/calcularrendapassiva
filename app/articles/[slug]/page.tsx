'use client'
import MarketingArea from "@/components/marketingArea";
import Navbar from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";
import { useParams } from 'next/navigation';
import { articles } from "@/libs/articles";
import FormatDate from "@/libs/dateFormatter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-regular-svg-icons/faHeart";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import TextFormatter from "@/libs/textFormatter";
import { faCircleChevronUp } from "@fortawesome/free-solid-svg-icons/faCircleChevronUp";
import { useEffect, useState } from "react";
import { Article as Art } from "@/types/article";

const Article = () => {
    const params = useParams();
    const [commentsQt, setCommentsQt] = useState(3);
    const [itemEncontrado, setItemEncontrado] = useState<Art>();

    useEffect(() => {
        const search = articles.find(item => item.slug === params.slug);
        setItemEncontrado(search);
    }, [params.slug]);

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Isso faz com que a rolagem seja animada (suave) ao invés de instantânea
        });
    }

    return (
        <div className="h-screen flex flex-col items-center">

            <Navbar />

            <div className="flex flex-col justify-center items-center p-3 container mx-auto px-4">
                <h1 className="uppercase font-semibold text-slate-500 sm:text-lg mt-3">{itemEncontrado?.title}</h1>
                <small className={`text-xs sm:text-base mb-3`}>{itemEncontrado?.subtitle}</small>

                <div className="flex gap-4 flex-col justify-center items-center">
                    <Image src={`${itemEncontrado?.img}`} alt={itemEncontrado?.slug ?? 'Sem Imagem'} width="300" height="300" />
                    <div className="flex gap-4">
                        <div>
                            Por: {itemEncontrado?.user.name} <FormatDate format={"withNoHour"} date={itemEncontrado?.created_at} />
                        </div>
                        <div>
                            <a href={`/articles/${params.slug}#comments-section`}><div><FontAwesomeIcon icon={faComment} /> {itemEncontrado?.comments.length} Comentários</div></a>
                        </div>
                    </div>
                    <div className="border-b pb-3 mb-3 max-w-6xl">
                        <hr className="my-3" />
                        <div><TextFormatter text={itemEncontrado?.body} /></div>
                    </div>
                </div>



                <div className="pt-3 mt-3 w-full max-w-6xl" id="comments-section">
                    <div className="flex gap-4">
                        <a href=""><div><FontAwesomeIcon icon={faHeart} /> 2,34mil</div></a>
                        <a href=""><div><FontAwesomeIcon icon={faComment} /> {itemEncontrado?.comments.length}</div></a>
                    </div>
                    <hr className="my-1" />
                    {itemEncontrado?.comments.map((item, key) => (
                        <div key={key}>
                            <div><small>{item.user.name} - <FormatDate format={"withHour"} date={item.created_at} /></small>:</div>
                            <div>{item.comment}</div>
                            <a href=""><div><small>Responda</small></div></a>
                            <hr className="my-3" />
                        </div>
                    )).slice(0, commentsQt)}
                    {commentsQt < (itemEncontrado?.comments.length || 0) &&
                        <button className="cursor-pointer" onClick={() => setCommentsQt(commentsQt + 3)}>Ver mais...</button>
                    }
                    {commentsQt >= (itemEncontrado?.comments.length || 0) &&
                        <button className="cursor-pointer" onClick={() => setCommentsQt(3)}>Ver menos...</button>
                    }
                </div>
            </div>

            <button onClick={scrollToTop} className="bg-slate-200 text-slate-900 p-4 rounded w-fit opacity-75" style={{ position: 'fixed', right: 20, bottom: 20 }}>
                <FontAwesomeIcon icon={faCircleChevronUp} size="2xl" />
            </button>

            <MarketingArea />

        </div>
    );
}

export default Article;