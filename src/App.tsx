import { ErrorBoundary, Show, createSignal } from 'solid-js'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  VidPath,
  api_start_processing,
  api_vid_track_pid,
  api_vid_track_pid_list,
  api_upload_config,
  api_vid_track_pid_list_t,
  api_vid_track_pid_t,
  get_file_url_by_path,
  api_vid_track_pid_del,
} from '@/api'
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from '@/components/ui/radio-group'
import { sec_to_hms } from './utils'

export const [selectedVidInfoS, setSelectedVidInfoS] = createSignal<{
  vidPath: VidPath
  isProcessing?: boolean
  pids?: Awaited<api_vid_track_pid_list_t>['person_ids']
  selectedPerson?: { pid: number; info?: Awaited<api_vid_track_pid_t> }
}>()
//
//
//
//
//

export const App = () => {
  return (
    <ErrorBoundary
      fallback={(err, reset) => {
        console.error(err)
        let msg = err
        if (err instanceof Error) msg = `${err.stack}\n${err.cause ?? ''}`
        else if (err.toString) msg = err.toString()
        return (
          <div class='text-center'>
            <h1 class='font-bold text-5xl'>Error</h1>
            <pre class='text-left'>{msg}</pre>
            <Button onClick={reset}>Reset</Button>
          </div>
        )
      }}
    >
      <div class='mx-[5%]'>
        <UploadConfig />
        {selectedVidInfoS() && <ShowVideo />}
      </div>
    </ErrorBoundary>
  )
}

//
//
//
//
//
//

