import instance, { ky } from '@/utils/ky'
import Compressor from 'compressorjs'
import { UploadCustomRequestOptions } from 'naive-ui'
import { nMessage, nNotification } from '@/utils/naive'

export const UploadFile = (
  file: File,
  upload_progress: (number) => {},
): Promise<{
  file_id: string
  file_path?: string
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

    let file_type = compressor_file.type

    // todo: subtitle
    let upload_type = null
    if (file_type.startsWith('image/')) {
      upload_type = 'image'
    }
    if (file_type.startsWith('video/')) {
      upload_type = 'video'
    }

    let data: {
      type: string
      file_id: string
      data: {
        upload_url: string
      }
    } = await instance
      .post('/api/upload/getUploadToken', {
        json: {
          type: upload_type,
          file_type,
          file_name: file.name,
          file_size: compressor_file.size,
        },
      })
      .json()

    let file_id = data.file_id,
      upload_url = data.data.upload_url

    switch (data.type) {
      case 'local':
        let form_data = new FormData()
        form_data.append('file_id', file_id)
        form_data.append('file', compressor_file)

        upload_progress(30)
        instance
          .post(upload_url, {
            timeout: false,
            body: form_data,
            retry: 1,
          })
          .then(async (res) => {
            resolve({
              file_id,
              file_path: (await res.json()).path,
            })
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
        break

      case 'r2':
        ky
          .put(upload_url, {
            timeout: false,
            body: compressor_file,
            retry: 1,
          })
          .then(async (res) => {
            resolve({
              file_id,
            })
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
        break

      case 'onedrive':
        let chunk_size = 60 * 1024 * 1024,
          file_total = compressor_file.size,
          file_chunks = Math.ceil(file_total / chunk_size)

        let notify = nNotification().info({
          title: '正在上传',
          closable: false,
        })

        for (let i = 0; i < file_chunks; i++) {
          notify.description = `正在上传 ${i + 1} / ${file_chunks}`

          let chunk_start = i * chunk_size,
            chunk_end = Math.min(chunk_start + chunk_size, file_total),
            chunk_file = compressor_file.slice(chunk_start, chunk_end)

          try {
            upload_progress(((i / file_chunks) * 0.8).toFixed())
            await ky.put(upload_url, {
              timeout: false,
              headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Range': `bytes ${chunk_start}-${chunk_end - 1}/${file_total}`,
              },
              method: 'put',
              body: chunk_file,
              retry: 1,
            })
          } catch (err) {
            notify.destroy()
            console.error(`ondrive upload error: ${err}`)
            reject(err)
          }
        }

        notify.destroy()
        resolve({
          file_id,
        })
        break

      default:
        break
    }
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

  nMessage().success('文件上传成功', {
    duration: 1000 * 2,
  })
  options.file.fullPath = file_upload_data.file_path || file_upload_data.file_id
  options.onFinish()
}
