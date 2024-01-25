const { Pool } = require("pg");
const { nanoid } = require("nanoid");

const InvariantError = require("../../exceptions/InvariantError");

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSong(playlistId, songId) {
    try {
      const id = `playlistSong-${nanoid(16)}`;

      const query = {
        text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
        values: [id, playlistId, songId],
      };

      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
        throw new InvariantError("Playlists gagal ditambahkan");
      }

      return result.rows[0].id;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Playlist gagal dihapus");
    }
  }
}

module.exports = PlaylistSongsService;
