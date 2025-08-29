import instance from '@/utils/ky'
import Compressor from 'compressorjs'
import { UploadCustomRequestOptions } from 'naive-ui'
import { nMessage } from '@/utils/naive'

export const UploadFile = (
  file: File,
  upload_progress: (number) => {},
): Promise<{
  path: string
  url: string
}> =>
  new Promise(async (resolve, reject) => {
    let compressor_file: Blob = await new Promise((resolve) => {
      new Compressor(file, {
        success(row) {
          resolve(row)
        },
        error(error) {
          console.error(error)
          resolve(file)
        },
      })
    })

    let data: {
      host: string
      token: string
    } = await instance.post('uploadToken').json()

    let form_data = new FormData()
    form_data.append('file', compressor_file)
    form_data.append('token', data.token)

    ky.post(`https://${data.host}`, {
      body: form_data,
      retry: 1,
      onUploadProgress: (progress, chunk) => {
        upload_progress(progress.percent * 100)
      },
    })
      .then(async (res) => {
        resolve(await res.json())
      })
      .catch((err) => {
        console.error(err)
        reject(err)
      })
  })

export const uploadFileRequest = async (options: UploadCustomRequestOptions) => {
  let progress = (percent: number) =>
      options.onProgress({
        percent,
      }),
    error = (message: string) => {
      nMessage().error(message)
      options.onError()
    }

  progress(1)

  let file = <File>options.file.file

  if (file.type.startsWith('image/')) {
    options.file.thumbnailUrl = URL.createObjectURL(file)
    progress(10)
  }

  let file_upload_data = await UploadFile(file, (upload_progress) => {
    progress(upload_progress / 2 + 50)
  })

  let file_upload_url = file_upload_data.upload_url,
    file_upload_path = file_upload_data.path
  if (!file_upload_url) {
    error('好像哪里出错了 要不再试下')
    return
  }

  options.file.fullPath = file_upload_path
  options.onFinish()
}
