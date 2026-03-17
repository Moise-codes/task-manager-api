import Board from "../models/Board.js";

// Create Board
export const createBoard = async (req, res) => {
  const board = await Board.create({ name: req.body.name, user: req.user.id });
  res.json(board);
};

// Get Boards
export const getBoards = async (req, res) => {
  const boards = await Board.find({ user: req.user.id });
  res.json(boards);
};