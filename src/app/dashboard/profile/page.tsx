'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, User, Phone, Lock, Eye, EyeOff, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const profileSchema = z.object({
  full_name: z.string().min(3, 'Nome muito curto'),
  whatsapp: z.string().min(10, 'Número inválido').regex(/^[\d\s()\-+]+$/, 'Apenas números').or(z.literal('')),
})

const passwordSchema = z.object({
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Senhas não conferem', path: ['confirm'] })

type ProfileData = z.infer<typeof profileSchema>
type PasswordData = z.infer<typeof passwordSchema>

export default function StudentProfilePage() {
  const supabase = createClient()
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState('')

  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) })
  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')

      const { data: profile } = await supabase.from('profiles').select('full_name, whatsapp').eq('id', user.id).single()
      if (profile) {
        profileForm.reset({ full_name: profile.full_name, whatsapp: profile.whatsapp ?? '' })
      }
    }
    load()
  }, [])

  const saveProfile = async (data: ProfileData) => {
    setLoadingProfile(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('profiles').update({
        full_name: data.full_name,
        whatsapp: data.whatsapp || null,
      }).eq('id', user!.id)
      if (error) throw error
      toast.success('Perfil atualizado!')
    } catch {
      toast.error('Erro ao salvar perfil.')
    } finally {
      setLoadingProfile(false)
    }
  }

  const savePassword = async (data: PasswordData) => {
    setLoadingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) throw error
      toast.success('Senha alterada com sucesso!')
      passwordForm.reset()
    } catch {
      toast.error('Erro ao alterar senha.')
    } finally {
      setLoadingPassword(false)
    }
  }

  const inputClass = 'w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 transition'

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Meu perfil</h1>
        <p className="text-slate-500 mt-1 text-sm">Gerencie seus dados pessoais e senha</p>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Informações pessoais</h2>
        </div>

        <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">E-mail</label>
            <input
              disabled
              value={email}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-100 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400">O e-mail não pode ser alterado.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Nome completo</label>
            <input
              placeholder="Seu nome"
              className={inputClass}
              {...profileForm.register('full_name')}
            />
            {profileForm.formState.errors.full_name && (
              <p className="text-xs text-red-500">{profileForm.formState.errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              WhatsApp
              <span className="text-slate-400 font-normal ml-1 text-xs">(com DDD)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                placeholder="(71) 99999-9999"
                className={`${inputClass} pl-10`}
                {...profileForm.register('whatsapp')}
              />
            </div>
            {profileForm.formState.errors.whatsapp && (
              <p className="text-xs text-red-500">{profileForm.formState.errors.whatsapp.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loadingProfile}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 shadow-sm shadow-indigo-200"
            >
              {loadingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
            <Lock className="h-4 w-4 text-amber-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Alterar senha</h2>
        </div>

        <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Nova senha</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                className={`${inputClass} pr-10`}
                {...passwordForm.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.password && (
              <p className="text-xs text-red-500">{passwordForm.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Confirmar nova senha</label>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Repita a senha"
              className={inputClass}
              {...passwordForm.register('confirm')}
            />
            {passwordForm.formState.errors.confirm && (
              <p className="text-xs text-red-500">{passwordForm.formState.errors.confirm.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loadingPassword}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors disabled:opacity-60 shadow-sm"
            >
              {loadingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Alterar senha
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
