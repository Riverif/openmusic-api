/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // membuat album baru.
  pgm.sql(
    "INSERT INTO albums(id, name, year) VALUES ('old_albums', 'old_albums', 2024)",
  );

  // mengubah nilai album_id pada note yang album_id-nya bernilai NULL
  pgm.sql("UPDATE songs SET album_id = 'old_albums' WHERE album_id IS NULL");

  // memberikan constraint foreign key pada album_id terhadap kolom id dari tabel albums
  pgm.addConstraint(
    "songs",
    "fk_songs.albumId_albums.id",
    "FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE",
  );
};

exports.down = (pgm) => {
  // menghapus constraint fk_notes.album_id_albums.id pada tabel notes
  pgm.dropConstraint("songs", "fk_songs.albumId_albums.id");

  // mengubah nilai album_id old_notes pada note menjadi NULL
  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_songs'");

  // menghapus album baru.
  pgm.sql("DELETE FROM albums WHERE id = 'old_songs'");
};
