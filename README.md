1）`GET /vid/{vid_path}/person-ids`

```ts
{
  person_ids: number[]
}
```

2）`GET /vid/{vid_path}/person-ids/{person_id}`

```ts
{
  person_id: number
  frame_start_time_sec: number
  frame_end_time_sec: number
  scrshot_paths: string[]
  trace_img: string
}
```

3）新的 `DELETE /vid/{vid_path}/person-ids/{person_id}`，返回好好好

4）新的 `PUT /vid/{vid_path}/person-ids/{person_id}`，有个 json body

```ts
{
  merge_with: number[]
}
```

意思是 `merge_with` 里的所有 id 全部合并到 url 里的那个 `person_id`，然后 `merge_with` 里的所有 id 应该消失，返回好好好

5）`GET /vid/{vid_path}/person-ids/{person_id}/trace`，返回一张图片
