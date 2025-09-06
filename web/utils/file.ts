import instance, { ky } from '@/utils/ky'
import Compressor from 'compressorjs'
import { UploadCustomRequestOptions } from 'naive-ui'
import { nMessage } from '@/utils/naive'

export const UploadFile = (
  file: File,
  upload_progress: (number) => {},
): Promise<{
  path: string
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
      upload_url: string
      url: string
    } = await instance
      .post('/api/upload/token', {
        json: {
          type: file.type,
          name: file.name,
          size: file.size,
        },
      })
      .json()

    let xhr = new XMLHttpRequest()
    xhr.timeout = 0
    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) {
        upload_progress(((ev.loaded / ev.total) * 90).toFixed(2))
      }
    })
    xhr.addEventListener('load', () =>
      resolve({
        path: data.path,
      }),
    )
    xhr.addEventListener('error', (err) => reject(err))

    xhr.open('put', data.upload_url)
    xhr.send(compressor_file)
  })

export const uploadFileRequest = async (options: UploadCustomRequestOptions) => {
  let progress = (percent: number) =>
      options.onProgress({
        percent,
      }),
    error = (message: string) => {
      console.error(message)
      nMessage().error(message, {
        duration: 1000 * 10,
      })
      options.onError()
      throw new Error(message)
    }

  progress(1)

  let file = <File>options.file.file

  if (file.type.startsWith('image/')) {
    options.file.thumbnailUrl = URL.createObjectURL(file)
    progress(10)
  }

  let file_upload_data = await UploadFile(file, (upload_progress) => {
    progress(upload_progress / 2 + 20)
  }).catch((err) => {
    error(`上传失败 ${err}`)
  })

  // todo: 回调上传成功
  nMessage().success('文件上传成功', {
    duration: 1000 * 2,
  })
  options.file.fullPath = file_upload_data.path
  options.onFinish()
}
