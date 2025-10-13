import logo_linuxdo from '@/assets/logo/linuxdo.webp'
import { Github, Google, Telegram, Microsoft } from '@vicons/fa'

export const ToSignUrl = (name) => `/api/sign/to/${name}`

export const Oauths: Array<{
  type: string
  logo?: any
  logo_component?: any
  label: string
  url: string
}> = [
  {
    type: 'linuxdo',
    logo: logo_linuxdo,
    label: 'Linux Do',
    url: ToSignUrl('linuxdo'),
  },
  {
    type: 'github',
    logo_component: Github,
    label: 'GitHub',
    url: ToSignUrl('github'),
  },
  {
    type: 'google',
    logo_component: Google,
    label: 'Google',
    url: ToSignUrl('google'),
  },
  {
    type: 'telegram',
    logo_component: Telegram,
    label: 'Telegram',
    url: ToSignUrl('telegram'),
  },
  {
    type: 'azure',
    logo_component: Microsoft,
    label: 'Microsoft',
    url: ToSignUrl('azure'),
  },
]
