import axios from 'axios'

export const api_start_processing = (video_path: string) =>
  axios
    .post<{ message: string }>('/start_processing', { video_path })
    .then(res => res.data)

export const api_track_history_people_count = (video_path: string) =>
  axios.get<{ person_ids: number[] }>(
    `/track_history_people_count?${new URLSearchParams({ video_path })}`
  )

export const api_track_history_people_id_range = (
  video_path: string,
  person_id: number,
  type?: number
) =>
  axios.get<{
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
