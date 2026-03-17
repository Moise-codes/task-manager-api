import List from "../models/List.js";

// Create List
export const createList = async (req, res) => {
  const list = await List.create({ name: req.body.name, board: req.body.board });
  res.json(list);
};

// Get Lists by Board
export const getLists = async (req, res) => {
  const lists = await List.find({ board: req.params.boardId });
  res.json(lists);
};