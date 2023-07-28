import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='font-sans text-stone-950'>
        <nav className="flex justify-between bg-stone-400 p-2">
          <div className='uppercase font-semibold'><a href="/">Calculadora de Renda Passiva</a></div>
          <ul className='flex justify-between'>
            <li className='p-1 border-2 border-stone-400 hover:text-white hover:border-white'><a href="/">Home</a></li>
            <li className='p-1 border-2 border-stone-400 hover:text-white hover:border-white'><a href="/sobre">Sobre</a></li>
            <li className='p-1 border-2 border-stone-400 hover:text-white hover:border-white'><a href="/contato">Contato</a></li>
            <li className='p-1 border-2 border-stone-400 hover:text-white hover:border-white'><a href="/doacoes">Doações</a></li>
          </ul>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
