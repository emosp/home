import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.locale('zh-cn')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Shanghai')

export const GetTimestamp = () => dayjs().unix()

export const GetFormatDate = (template = 'YYYY-MM-DD HH:mm:ss') => dayjs().tz().format(template)

export {
  dayjs
}
