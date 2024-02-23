import { createSignal } from 'solid-js'

import sampleVideo from '/1.mp4'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'

export const App = () => {
  return (
    <div class='mx-[5%]'>
      <UploadConfig />
      <ShowVideo />
    </div>
  )
}

const UploadConfig = () => (
  <Card class='mx-auto my-5'>
    <CardHeader>
      <CardTitle>Config File Upload</CardTitle>
      {/* <CardDescription></CardDescription> */}
    </CardHeader>
    <CardContent class='flex gap-x-2'>
      <Input type='file' name='configFile' />
      <Button type='submit'>Upload</Button>
    </CardContent>
  </Card>
)

const ShowVideo = () => {
  let video: HTMLVideoElement | null = null
  const [timestamp, setTimestamp] = createSignal(0)
  return (
    <div class='[&>*]:my-3'>
      {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
      <video
        src={sampleVideo}
        ref={e => {
          video = e
        }}
        controls
      />
      <div class='flex gap-x-2'>
        <Input
          type='number'
          value={timestamp()}
          onChange={e => setTimestamp(parseFloat(e.target.value))}
        />
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
    </div>
  )
}
