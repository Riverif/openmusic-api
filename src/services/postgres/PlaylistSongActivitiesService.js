const { Pool } = require("pg");
const { nanoid } = require("nanoid");

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSongActivities(playlistId, songId, userId, action, time) {
    try {
      const id = `playlistSongActivities-${nanoid(16)}`;

      const query = {
        text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
        values: [id, playlistId, songId, userId, action, time],
      };

      const result = await this._pool.query(query);

      return result.rows[0].id;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  async getPlaylistSongActivities(playlistId) {
    try {
      const query = {
        text: `
        SELECT 
          u.username, s.title, psa.action, psa.time
        FROM 
          playlist_song_activities psa
        LEFT JOIN 
          users u ON u.id = psa.user_id
        LEFT JOIN 
          songs s ON s.id = psa.song_id
        WHERE 
          psa.playlist_id = $1
        GROUP BY 
          psa.playlist_id, u.username, s.title, psa.action, psa.time
        ORDER BY
          psa.time`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      return result.rows;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}

module.exports = PlaylistSongActivitiesService;
