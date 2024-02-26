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

type api_vid_track_pids_t = Promise<{
  person_ids: number[]
}>
export const api_vid_track_pids = ({
  video_path,
}: {
  video_path: string
}): api_vid_track_pids_t =>
  import.meta.env.DEV
    ? Promise.resolve({ person_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9] })
    : axios
        .get<Awaited<api_vid_track_pids_t>>(
          `/vid/${encodeURIComponent(video_path)}/track/person-ids`
        )
        .then(res => res.data)

//
//
//

const url_vid_track_pid_range = ({
  video_path,
  person_id,
}: {
  video_path: string
  person_id: number
}) =>
  `/vid/${encodeURIComponent(video_path)}/track/person-ids/${encodeURIComponent(
    person_id
  )}`

export type api_vid_track_pid_range_get_t = Promise<{
  person_id: number
  frame_start_time_sec: number
  frame_end_time_sec: number
}>

export const api_vid_track_pid_range_get = ({
  video_path,
  person_id,
}: {
  video_path: string
  person_id: number
}): api_vid_track_pid_range_get_t =>
  import.meta.env.DEV
    ? Promise.resolve({
        person_id,
        frame_start_time_sec: 1.5,
        frame_end_time_sec: 2.5,
      })
    : axios
        .get<Awaited<api_vid_track_pid_range_get_t>>(
          url_vid_track_pid_range({ video_path, person_id })
        )
        .then(res => res.data)

//
//
//

export type api_vid_track_pid_range_del_t = Promise<void>

export const api_vid_track_pid_range_del = ({
  video_path,
  person_id,
}: {
  video_path: string
  person_id: number
}): api_vid_track_pid_range_del_t =>
  import.meta.env.DEV
    ? Promise.resolve()
    : axios
        .delete<Awaited<api_vid_track_pid_range_del_t>>(
          url_vid_track_pid_range({ video_path, person_id })
        )
        .then(res => res.data)

//
//
//

export type api_vid_track_pid_range_merge_t = Promise<void>

export async function api_vid_track_pid_range_merge({
  video_path,
  person_ids,
}: {
  video_path: string
  person_ids: number[]
}): api_vid_track_pid_range_merge_t {
  if (import.meta.env.DEV) return Promise.resolve()
  if (person_ids.length < 2)
    throw new Error(`person_ids.length<2 (${person_ids})`)

  const res = await axios.put<Awaited<api_vid_track_pid_range_merge_t>>(
    url_vid_track_pid_range({ video_path, person_id: person_ids[0] }),
    {
      merge_with: person_ids.slice(1),
    }
  )
  return res.data
}
//
//
//

type api_vid_track_screenshots_t = Promise<{
  person_id: number
  paths: string[]
}>

export const api_vid_track_screenshots = ({
  video_path,
  person_id,
}: {
  video_path: string
  person_id: number
}): api_vid_track_screenshots_t =>
  import.meta.env.DEV
    ? Promise.resolve({
        person_id,
        paths: [
          '/long/long/long/path/to/person/1.jpg',
          '/long/long/long/path/to/person/2.jpg',
          '/long/long/long/path/to/person/3.jpg',
          '/long/long/long/path/to/person/4.jpg',
        ],
      })
    : axios
        .get<Awaited<api_vid_track_screenshots_t>>(
          `/vid/track/screenshots?${new URLSearchParams({
            person_id: person_id.toString(),
            video_path,
          })}`
        )
        .then(res => res.data)

//
//
//

export const get_file_url_by_path = (path: string) =>
  `/file/${encodeURIComponent(path)}`
