import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen, MessageSquare, Zap, ChevronRight, Star,
  CheckCircle, Users, Award, Clock,
  ChevronDown, GraduationCap, Target, Headphones,
} from 'lucide-react'
import AnimatedHeroTitle from '@/components/AnimatedHeroTitle'

const STATS = [
  { value: '+100', label: 'alunos atendidos' },
  { value: '6 anos', label: 'de experiência' },
  { value: '4.9★', label: 'avaliação média' },
  { value: '100%', label: 'aulas individuais' },
]

const DIFFERENTIALS = [
  {
    icon: Target,
    title: 'Aulas 100% individuais',
    desc: 'Cada aula é planejada para seus objetivos, seu nível e seu vocabulário. Nada de material genérico.',
  },
  {
    icon: MessageSquare,
    title: 'Feedback detalhado',
    desc: 'Todo exercício entregue recebe comentários específicos da professora — não apenas uma nota.',
  },
  {
    icon: Zap,
    title: 'Progresso acelerado',
    desc: 'Metodologia focada em conversação real e gramática aplicada. Você usa o que aprende desde a primeira aula.',
  },
  {
    icon: Headphones,
    title: 'Suporte contínuo',
    desc: 'Acesso à plataforma entre aulas: exercícios, materiais e conteúdo exclusivo para praticar no seu ritmo.',
  },
]

const FAQS = [
  {
    q: 'Preciso ter base em inglês para começar?',
    a: 'Não. As aulas são adaptadas ao seu nível atual, do básico ao avançado. Na primeira aula fazemos uma avaliação de nivelamento para entender seu ponto de partida e seus objetivos.',
  },
  {
    q: 'Como funciona a plataforma? Ela substitui as aulas ao vivo?',
    a: 'A plataforma é um complemento às aulas. Aqui você acessa os exercícios criados especialmente para você, envia suas respostas e recebe feedback escrito da professora. As aulas ao vivo continuam normalmente.',
  },
  {
    q: 'Com que frequência são as aulas?',
    a: 'A frequência é combinada diretamente com a Bel conforme sua rotina e objetivos. O ideal para evolução consistente é de 1 a 2 aulas por semana. Entre em contato para conversarmos sobre o melhor formato para você.',
  },
  {
    q: 'Qual é o investimento?',
    a: 'Os valores são personalizados conforme frequência e objetivos. Entre em contato pelo WhatsApp para receber uma proposta adequada à sua realidade.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Entre em contato pelo WhatsApp para saber mais sobre as condições de cancelamento e flexibilidade.',
  },
]

