import './globals.css'
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "Calcular Renda Passiva | Calculate Passive Income",
  authors: [{ name: "Carlos Wagner webdev", url: "https://cwwebdev.com.br" }],
  description:
    "Calculadora de Renda Passiva sobre Aplicação Financeira, Passive Income Calculator on Financial Application",
  keywords:
    "renda, passiva, calculadora, calculadora de renda passiva, investimento, aplicação, financeira, aplicações, renda de aplicações, calcular, calcular renda passiva, income, passive, calculator, passive income calculator, investment, application, financial, applications, application income, calculate, calculate passive income",
  openGraph: {
    url: "https://calcularrendapassiva.com/",
    images: "/logo.png",
    type: "website",
    title: "Calcular Renda Passiva | Calculate Passive Income",
    description:
      "Calculadora de Renda Passiva sobre Aplicação Financeira, Passive Income Calculator on Financial Application",
  },
  twitter: {
    images: "/logo.png",
    card: "summary_large_image",
    title: "Calcular Renda Passiva | Calculate Passive Income",
    description:
      "Calculadora de Renda Passiva sobre Aplicação Financeira, Passive Income Calculator on Financial Application",
  },
  icons: "/icon.png",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className='font-sans text-stone-700'>
        <main>{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
