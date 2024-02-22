import { createSignal, type Component } from 'solid-js'

import sampleVideo from '/1.mp4'

const App: Component = () => {
  let video: HTMLVideoElement | null = null
  const [filepath, setFilepath] = createSignal(sampleVideo)
  const [timestamp, setTimestamp] = createSignal(0)
  return (
    <>
      <div>file path</div>
      <input
        type='text'
        value={filepath()}
        onChange={e => setFilepath(e.target.value)}
      />
      {/*  */}
      <div />
      {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
      <video
        src={filepath()}
        ref={e => {
          video = e
        }}
        style='max-width:100%;max-height:100%'
        controls
      />
      {/*  */}
      <div />
      <input
        type='number'
        value={timestamp()}
        onChange={e => setTimestamp(parseFloat(e.target.value))}
      />
      <button
        type='button'
        onClick={() => {
          if (video) {
            video.currentTime = timestamp()
          }
        }}
      >
        Jump to video second
      </button>
    </>
  )
}

export default App
