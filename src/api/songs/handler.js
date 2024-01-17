class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const songId = await this._service.addSong(request.payload);
    const response = h.response({
      status: "success",
      message: "Song berhasil ditambahkan.",
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const songs = await this._service.getSongs();
    const title = request.query.title;
    const performer = request.query.performer;
    let result = songs;

    if (title && performer) {
      result = songs.filter(
        (song) =>
          song.title.toLowerCase().includes(title.toLowerCase()) &&
          song.performer.toLowerCase().includes(performer.toLowerCase())
      );
      console.log(result);
    } else if (title) {
      result = songs.filter((song) =>
        song.title.toLowerCase().includes(title.toLowerCase())
      );
    } else if (performer) {
      result = songs.filter((song) =>
        song.performer.toLowerCase().includes(performer.toLowerCase())
      );
    }

    return {
      status: "success",
      data: {
        songs: result,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);

    return {
      status: "success",
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    const songId = await this._service.editSongById(id, request.payload);

    return {
      status: "success",
      message: "Song berhasil diperbarui",
    };
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    const songId = await this._service.deleteSongById(id);
    return {
      status: "success",
      message: "Song berhasil dihapus",
    };
  }
}

module.exports = SongsHandler;
