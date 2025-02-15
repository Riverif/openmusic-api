const PlaylistsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "playlists",
  version: "1.0.1",
  register: async (
    server,
    {
      playlistsService,
      playlistSongsService,
      playlistSongActivitiesService,
      songsService,
      validator,
    },
  ) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      playlistSongsService,
      playlistSongActivitiesService,
      songsService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};
