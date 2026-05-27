'use client'

import { useEffect, useState } from 'react'

const PHRASES = [
  'negócios com o mundo',
  'processos seletivos',
  'viagens sem fronteiras',
  'reuniões internacionais',
  'exames de proficiência',
  'morar no exterior',
  'promoções na carreira',
]

export default function AnimatedHeroTitle() {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const phrase = PHRASES[index]
    let timer: ReturnType<typeof setTimeout>

    if (!deleting && text === phrase) {
      timer = setTimeout(() => setDeleting(true), 2200)
    } else if (deleting && text === '') {
      setDeleting(false)
      setIndex(i => (i + 1) % PHRASES.length)
    } else {
      timer = setTimeout(
        () => setText(deleting ? text.slice(0, -1) : phrase.slice(0, text.length + 1)),
        deleting ? 35 : 70,
      )
    }

    return () => clearTimeout(timer)
  }, [text, deleting, index])

  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
      Inglês fluente para{' '}
      <br className="hidden sm:block" />
      <span>
        {text}
        <span className="animate-blink inline-block w-[3px] h-[0.85em] bg-[#d6865b] ml-1 align-middle rounded-sm" />
      </span>
    </h1>
  )
}