// ───────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#43645a]">

      {/* Header */}
      <header className="border-b border-[#eeddcc] sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#d6865b] rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#43645a] text-lg">Rebeca Learning</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#como-funciona" className="px-4 py-2 text-sm text-[#43645a]/70 hover:text-[#43645a] hover:bg-[#eeddcc] rounded-lg transition-colors">Como funciona</a>
            <a href="#sobre" className="px-4 py-2 text-sm text-[#43645a]/70 hover:text-[#43645a] hover:bg-[#eeddcc] rounded-lg transition-colors">Sobre</a>
            <a href="#faq" className="px-4 py-2 text-sm text-[#43645a]/70 hover:text-[#43645a] hover:bg-[#eeddcc] rounded-lg transition-colors">FAQ</a>
            <Link href="/login" className="ml-2 px-4 py-2 text-sm text-[#43645a]/70 hover:text-[#43645a] hover:bg-[#eeddcc] rounded-lg transition-colors">Entrar</Link>
            <Link
              href="/signup"
              className="ml-1 px-4 py-2 text-sm font-medium text-white bg-[#d6865b] hover:bg-[#c4734a] rounded-lg transition-colors"
            >
              Cadastrar
            </Link>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login" className="px-3 py-2 text-sm text-[#43645a]/70 hover:text-[#43645a]">Entrar</Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-[#d6865b] rounded-lg"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-[92svh] md:min-h-[88vh] flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/herosection.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c2e2a]/80 via-[#1c2e2a]/65 to-[#1c2e2a]/80" />

        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-8 ring-1 ring-white/20">
              <Star className="h-3.5 w-3.5 fill-[#f0af8f] text-[#f0af8f]" />
              Aulas particulares de inglês online
            </div>
            <AnimatedHeroTitle />
            <p className="text-lg md:text-xl text-white/75 mb-10 leading-relaxed max-w-2xl mx-auto">
              Aulas 100% individuais, exercícios criados para você e feedback direto da professora, tudo organizado em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <a
                href="https://wa.me/5571992067642?text=Oi+Rebeca%2C+quero+saber+mais+sobre+as+aulas!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#d6865b] hover:bg-[#c4734a] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-black/30 text-base"
              >
                Falar com a Rebeca
                <ChevronRight className="h-4 w-4" />
              </a>
              <Link
                href="/content"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white hover:bg-white/10 font-medium rounded-xl transition-colors border border-white/40 text-base"
              >
                <BookOpen className="h-4 w-4" />
                Conteúdo grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-[#eeddcc] bg-[#eeddcc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-[#d6865b] mb-1">{s.value}</p>
                <p className="text-sm text-[#43645a]/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[#d6865b] uppercase tracking-widest mb-3">Processo</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#43645a] mb-4">Como funciona</h2>
          <p className="text-[#43645a]/60 max-w-xl mx-auto">Do primeiro contato à fluência, cada etapa foi pensada para você evoluir mais rápido.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '01', icon: GraduationCap, title: 'Nivelamento gratuito', desc: 'Na primeira aula, avaliamos seu inglês atual e entendemos seus objetivos — trabalho, viagem, exame ou conversação.' },
            { step: '02', icon: Target, title: 'Plano personalizado', desc: 'A professora monta um plano de estudos exclusivo para você, com foco no que realmente importa para sua meta.' },
            { step: '03', icon: BookOpen, title: 'Aulas + exercícios', desc: 'Aulas ao vivo + exercícios enviados pela plataforma. Você pratica entre aulas e recebe feedback detalhado.' },
            { step: '04', icon: CheckCircle, title: 'Resultado real', desc: 'Você acompanha sua evolução, conquista seus objetivos e ganha confiança para usar o inglês na vida real.' },
          ].map(item => (
            <div key={item.step} className="relative">
              <div className="text-5xl font-black text-[#eeddcc] mb-4 font-mono leading-none">{item.step}</div>
              <div className="w-10 h-10 bg-[#eeddcc] rounded-xl flex items-center justify-center mb-4">
                <item.icon className="h-5 w-5 text-[#d6865b]" />
              </div>
              <h3 className="font-semibold text-[#43645a] mb-2">{item.title}</h3>
              <p className="text-sm text-[#43645a]/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section className="bg-[#eeddcc] border-y border-[#f0af8f]/30 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#d6865b] uppercase tracking-widest mb-3">Por que escolher</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#43645a] mb-4">O que diferencia as aulas da Rebeca</h2>
            <p className="text-[#43645a]/60 max-w-xl mx-auto">Não é mais um aplicativo ou curso gravado. É acompanhamento real, de pessoa para pessoa.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DIFFERENTIALS.map(d => (
              <div key={d.title} className="bg-white rounded-2xl p-6 ring-1 ring-[#f0af8f]/40 shadow-sm">
                <div className="w-10 h-10 bg-[#eeddcc] rounded-xl flex items-center justify-center mb-4">
                  <d.icon className="h-5 w-5 text-[#d6865b]" />
                </div>
                <h3 className="font-semibold text-[#43645a] mb-2 text-sm">{d.title}</h3>
                <p className="text-sm text-[#43645a]/60 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE A PROFESSORA ── */}
      <section id="sobre" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <div className="flex justify-center md:justify-start pb-6 md:pb-0">
            <div className="relative">
              <div className="w-72 md:w-80 rounded-3xl overflow-hidden ring-1 ring-[#f0af8f]/50 shadow-md">
                <Image
                  src="/rebeca-perfil.png"
                  alt="Professora Rebeca"
                  width={320}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg ring-1 ring-[#eeddcc] px-4 py-3 flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#43645a]">4.9</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="text-sm font-semibold text-[#d6865b] uppercase tracking-widest mb-3">Professora</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#43645a] mb-2">Rebeca Queiroz Lopes</h2>
            <p className="text-[#43645a]/40 text-sm mb-6">Conhecida como Bel · 6 anos de experiência · Intercâmbio na Austrália</p>
            <p className="text-[#43645a]/70 leading-relaxed mb-4">
              Me chamo Rebeca, mas pode me chamar de Bel. Sempre amei idiomas e o inglês virou minha paixão de vida. Já vivi na Austrália em intercâmbio e passei um período na Polônia, acumulando experiências que transformaram completamente minha visão sobre ensinar e aprender uma língua. Voltei ao Brasil com um único objetivo: ajudar outras pessoas a viver o que eu vivi.
            </p>
            <p className="text-[#43645a]/70 leading-relaxed mb-8">
              Em 6 anos de aulas particulares, já acompanhei mais de 100 alunos — do iniciante absoluto ao avançado, de quem quer aprender inglês por prazer a quem precisa para uma vaga de emprego, uma viagem ou uma mudança de vida. Não importa o seu nível ou objetivo: existe um caminho feito para você.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Award, label: 'Intercâmbio na Austrália', sub: 'experiência internacional' },
                { icon: GraduationCap, label: '6 anos de experiência', sub: 'aulas particulares' },
                { icon: Users, label: '+100 alunos', sub: 'de todos os níveis' },
                { icon: Clock, label: 'Do zero ao avançado', sub: 'todos os objetivos' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-[#eeddcc]">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-[#f0af8f]/40">
                    <item.icon className="h-4 w-4 text-[#d6865b]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#43645a]">{item.label}</p>
                    <p className="text-xs text-[#43645a]/50">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/5571992067642?text=Oi+Rebeca%2C+quero+saber+mais+sobre+as+aulas!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#d6865b] hover:bg-[#c4734a] text-white font-semibold rounded-xl transition-colors shadow-md shadow-[#d6865b]/25 text-sm"
            >
              Falar com a Rebeca
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA CONTATO ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="bg-[#43645a] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3a5750] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#2e4640] rounded-full translate-y-1/2 -translate-x-1/2 opacity-50" />

          <div className="relative z-10">
            <p className="text-[#97b9a8] text-sm font-semibold uppercase tracking-widest mb-4">Pronto para começar?</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Fale com a Rebeca hoje
            </h2>
            <p className="text-[#97b9a8] mb-10 max-w-xl mx-auto text-lg">
              Tire suas dúvidas, conheça os planos e dê o primeiro passo rumo à fluência.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/5571992067642?text=Oi+Rebeca%2C+quero+saber+mais+sobre+as+aulas!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#d6865b] hover:bg-[#c4734a] text-white font-bold rounded-xl transition-colors shadow-xl shadow-black/20 text-base"
              >
                Falar pelo WhatsApp
                <ChevronRight className="h-4 w-4" />
              </a>
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-[#97b9a8] hover:text-white font-medium rounded-xl border border-[#43645a]/50 hover:border-[#97b9a8] transition-colors text-base"
              >
                Criar conta na plataforma
              </Link>
            </div>
            <p className="text-[#97b9a8]/60 text-xs mt-6">Resposta em até 24h · Horários flexíveis · Sem taxa de cancelamento</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-[#eeddcc] bg-[#eeddcc] py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#d6865b] uppercase tracking-widest mb-3">Dúvidas</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#43645a] mb-4">Perguntas frequentes</h2>
            <p className="text-[#43645a]/60">Não encontrou o que procura? Fale pelo WhatsApp.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="border-t border-[#eeddcc] py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#43645a] mb-4">Pronta para começar?</h2>
          <p className="text-[#43645a]/60 mb-8">
            Vagas limitadas para garantir atendimento personalizado a cada aluno.
          </p>
          <a
            href="https://wa.me/5571992067642?text=Oi+Rebeca%2C+quero+saber+mais+sobre+as+aulas!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#d6865b] hover:bg-[#c4734a] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[#d6865b]/25 text-base"
          >
            Falar com a Rebeca
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#43645a] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#d6865b] rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg">Rebeca Learning</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                Plataforma de aulas particulares de inglês da professora Rebeca Queiroz Lopes. Do básico ao avançado, para todos os objetivos.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a
                  href="https://www.instagram.com/inglescombel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-[#d6865b] rounded-lg flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a
                  href="https://wa.me/5571992067642"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-[#d6865b] rounded-lg flex items-center justify-center transition-colors"
                  title="WhatsApp"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
              </div>
            </div>

            {/* Nav */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-4">Navegação</h3>
              <ul className="space-y-2.5 text-sm text-white/55">
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#sobre" className="hover:text-white transition-colors">Sobre a Rebeca</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Perguntas frequentes</a></li>
                <li><Link href="/content" className="hover:text-white transition-colors">Conteúdo grátis</Link></li>
              </ul>
            </div>

            {/* CTA */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-4">Alunos</h3>
              <ul className="space-y-2.5 text-sm text-white/55">
                <li><Link href="/signup" className="hover:text-white transition-colors">Criar conta</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Entrar na plataforma</Link></li>
                <li>
                  <a
                    href="https://wa.me/5571992067642?text=Oi+Rebeca%2C+quero+saber+mais+sobre+as+aulas!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Falar com a Rebeca
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
            <p>© {new Date().getFullYear()} Rebeca Learning. Todos os direitos reservados.</p>
            <p>Desenvolvido com dedicação para quem quer aprender inglês de verdade.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── FAQ Accordion ──
function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-white rounded-2xl ring-1 ring-[#f0af8f]/40 shadow-sm overflow-hidden">
      <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none select-none hover:bg-[#eeddcc]/50 transition-colors">
        <span className="font-semibold text-[#43645a] text-sm pr-4">{question}</span>
        <ChevronDown className="h-4 w-4 text-[#43645a]/40 flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-5">
        <p className="text-sm text-[#43645a]/60 leading-relaxed">{answer}</p>
      </div>
    </details>
  )
}
