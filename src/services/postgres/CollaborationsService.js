const { Pool } = require("pg");
const { nanoid } = require("nanoid");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class CollaborationsService {
  constructor(usersService, cacheService) {
    this._pool = new Pool();
    this._usersService = usersService;
    this._cacheService = cacheService;
  }

  async addCollaboration(playlistId, userId) {
    try {
      const id = `collab-${nanoid(16)}`;
      const query = {
        text: "INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id",
        values: [id, playlistId, userId],
      };

      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError("Kolaborasi gagal ditambahkan");
      }
      await this._cacheService.delete(`playlists:${userId}`);

      return result.rows[0].id;
    } catch (error) {
      if (error.code === "23503") {
        throw new NotFoundError("User not found.");
      }
      throw error;
    }
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Kolaborasi gagal dihapus");
    }

    await this._cacheService.delete(`playlists:${userId}`);
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: "SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Kolaborasi gagal diverifikasi");
    }
  }
}

module.exports = CollaborationsService;
