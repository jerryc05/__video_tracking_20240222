import axios from 'axios'

export type VidPath = { name: string; path: string }

export async function api_upload_config({ configFile }: { configFile: File }) {
  const formData = new FormData()
  formData.append('configFile', configFile)
  const res = await axios.post<{
    video_paths: VidPath[]
  }>('/upload_config', formData)
  return res.data
}

export const api_start_processing = ({ video_path }: { video_path: string }) =>
  axios.post<null>('/start_processing', { video_path }).then(res => res.data)

export const api_track_people_count = ({
  video_path,
}: {
  video_path: string
}) =>
  axios
    .get<{ person_ids: number[] }>(
      `/track_people_count?${new URLSearchParams({ video_path })}`
    )
    .then(res => res.data)

export const api_track_history_people_id_range = ({
  video_path,
  person_id,
  type,
}: {
  video_path: string
  person_id: number
  type?: number
}) =>
  axios
    .get<{
      person_id: number
      frame_start: string
      frame_end: string
    }>(
      `/track_history_people_id_range?${new URLSearchParams({
        ...(type != null && { type: type?.toString() }),
        video_path,
        person_id: person_id.toString(),
      })}`
    )
    .then(res => res.data)
