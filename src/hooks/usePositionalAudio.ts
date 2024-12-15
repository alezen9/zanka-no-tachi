import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import { AudioListener, AudioLoader, Camera, PositionalAudio } from "three";

const getExistingAudioListener = (camera: Camera) => {
  const listener = camera.children.find(
    (child) => child.type === "AudioListener",
  ) as AudioListener | undefined;
  return listener;
};

type Params = {
  url: string;
  loop?: boolean;
};

const usePositionalAudio = (params: Params) => {
  const { url, loop = false } = params;
  const camera = useThree(({ camera }) => camera);
  const audio = useRef<PositionalAudio>();
  const listener = useRef<AudioListener>();

  useEffect(() => {
    return () => {
      if (listener.current) camera.remove(listener.current);
      audio.current?.disconnect();
    };
  }, [camera]);

  const init = useCallback(async () => {
    if (audio.current) return;
    let audioListener = getExistingAudioListener(camera);
    if (!audioListener) {
      audioListener = new AudioListener();
      camera.add(audioListener);
    }
    listener.current = audioListener;

    const audioLoader = new AudioLoader();
    const buffer = await audioLoader.loadAsync(url);
    const positionalAudio = new PositionalAudio(audioListener);
    positionalAudio.setBuffer(buffer);
    positionalAudio.setRefDistance(30);
    positionalAudio.setVolume(1);
    positionalAudio.setLoop(loop);

    positionalAudio.position.set(0, 0.15, -1.25);

    audio.current = positionalAudio;
  }, [camera, url, loop]);

  const togglePlay = useCallback(
    async (shouldPlay: boolean) => {
      await init();
      if (shouldPlay && audio.current!.isPlaying) return;
      if (shouldPlay) audio.current!.play();
      else audio.current!.stop();
    },
    [init],
  );

  const toggleMute = useCallback(
    async (shouldMute: boolean) => {
      await init();
      audio.current!.setVolume(shouldMute ? 0 : 1);
    },
    [init],
  );

  return {
    init,
    togglePlay,
    toggleMute,
  };
};

export default usePositionalAudio;
