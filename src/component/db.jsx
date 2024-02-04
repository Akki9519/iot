
import Dexie from 'dexie';

const db = new Dexie('AudioPlayerDB');

db.version(1).stores({
  playlist: '++id, name, data',
  playerState: 'id, trackIndex, position',
});

export default db;