function UploadConfig() {
  const [configFileS, setConfigFileS] = createSignal<File>()
  const [vidPathsS, setVidPathsS] = createSignal<VidPath[]>()

  return (
    <Card class='mx-auto my-5'>
      <CardHeader>
        <CardTitle>Config File Upload</CardTitle>
        {/* <CardDescription></CardDescription> */}
      </CardHeader>
      <CardContent>
        <div class='flex gap-x-2'>
          <Input
            type='file'
            accept='.json'
            name='configFile'
            onChange={e => {
              const files = e.target.files
              files && files.length === 1 && setConfigFileS(files[0])
            }}
          />
          <Button
            type='button'
            onClick={() => {
              const configFile = configFileS()
              configFile &&
                api_upload_config({ configFile }).then(res => {
                  setVidPathsS(res.video_paths)
                })
            }}
            disabled={!configFileS()}
          >
            Upload
          </Button>
        </div>
        {vidPathsS() && (
          <div class='[&>*]:mt-2'>
            <RadioGroup
              class='mt-4'
              onChange={serialized => {
                setSelectedVidInfoS({ vidPath: JSON.parse(serialized) })
              }}
            >
              {vidPathsS()?.map((vidPathInfo, i) => (
                <RadioGroupItem
                  class='truncate'
                  value={JSON.stringify(vidPathInfo)}
                >
                  <RadioGroupItemLabel class='min-w-0 flex leading-loose'>
                    {vidPathInfo.name}
                    <div class='inline-block text-gray-400 whitespace-pre truncate'>
                      {` · ${vidPathInfo.path}`}
                    </div>
                  </RadioGroupItemLabel>
                </RadioGroupItem>
              ))}
            </RadioGroup>
            {/*  */}
            {/*  */}
            {/*  */}
            <div class='w-full flex gap-x-2'>
              <Button
                class={`flex-1 ${
                  selectedVidInfoS()?.isProcessing ? 'bg-green-800' : ''
                }`}
                type='button'
                onClick={() => {
                  const vidPathInfo = selectedVidInfoS()
                  vidPathInfo &&
                    api_start_processing({
                      video_path: vidPathInfo.vidPath.path,
                    }).then(() => {
                      setSelectedVidInfoS({
                        ...vidPathInfo,
                        isProcessing: true,
                      })
                    })
                }}
                disabled={
                  !selectedVidInfoS() || selectedVidInfoS()?.isProcessing
                }
              >
                {selectedVidInfoS()?.isProcessing
                  ? 'Processing'
                  : 'Start Processing'}
              </Button>
              {selectedVidInfoS() && (
                <Button
                  class='flex-1'
                  type='button'
                  onClick={() => {
                    const vidPathInfo = selectedVidInfoS()
                    vidPathInfo &&
                      api_vid_track_pid_list({
                        video_path: vidPathInfo.vidPath.path,
                      }).then(res => {
                        setSelectedVidInfoS({
                          ...vidPathInfo,
                          pids: res.person_ids,
                        })
                      })
                  }}
                  disabled={!selectedVidInfoS()?.isProcessing}
                >
                  Refresh Detail
                </Button>
              )}
            </div>
            {/*  */}
            {/*  */}
            {/*  */}
            {selectedVidInfoS()?.pids?.map(person_id => {
              return (
                <Button
                  variant={
                    selectedVidInfoS()?.selectedPerson?.pid === person_id
                      ? 'default'
                      : 'outline'
                  }
                  class='w-12 mx-1 border-[1px]'
                  onClick={() => {
                    const selectedVidinfo = selectedVidInfoS()
                    if (selectedVidinfo) {
                      if (selectedVidinfo.selectedPerson?.pid !== person_id) {
                        selectedVidinfo.selectedPerson = { pid: person_id }
                        setSelectedVidInfoS({ ...selectedVidinfo })

                        api_vid_track_pid({
                          video_path: selectedVidinfo.vidPath.path,
                          person_id,
                        }).then(res => {
                          if (
                            selectedVidinfo.selectedPerson?.pid ===
                            res.person_id
                          ) {
                            selectedVidinfo.selectedPerson.info = res
                            setSelectedVidInfoS({ ...selectedVidinfo })
                          }
                        })
                      }
                    }
                  }}
                >
                  {person_id}
                </Button>
              )
            })}
            {selectedVidInfoS()?.selectedPerson?.info && <PersonInfo />}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PersonInfo() {
  const selectedVidInfo = selectedVidInfoS()
  const info = selectedVidInfo?.selectedPerson?.info

  if (selectedVidInfo != null && info != null)
    return (
      <div>
        <div class='flex items-center gap-x-2'>
          <div class='font-bold text-xl'>Person </div>
          <div class='font-bold text-3xl'>{info.person_id}</div>
          <div class='flex-grow text-center'>
            {sec_to_hms(info.frame_start_time_sec)} to{' '}
            {sec_to_hms(info.frame_end_time_sec)}
          </div>
          <Button
            onClick={() => {
              const videoEl = document.getElementsByTagName('video')[0]
              if (videoEl) {
                const start = info.frame_start_time_sec
                const end = info.frame_end_time_sec
                videoEl.src = `${get_file_url_by_path(
                  selectedVidInfo.vidPath.path
                )}#t=${start},${start !== end ? end : end + 1}`
                videoEl.play()
              }
            }}
          >
            Play Clip
          </Button>
          <Button
            variant='destructive'
            onClick={() => {
              api_vid_track_pid_del({
                video_path: selectedVidInfo.vidPath.path,
                person_id: info.person_id,
              }).then(() => {
                api_vid_track_pid_list({
                  video_path: selectedVidInfo.vidPath.path,
                }).then(res => {
                  selectedVidInfo.pids = res.person_ids
                  selectedVidInfo.selectedPerson = undefined
                  setSelectedVidInfoS({ ...selectedVidInfo })
                })
              })
            }}
          >
            Delete
          </Button>
        </div>
        <div class='flex gap-x-1 items-center overflow-y-auto [&>img]:max-h-52'>
          {selectedVidInfoS()?.selectedPerson?.info?.scrshot_paths.map(path => (
            <img src={get_file_url_by_path(path)} alt={path} />
          ))}
        </div>
      </div>
    )
}

const ShowVideo = () => {
  const [timestamp, setTimestamp] = createSignal(0)
  let videoEl: HTMLVideoElement | undefined
  const selectedVidInfo = selectedVidInfoS()
  if (!selectedVidInfo) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video</CardTitle>
      </CardHeader>
      <CardContent class='flex flex-col gap-y-3'>
        {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
        <video ref={videoEl} controls preload='metadata' />
        <div class='flex gap-x-2'>
          <label class='flex-grow flex gap-x-2'>
            <div class='flex-shrink-0 flex items-center'>Jump to second:</div>
            <Input
              class='flex-grow'
              type='number'
              value={timestamp()}
              onChange={e => setTimestamp(parseFloat(e.target.value))}
            />
          </label>
          <Button
            type='button'
            onClick={() => {
              if (videoEl) {
                videoEl.currentTime = timestamp()
              }
            }}
          >
            Jump
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
