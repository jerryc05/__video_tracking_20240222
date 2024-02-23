import { createSignal } from 'solid-js'

import sampleVideo from '/1.mp4'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'
import { VidPath, api_upload_config } from './api'
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from './components/ui/radio-group'

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
  const [selectedVidPathS, setSelectedVidPathS] = createSignal<string>()

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
                  console.log(res)
                  setVidPathsS(res.video_paths)
                })
            }}
            disabled={!configFileS()}
          >
            Upload
          </Button>
        </div>
        {vidPathsS() && (
          <RadioGroup
            class='mt-2'
            onChange={x => {
              setSelectedVidPathS(x)
            }}
          >
            {(vidPathsS() || []).map((vidPath, i) => (
              <RadioGroupItem class='my-1' value={vidPath.path}>
                <RadioGroupItemLabel>{vidPath.name}</RadioGroupItemLabel>
              </RadioGroupItem>
            ))}
          </RadioGroup>
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
          src={sampleVideo}
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
