import { ErrorBoundary, createSignal } from 'solid-js'

import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'
import {
  VidPath,
  api_start_processing,
  api_vid_track_pid,
  api_vid_track_pid_t,
  api_vid_track_pid_list,
  api_upload_config,
  get_file_url_by_path,
  api_vid_track_pid_list_t,
} from './api'
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from './components/ui/radio-group'
import { sec_to_hms } from './utils'

//
//
//
//
//

const [selectedVidInfoS, setSelectedVidInfoS] = createSignal<{
  vidPath: VidPath
  processingStarted?: boolean
  pids?: Awaited<api_vid_track_pid_list_t>['person_ids']
  selectedPerson?: { pid: number; info?: Awaited<api_vid_track_pid_t> }
}>()

let video: HTMLVideoElement | undefined

export const App = () => {
  return (
    <ErrorBoundary
      fallback={err => (
        <>
          <h1>Error</h1>
          <div class='text-3xl'>{err}</div>
        </>
      )}
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
            <div class='w-full flex gap-x-2'>
              <Button
                class={`flex-1 ${
                  selectedVidInfoS()?.processingStarted ? 'bg-green-800' : ''
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
                        processingStarted: true,
                      })
                    })
                }}
                disabled={
                  !selectedVidInfoS() || selectedVidInfoS()?.processingStarted
                }
              >
                {selectedVidInfoS()?.processingStarted
                  ? 'Processed'
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
                          peopleIds: res.person_ids,
                        })
                      })
                  }}
                  disabled={!selectedVidInfoS()?.processingStarted}
                >
                  Refresh Track Count
                </Button>
              )}
            </div>
            {/*  */}
            {selectedVidInfoS()?.pids?.map(person_id => {
              return (
                <Button
                  variant={
                    selectedVidInfoS()?.selectedPerson?.pid === person_id
                      ? 'default'
                      : 'outline'
                  }
                  class='mx-1'
                  onClick={() => {
                    const selectedVidinfo = selectedVidInfoS()
                    if (selectedVidinfo?.selectedPerson) {
                      selectedVidinfo.selectedPerson = { pid: person_id }
                      setSelectedVidInfoS({ ...selectedVidinfo })

                      api_vid_track_pid({
                        video_path: selectedVidinfo.vidPath.path,
                        person_id,
                      }).then(res => {
                        if (res.frame_start_time_sec === res.frame_end_time_sec)
                          res.frame_end_time_sec += 1
                        if (
                          selectedVidinfo.selectedPerson?.pid === res.person_id
                        ) {
                          selectedVidinfo.selectedPerson.info = res
                          setSelectedVidInfoS({ ...selectedVidinfo })
                        }
                      })
                    }
                  }}
                >
                  {person_id}
                </Button>
              )
            })}
            {(() => {
              const selectedVidInfo = selectedVidInfoS()
              const personIdRange = selectedVidInfo?.selectedPerson?.info
              if (selectedVidInfo && personIdRange)
                return (
                  <Button
                    variant='outline'
                    onClick={() => {
                      if (video) {
                        video.src = `${get_file_url_by_path(
                          selectedVidInfo.vidPath.path
                        )}#t=${personIdRange.frame_start_time_sec},${
                          personIdRange.frame_end_time_sec
                        }`
                        video.play()
                      }
                    }}
                  >
                    Play {sec_to_hms(personIdRange.frame_start_time_sec)} to{' '}
                    {sec_to_hms(personIdRange.frame_end_time_sec)}
                  </Button>
                )
            })()}
            <div class='flex gap-x-1 items-center overflow-y-auto [&>img]:max-h-52'>
              {selectedVidInfoS()?.selectedPerson?.info?.scrshot_paths.map(
                path => (
                  <img src={get_file_url_by_path(path)} alt={path} />
                )
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const ShowVideo = () => {
  const [timestamp, setTimestamp] = createSignal(0)
  const selectedVidInfo = selectedVidInfoS()
  if (!selectedVidInfo) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video</CardTitle>
      </CardHeader>
      <CardContent class='flex flex-col gap-y-3'>
        {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
        <video ref={video} controls preload='metadata' />
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
              if (video) {
                video.currentTime = timestamp()
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
