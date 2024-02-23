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

type api_track_people_count_t = Promise<{
  person_ids: number[]
}>
export const api_track_people_count = ({
  video_path,
}: {
  video_path: string
}): api_track_people_count_t =>
  import.meta.env.DEV
    ? Promise.resolve({ person_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9] })
    : axios
        .get<Awaited<api_track_people_count_t>>(
          `/track_people_count?${new URLSearchParams({ video_path })}`
        )
        .then(res => res.data)

//
//
//

type api_track_history_people_id_range_t = Promise<{
  person_id: number
  frame_start_time_sec: number // float
  frame_start_frame_no: number // int
  frame_end_time_sec: number // float
  frame_end_frame_no: number // int
}>

export const api_track_history_people_id_range = ({
  video_path,
  person_id,
}: {
  video_path: string
  person_id: number
}): api_track_history_people_id_range_t =>
  import.meta.env.DEV
    ? Promise.resolve({
        person_id,
        frame_start_time_sec: 1.5,
        frame_start_frame_no: 0,
        frame_end_time_sec: 1.5,
        frame_end_frame_no: 30,
      })
    : axios
        .get<Awaited<api_track_history_people_id_range_t>>(
          `/track_history_people_id_range?${new URLSearchParams({
            video_path,
            person_id: person_id.toString(),
          })}`
        )
        .then(res => res.data)

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

export const get_file_url_by_path = (path: string) => {
  return `/file/${encodeURIComponent(path)}`
}
