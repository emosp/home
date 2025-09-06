import logo_linuxdo from '@/assets/logo/linuxdo.webp'

export const ToSignUrl = (name) => `/api/sign/to/${name}`

export const Oauths: Array<{
  type: string
  logo: any
  label: string
  url: string
}> = [
  {
    type: 'linuxdo',
    logo: logo_linuxdo,
    label: 'Linux Do',
    url: ToSignUrl('linuxdo'),
  },
]
