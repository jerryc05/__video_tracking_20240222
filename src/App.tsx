import { ErrorBoundary, createSignal } from 'solid-js'

// import sampleVideo from '/1.mp4'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'
import {
  VidPath,
  api_start_processing,
  api_track_history_people_id_range,
  api_track_history_people_id_range_t,
  api_track_people_count,
  api_upload_config,
  api_vid_track_screenshots,
  get_file_url_by_path,
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
  peopleIds?: number[]
  selectedPersonId?: number
  scrshots?: string[]
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
  const [personIdRangeS, setPersonIdRange] =
    createSignal<Awaited<api_track_history_people_id_range_t>>()

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
                      api_track_people_count({
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
            {selectedVidInfoS()?.peopleIds?.map(person_id => {
              return (
                <Button
                  variant={
                    selectedVidInfoS()?.selectedPersonId === person_id
                      ? 'default'
                      : 'outline'
                  }
                  class='mx-1'
                  onClick={() => {
                    const selectedVidinfo = selectedVidInfoS()
                    if (selectedVidinfo) {
                      selectedVidinfo.selectedPersonId = person_id
                      setSelectedVidInfoS({ ...selectedVidinfo })

                      api_track_history_people_id_range({
                        video_path: selectedVidinfo.vidPath.path,
                        person_id,
                      }).then(res => {
                        setPersonIdRange(res)
                      })

                      api_vid_track_screenshots({
                        video_path: selectedVidinfo.vidPath.path,
                        person_id,
                      }).then(res => {
                        selectedVidinfo.scrshots = res.paths
                        setSelectedVidInfoS({ ...selectedVidinfo })
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
              const personIdRange = personIdRangeS()
              if (selectedVidInfo && personIdRange)
                return (
                  <>
                    <div>
                      {sec_to_hms(personIdRange.frame_start_time_sec)} to
                      {sec_to_hms(personIdRange.frame_end_time_sec)}
                    </div>
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
                      Play
                    </Button>
                  </>
                )
            })()}
            <div class='flex gap-x-1 items-center overflow-y-auto [&>img]:max-h-52'>
              {selectedVidInfoS()?.scrshots?.map(path => (
                <img src={get_file_url_by_path(path)} alt={path} />
              ))}
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
        {/* <label class='flex gap-x-3'>
          <div class='flex-shrink-0 flex items-center whitespace-pre'>
            Locate file{' '}
            <b>
              <u>{selectedVidInfoS()?.vidPath.name}</u>
            </b>{' '}
            to preview
          </div>
          <Input
            type='file'
            accept='video/*'
            onChange={e => {
              const file = e.target.files?.[0]
              if (file && video) {
                video.src = URL.createObjectURL(file)
              }
            }}
          />
        </label> */}
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
