const autoBind = require("auto-bind");

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistsService;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    const { playlistId } = request.params;
    const userId = request.auth.credentials.id;

    await this._playlistService.verifyPlaylistOwner(playlistId, userId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage(
      "export:playlists",
      JSON.stringify(message),
    );

    const response = h.response({
      status: "success",
      message: "Permintaan Anda dalam antrean",
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
