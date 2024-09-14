import { Level } from "../units";

export const level: Level = {
  inCount: 3,
  outCount: 2,
  title: "NAND Madness",
  description: "random description to be here, too boring to read anyways",
  table: {
    labels: ["A", "B", "Y"],
    rows: [
      [0, 0, 1],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
    ],
  },
};
