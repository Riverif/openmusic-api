const mapSongDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});
const mapAlbumDBToModel = ({ id, name, year, cover, songs }) => ({
  id,
  name,
  year,
  coverUrl: cover,
  songs,
});

module.exports = { mapSongDBToModel, mapAlbumDBToModel };
