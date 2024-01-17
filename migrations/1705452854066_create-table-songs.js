/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    title: {
      type: "text",
      notNull: true,
    },
    year: {
      type: "smallint",
      notNull: true,
    },
    genre: {
      type: "text",
      notNull: true,
    },
    performer: {
      type: "text",
      notNull: true,
    },
    duration: {
      type: "int",
    },
    album_id: {
      type: "VARCHAR(50)",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("songs");
};
