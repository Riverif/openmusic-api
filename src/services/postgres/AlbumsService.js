const { Pool } = require("pg");
const { nanoid } = require("nanoid");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapAlbumDBToModel } = require("../../utils/index");

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = "album-" + nanoid(16);

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    try {
      const result = await this._cacheService.get(`album:${id}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: `SELECT a.*, 
          array_to_json(array_agg(json_build_object(
            'id', s.id,
            'title', s.title,
            'performer', s.performer))) AS songs
          FROM albums a 
          LEFT JOIN songs s ON s.album_id = a.id
          WHERE a.id = $1
          GROUP BY a.id`,
        values: [id],
      };
      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError("Album tidak ditemukan");
      }
      if (!result.rows[0].songs[0].id) {
        result.rows[0].songs = [];
      }

      const mapResult = result.rows.map(mapAlbumDBToModel)[0];
      await this._cacheService.set(`album:${id}`, JSON.stringify(mapResult));

      return mapResult;
    }
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }

    await this._cacheService.delete(`album:${id}`);
  }

  async editCoverAlbumById(id, coverUrl) {
    const query = {
      text: "UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id",
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }

    await this._cacheService.delete(`album:${id}`);
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }

    await this._cacheService.delete(`album:${id}`);
  }
}

module.exports = AlbumsService;
