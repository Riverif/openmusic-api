const autoBind = require("auto-bind");

class PlaylistsHandler {
  constructor(
    playlistsService,
    playlistSongsService,
    playlistSongActivitiesService,
    songsService,
    validator,
  ) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { name } = request.payload;
    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);
    return {
      status: "success",
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: "success",
      message: "Catatan berhasil dihapus",
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    const { songId } = request.payload;
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._songsService.getSongById(songId);

    const playlistSongId = await this._playlistSongsService.addPlaylistSong(
      id,
      songId,
    );

    await this._playlistSongActivitiesService.addPlaylistSongActivities(
      id,
      songId,
      credentialId,
      "add",
      formattedDate,
    );

    const response = h.response({
      status: "success",
      message: `Lagu berhasil ditambahkan pada playlist ${id}`,
      data: {
        playlistSongId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const playlist = await this._playlistsService.getPlaylistByIdWithSong(id);

    return {
      status: "success",
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    const { songId } = request.payload;
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._playlistSongsService.deletePlaylistSong(id, songId);

    await this._playlistSongActivitiesService.addPlaylistSongActivities(
      id,
      songId,
      credentialId,
      "delete",
      formattedDate,
    );

    return {
      status: "success",
      message: `Lagu berhasil dihapus pada playlist ${id}`,
    };
  }

  async getPlaylistSongActivitiesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const activities =
      await this._playlistSongActivitiesService.getPlaylistSongActivities(id);

    return {
      status: "success",
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
