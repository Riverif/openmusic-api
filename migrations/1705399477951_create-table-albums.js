/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("albums", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    name: {
      type: "text",
      notNull: true,
    },
    year: {
      type: "smallint",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("albums");
};
