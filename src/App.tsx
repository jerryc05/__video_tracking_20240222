import { createSignal, type Component } from 'solid-js'

import sampleVideo from '@/assets/1.mp4'

const App: Component = () => {
  const [filepath, setFilepath] = createSignal('')
  return (
    <>
      <div>file path</div>
      <input
        type='text'
        value={filepath()}
        onChange={e => setFilepath(e.target.value)}
      />
      {/*  */}
      {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
      <video
        style='max-width:100%;max-height:100%'
        src={sampleVideo}
        controls
      />
    </>
  )
}

export default App
