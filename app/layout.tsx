import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='font-sans text-stone-700'>
        <main>{children}</main>
      </body>
    </html>
  )
}
