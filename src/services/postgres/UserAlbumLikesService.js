const { Pool } = require("pg");
const { nanoid } = require("nanoid");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class UserAlbumLikesService {
  constructor() {
    this._pool = new Pool();
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
    const query = {
      text: "SELECT * FROM user_album_likes WHERE album_id = $1",
      values: [albumId],
    };

    const result = await this._pool.query(query);
    return result.rows.length;
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
  }
}

module.exports = UserAlbumLikesService;
