import React, { useState, useEffect } from 'react';
import db from './db';

const AudioPlayerApp = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState("");
  const [audioRef, setAudioRef] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedState = await db.playerState.get(1);
        if (savedState) {
          setCurrentTrackIndex(savedState.trackIndex);
          audioRef.currentTime = savedState.position;
        }

        const savedPlaylist = await db.playlist.toArray();
        setPlaylist(savedPlaylist);

        if (savedPlaylist.length > 0) {
          audioRef.src = savedPlaylist[currentTrackIndex].data;
          if (savedState && savedState.isPlaying) {
          var playPromise= audioRef.play();
            if (playPromise !== undefined) {
              playPromise.then(_ => {
               
              })
              .catch(error => {
              
              });
            }
            setIsPlaying(true);
          }
        }
      } catch (error) {
        console.error('Error fetching data from IndexedDB:', error);
      }
    };

    fetchData();
  }, [audioRef]);


  useEffect(() => {
    const saveState = async () => {
      try {
        await db.playerState.put({ id: 1, trackIndex: currentTrackIndex, position: audioRef.currentTime, isPlaying });
      } catch (error) {
        console.error('Error saving player state to IndexedDB:', error);
      }
    };

    saveState();
  }, [currentTrackIndex, audioRef.currentTime, isPlaying]);

  
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const existingTrack = playlist.find((track) => track.name === file.name);
  
      if (existingTrack) {
        // File with the same name already exists in the playlist
        console.log('Duplicate file: ', file.name);
        
      } else {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const audioData = e.target.result;
          const newPlaylist = [...playlist, { name: file.name, data: audioData }];
          setPlaylist(newPlaylist);
  
          try {
            await db.playlist.add({ name: file.name, data: audioData });
          } catch (error) {
            console.error('Error adding track to IndexedDB playlist:', error);
          }
  
          if (playlist.length === 0) {
            audioRef.src = newPlaylist[0].data;
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.pause();
    } else {
      // audioRef.play();
      audioRef.play().catch(error => console.error('Error playing audio:', error));
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = async () => {
    const nextTrackIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextTrackIndex);
    audioRef.src = playlist[nextTrackIndex].data;
    audioRef.play();
  };

  const handlePlaylistItemClick = (index) => {
    setCurrentTrackIndex(index);
    audioRef.src = playlist[index].data;
    audioRef.play();
    setIsPlaying(true);
  };



  return (
    <div className=''>
      <h1 className='text-center font-semibold pt-10 text-3xl '>Audio Player App</h1>
      <div className="flex justify-center bg-red-600 p-2 mx-96 rounded-lg mt-5">
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      </div>
      <div>
        <h2 className='font-semibold text-2xl font-serif pl-5 '>Playlist</h2>
        <ul>
          {playlist.map((track, index) => (

            <li className='pl-5 pt-5 cur' key={index}  onClick={() => handlePlaylistItemClick(index)}>{track.id}. {track.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className='font-semibold text-2xl font-serif pl-5 pt-5'>Now Playing</h2>
        <p className='text-blue-700 text-2xl font-mono p-5  '>{playlist[currentTrackIndex]?.name}</p>
        <button className='m-5 px-5 py-1 rounded-lg bg-red-600 text-white font-serif font-semibold' onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
      </div>
      <audio ref={(audio) => setAudioRef(audio)} onEnded={handleEnded} />
    </div>
  );
};

export default AudioPlayerApp;





