import React, { useState, useRef, useEffect } from 'react';
import Mystyles from './index.module.scss';
import PlayButton from '../../../assets/images/play-button.png';
import PauseButton from '../../../assets/images/pause.png';
import VolumeButton from '../../../assets/images/volume-up.png';
import MuteButton from '../../../assets/images/mute-volume.png';
const CustomAudioPlayer = ({ src, audioBlob }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (audioBlob) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(audioBlob);
    }

    const setAudioData = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      } else {
        console.log('Duration is not finite yet');
      }
    };

    const setAudioTime = () => {
      setProgress(audio.currentTime);
    };

    const handleAudioEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleAudioEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, [audioBlob, src]);

  const togglePlayPause = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const onProgressChange = (e) => {
    const time = (e.target.value / 100) * duration;
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const formatTime = (time) => {
    if (isFinite(time)) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    } else {
      return 'Live';
    }
  };

  const handleMute = () => {
    isMuted ? setIsMuted(false) : setIsMuted(true);
  };
  return (
    <div className={`${Mystyles.CustomAudioPlayer}`}>
      <audio ref={audioRef} src={src} preload="metadata" muted={isMuted} />
      <button
        style={{ backgroundColor: '#f8f7f6' }}
        onClick={togglePlayPause}
        className="p-1"
        type="button"
      >
        <img src={isPlaying ? PauseButton : PlayButton} alt="" width="12px" />
      </button>
      <div className={`${Mystyles.time} `}>
        {formatTime(progress)} / {formatTime(duration)}
      </div>
      <input
        type="range"
        style={{ padding: '0' }}
        className={`${Mystyles.ProgressBar}`}
        value={Math.ceil((progress / duration) * 100 || 0)}
        onChange={onProgressChange}
      />
      <button
        style={{ backgroundColor: '#f8f7f6' }}
        className="p-1"
        onClick={handleMute}
        type="button"
      >
        <img src={isMuted ? MuteButton : VolumeButton} alt="" width="15px" />
      </button>
    </div>
  );
};
export default CustomAudioPlayer;
