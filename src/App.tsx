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
  absPath: string
  processingStarted?: boolean
  peopleIds?: number[]
}>()

export const App = () => {
  return (
    <div class='mx-[5%]'>
      <UploadConfig />
      <ShowVideo />
    </div>
  )
}

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
              onChange={x => {
                setSelectedVidInfoS({ absPath: x })
              }}
            >
              {vidPathsS()?.map((vidPathInfo, i) => (
                <RadioGroupItem class='my-1 truncate' value={vidPathInfo.path}>
                  <RadioGroupItemLabel class='min-w-0 flex'>
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
                      video_path: vidPathInfo.absPath,
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
                        video_path: vidPathInfo.absPath,
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
                  variant='outline'
                  class='mx-1'
                  onClick={() => {
                    const selectedVidinfo = selectedVidInfoS()
                    if (selectedVidinfo)
                      api_track_history_people_id_range({
                        video_path: selectedVidinfo.absPath,
                        person_id: id,
                      }).then(res => {
                        console.log(res)
                      })
                  }}
                >
                  {id}
                </Button>
              )
            })}
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
