const { Pool } = require("pg");
const { nanoid } = require("nanoid");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new InvariantError("Like gagal ditambahkan.");
      }

      await this._cacheService.delete(`likes:${albumId}`);
      return result.rows[0].id;
    } catch (error) {
      if (error.code === "23503") {
        throw new NotFoundError("Album not found.");
      } else if (error.code === "23505") {
        throw new InvariantError("Album sudah diLike.");
      } else {
        console.log(error.code);
        console.error(error);
        throw error;
      }
    }
  }

  async getLikesCount(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      return { data: JSON.parse(result), source: "cache" };
    } catch (error) {
      const query = {
        text: "SELECT * FROM user_album_likes WHERE album_id = $1",
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const countResult = result.rows.length;

      await this._cacheService.set(
        `likes:${albumId}`,
        JSON.stringify(countResult),
      );

      return { data: countResult, source: "database" };
    }
  }

  async deleteLike(userId, albumId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Kolaborasi gagal dihapus");
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }
}

module.exports = UserAlbumLikesService;
