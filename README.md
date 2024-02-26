1）原来的 track people count 现在是 `GET /vid/{vid_path}/track/person-ids`，返回类型

```ts
{
  person_ids: number[]
}
```

2）原来的 track history people id range 和 screenshot 合并成 `GET /vid/{vid_path}/track/person-ids/{person_id}`，返回类型

```ts
{
  person_id: number
  frame_start_time_sec: number
  frame_end_time_sec: number
  scrshot_paths: string[]
}
```

3）新的 `DELETE /vid/{vid_path}/track/person-ids/{person_id}` 成功返回 HTTP 2xx

4）新的 `PUT /vid/{vid_path}/track/person-ids/{person_id}` 有个 json body

```ts
{
  merge_with: number[]
}
```

意思是 `merge_with` 里的所有 id 全部合并到 url 里的那个 `person_id`，然后 `merge_with` 里的所有 id 应该消失
