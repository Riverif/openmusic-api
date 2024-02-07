const autoBind = require("auto-bind");

class UserAlbumLikesHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async postAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    const userAlbumLikeId = await this._service.addLike(credentialId, albumId);

    const response = h.response({
      status: "success",
      message: "Like berhasil ditambahkan",
      data: {
        userAlbumLikeId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const albumLikesCount = await this._service.getLikesCount(albumId);

    return {
      status: "success",
      data: {
        likes: albumLikesCount,
      },
    };
  }

  async deleteAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.deleteLike(credentialId, albumId);

    return {
      status: "success",
      message: "Like berhasil dihapus",
    };
  }
}

module.exports = UserAlbumLikesHandler;
