const { Pool } = require("pg");
const { nanoid } = require("nanoid");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Playlists gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    try {
      const query = {
        text: `SELECT p.id, p.name, users.username 
        FROM playlists p 
        LEFT JOIN users ON users.id = p.owner
        WHERE p.owner = $1`,
        values: [owner],
      };

      const result = await this._pool.query(query);
      return result.rows;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async getPlaylistByIdWithSong(id) {
    try {
      const query = {
        text: `
        SELECT 
          p.id, p.name, u.username,
          array_to_json(array_agg(json_build_object(
          'id', s.id,
          'title', s.title,
          'performer', s.performer
          ))) AS songs
        FROM 
          playlists p
        LEFT JOIN 
          users u ON u.id = p.owner
        LEFT JOIN 
          playlist_songs ps ON ps.playlist_id = p.id
        LEFT JOIN 
          songs s ON s.id = ps.song_id
        WHERE 
          p.id = $1
        GROUP BY 
          p.id, u.id`,
        values: [id],
      };

      const result = await this._pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlists gagal dihapus. Id tidak ditemukan");
    }
  }

  async verifyPlaylistsOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Catatan tidak ditemukan");
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }
}

module.exports = PlaylistsService;
