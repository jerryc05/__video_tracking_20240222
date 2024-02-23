import { createSignal } from 'solid-js'

// import sampleVideo from '/1.mp4'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'
import {
  VidPath,
  api_start_processing,
  api_track_history_people_id_range,
  api_track_people_count,
  api_upload_config,
} from './api'
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from './components/ui/radio-group'

const [selectedVidInfoS, setSelectedVidInfoS] = createSignal<{
  vidPath: VidPath
  processingStarted?: boolean
  peopleIds?: number[]
  selectedPersonId?: number
}>()

export const App = () => {
  return (
    <div class='mx-[5%]'>
      <UploadConfig />
      {selectedVidInfoS() && <ShowVideo />}
    </div>
  )
}

function UploadConfig() {
  const [configFileS, setConfigFileS] = createSignal<File>()
  const [vidPathsS, setVidPathsS] = createSignal<VidPath[]>()
  const [personIdRage, setPersonIdRage] = createSignal<string>()

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
            {selectedVidInfoS()?.peopleIds?.map(id => {
              return (
                <Button
                  variant={
                    selectedVidInfoS()?.selectedPersonId === id
                      ? 'default'
                      : 'outline'
                  }
                  class='mx-1'
                  onClick={() => {
                    const selectedVidinfo = selectedVidInfoS()
                    if (selectedVidinfo) {
                      setSelectedVidInfoS({
                        ...selectedVidinfo,
                        selectedPersonId: id,
                      })
                      api_track_history_people_id_range({
                        video_path: selectedVidinfo.vidPath.path,
                        person_id: id,
                      }).then(res => {
                        setPersonIdRage(JSON.stringify(res, null, 1))
                      })
                    }
                  }}
                >
                  {id}
                </Button>
              )
            })}
            <pre>{personIdRage()}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const ShowVideo = () => {
  let video: HTMLVideoElement | null = null
  const [timestamp, setTimestamp] = createSignal(0)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video</CardTitle>
      </CardHeader>
      <CardContent class='flex flex-col gap-y-3'>
        <label class='flex gap-x-3'>
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
        </label>
        {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
        <video
          // src={sampleVideo}
          ref={e => {
            video = e
          }}
          controls
        />
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
