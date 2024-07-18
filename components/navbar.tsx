'use client'
import { useState } from 'react';
import Image from 'next/image'
import { Menu } from '@/types/menu';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menus: Menu[] = [
    // { title: "Calculadora", url: "/" },
    // { title: "Artigos", url: "/articles" },
    // Adicione mais itens conforme necessário
  ];

  return (
    <nav className="relative flex w-full flex-nowrap items-center justify-between bg-slate-600 py-2 text-neutral-500 shadow-md hover:text-neutral-700 focus:text-neutral-700 lg:flex-wrap lg:justify-start lg:py-4">
      <div className="flex w-full flex-wrap items-center justify-between px-3">
        <div className="flex">
          <Image
            src="/logo.png"
            width={50}
            height={50}
            alt="Logomarca"
          />
          <div>
            <a className="text-xl text-white roboto-mono-title" href={'/'}>CRP</a>
            <p className='flex roboto-mono-subtitle text-slate-100 text-xs'>Calculadoras financeiras</p>
          </div>
        </div>
        <button
          className="block border-0 bg-transparent px-2 text-black/50 hover:no-underline hover:shadow-none focus:no-underline focus:shadow-none focus:outline-none focus:ring-0 lg:hidden"
          type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span
            className="[&>svg]:w-7 [&>svg]:stroke-black/50">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd" />
            </svg> */}
          </span>
        </button>

        <div
          className={`mt-2 ${isMenuOpen ? 'visible' : 'hidden'} flex-grow basis-[100%] lg:mt-0 lg:!flex lg:basis-auto flex justify-end`}>
          <ul className="list-style-none me-auto flex flex-col ps-0 lg:mt-1 lg:flex-row lg:me-0 lg:content-end">
            {menus.map((item, key) => (
              <li className="my-1 ps-1 lg:my-0 lg:pe-1 lg:ps-2" key={key}>
                <a className="text-black lg:px-2" href={item.url}>{item.title}</a>
              </li>
            ))}

          </ul>
        </div>
      </div>
    </nav>
  );
}
