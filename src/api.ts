import axios from 'axios'

export type VidPath = { name: string; path: string }

//
//
//

type api_upload_config_t = Promise<{
  video_paths: VidPath[]
}>
export async function api_upload_config({
  configFile,
}: {
  configFile: File
}): api_upload_config_t {
  if (import.meta.env.DEV)
    return Promise.resolve({
      video_paths: [
        { name: 'name1', path: '/long/long/long/path1' },
        { name: 'name2', path: '/long/long/long/path2' },
      ],
    })

  const formData = new FormData()
  formData.append('configFile', configFile)
  const res = await axios.post<Awaited<api_upload_config_t>>(
    '/upload_config',
    formData
  )
  return res.data
}

//
//
//

type api_start_processing_t = Promise<void>
export const api_start_processing = ({
  video_path,
}: {
  video_path: string
}): api_start_processing_t =>
  import.meta.env.DEV
    ? Promise.resolve()
    : axios
        .post<Awaited<api_start_processing_t>>('/start_processing', {
          video_path,
        })
        .then(res => res.data)

//
//
//

//
//
//

//
//
//

const url_vid_track_person_ids = ({ video_path }: { video_path: string }) =>
  `/vid/${encodeURIComponent(video_path)}/person-ids`

const url_vid_track_pid = ({
  video_path,
  person_id,
}: {
  video_path: string
  person_id: number
}) => `${url_vid_track_person_ids({ video_path })}/${person_id}`

//
//
//

export type api_vid_track_pid_list_t = Promise<{
  person_ids: number[]
}>
export const api_vid_track_pid_list = ({
  video_path,
}: {
  video_path: string
}): api_vid_track_pid_list_t =>
  import.meta.env.DEV
    ? Promise.resolve({
        person_ids: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 990, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
      })
    : axios
        .get<Awaited<api_vid_track_pid_list_t>>(
          url_vid_track_person_ids({ video_path })
        )
        .then(res => res.data)

//
//
//

export type api_vid_track_pid_t = Promise<{
  person_id: number
  frame_start_time_sec: number
  frame_end_time_sec: number
  scrshot_paths: string[]
}>

export const api_vid_track_pid = ({
  video_path,
  person_id,
}: {
  video_path: string
  person_id: number
}): api_vid_track_pid_t =>
  import.meta.env.DEV
    ? Promise.resolve({
        person_id,
        frame_start_time_sec: 1.5,
        frame_end_time_sec: 2.5,
        scrshot_paths: [1, 2, 3, 4].reduce(
          acc => [
            ...acc,
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=',
          ],
          [] as string[]
        ),
      })
    : axios
        .get<Awaited<api_vid_track_pid_t>>(
          url_vid_track_pid({ video_path, person_id })
        )
        .then(res => res.data)

//
//
//

export type api_vid_track_pid_del_t = Promise<void>

export const api_vid_track_pid_del = ({
  video_path,
  person_id,
}: {
  video_path: string
  person_id: number
}): api_vid_track_pid_del_t =>
  import.meta.env.DEV
    ? Promise.resolve()
    : axios
        .delete<Awaited<api_vid_track_pid_del_t>>(
          url_vid_track_pid({ video_path, person_id })
        )
        .then(res => res.data)

//
//
//

export type api_vid_track_pid_range_merge_t = Promise<void>

export async function api_vid_track_pid_range_merge({
  video_path,
  person_id,
  person_ids_dst,
}: {
  video_path: string
  person_id: number
  person_ids_dst: number[]
}): api_vid_track_pid_range_merge_t {
  person_ids_dst = person_ids_dst.filter(id => id !== person_id)
  if (import.meta.env.DEV || person_ids_dst.length === 0)
    return Promise.resolve()

  const res = await axios.put<Awaited<api_vid_track_pid_range_merge_t>>(
    url_vid_track_pid({ video_path, person_id }),
    {
      merge_with: person_ids_dst,
    }
  )
  return res.data
}

//
//
//

export const get_file_url_by_path = (path: string) =>
  path.startsWith('data:image/png;base64,')
    ? path
    : `/file/${encodeURIComponent(path)}`
