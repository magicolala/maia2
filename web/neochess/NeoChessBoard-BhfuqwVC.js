import { Chess, SQUARES } from "chess.js";
const THEMES = {
  classic: {
    light: "#2a3547",
    dark: "#57728e",
    boardBorder: "#0F172A0F",
    whitePiece: "#e2d4cb",
    blackPiece: "#171616",
    pieceShadow: "rgba(0,0,0,0.15)",
    pieceStroke: "rgba(15,23,42,0.6)",
    pieceHighlight: "rgba(255,255,255,0.55)",
    moveFrom: "rgba(250,204,21,0.55)",
    moveTo: "rgba(34,197,94,0.45)",
    lastMove: "rgba(59,130,246,0.35)",
    premove: "rgba(147,51,234,0.35)",
    dot: "rgba(2,6,23,0.35)",
    arrow: "rgba(34,197,94,0.9)",
    squareNameColor: "#0F172A"
  },
  midnight: {
    light: "#2A2F3A",
    dark: "#1F242E",
    boardBorder: "#00000026",
    whitePiece: "#E6E8EC",
    blackPiece: "#050506",
    pieceShadow: "rgba(255, 255, 255, 0.25)",
    pieceStroke: "rgba(0,0,0,0.65)",
    pieceHighlight: "rgba(255,255,255,0.4)",
    moveFrom: "rgba(250,204,21,0.4)",
    moveTo: "rgba(34,197,94,0.35)",
    lastMove: "rgba(59,130,246,0.3)",
    premove: "rgba(147,51,234,0.30)",
    dot: "rgba(255,255,255,0.35)",
    arrow: "rgba(59,130,246,0.9)",
    squareNameColor: "#E6E8EC"
  }
};
const DEFAULT_THEME_KEY = "classic";
const getDefaultTheme = () => THEMES[DEFAULT_THEME_KEY];
const normalizeTheme = (theme) => {
  const base = getDefaultTheme();
  return {
    ...base,
    ...theme,
    pieceStroke: theme.pieceStroke ?? base.pieceStroke,
    pieceHighlight: theme.pieceHighlight ?? base.pieceHighlight
  };
};
const registerTheme = (name, theme) => {
  const normalized = normalizeTheme(theme);
  THEMES[name] = normalized;
  return normalized;
};
const resolveTheme = (theme) => {
  if (typeof theme === "string") {
    return THEMES[theme] ?? getDefaultTheme();
  }
  return normalizeTheme(theme);
};
class EventBus {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  on(type, fn) {
    if (!this.map.has(type)) this.map.set(type, /* @__PURE__ */ new Set());
    this.map.get(type).add(fn);
    return () => this.off(type, fn);
  }
  off(type, fn) {
    var _a;
    (_a = this.map.get(type)) == null ? void 0 : _a.delete(fn);
  }
  emit(type, payload) {
    var _a;
    (_a = this.map.get(type)) == null ? void 0 : _a.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error(e);
      }
    });
  }
}
const DEFAULT_LABEL_COUNT = 26;
function toFileLabel(index) {
  if (index < 0) {
    throw new RangeError(`File index must be non-negative. Received: ${index}`);
  }
  let label = "";
  let current = index;
  do {
    const remainder = current % 26;
    label = String.fromCharCode(97 + remainder) + label;
    current = Math.floor(current / 26) - 1;
  } while (current >= 0);
  return label;
}
function generateFileLabels(count) {
  const safeCount = Math.max(0, Math.floor(count));
  const labels = [];
  for (let i = 0; i < safeCount; i++) {
    labels.push(toFileLabel(i));
  }
  return labels;
}
function generateRankLabels(count) {
  const safeCount = Math.max(0, Math.floor(count));
  return Array.from({ length: safeCount }, (_, index) => String(index + 1));
}
function sanitizeDimension(value, fallback) {
  const normalizedFallback = Number.isFinite(fallback) ? fallback : 8;
  const candidate = Number.isFinite(value) ? value : normalizedFallback;
  const normalizedCandidate = Number.isFinite(candidate) ? candidate : normalizedFallback;
  const floored = Math.floor(normalizedCandidate);
  return Math.max(1, Number.isFinite(floored) ? floored : Math.floor(normalizedFallback) || 1);
}
function normalizeOrientation(orientation) {
  return orientation === "black" ? "black" : "white";
}
function resolveFileLabels(totalFiles, fileLabels) {
  if (!Number.isFinite(totalFiles) || totalFiles < 1) {
    throw new RangeError(`totalFiles must be a positive integer. Received: ${totalFiles}`);
  }
  const count = Math.max(1, Math.floor(totalFiles));
  if (fileLabels && fileLabels.length >= count) {
    return fileLabels.slice(0, count);
  }
  return generateFileLabels(count);
}
function resolveRankLabels(totalRanks, rankLabels) {
  if (!Number.isFinite(totalRanks) || totalRanks < 1) {
    throw new RangeError(`totalRanks must be a positive integer. Received: ${totalRanks}`);
  }
  const count = Math.max(1, Math.floor(totalRanks));
  if (rankLabels && rankLabels.length >= count) {
    return rankLabels.slice(0, count);
  }
  return generateRankLabels(count);
}
function resolveBoardGeometry({
  files,
  ranks,
  fileLabels,
  rankLabels,
  defaultFiles = 8,
  defaultRanks = 8
}) {
  const sanitizedFiles = sanitizeDimension(files, defaultFiles);
  const sanitizedRanks = sanitizeDimension(ranks, defaultRanks);
  const resolvedFileLabels = fileLabels && fileLabels.length >= sanitizedFiles ? fileLabels.slice(0, sanitizedFiles) : generateFileLabels(sanitizedFiles);
  const resolvedRankLabels = rankLabels && rankLabels.length >= sanitizedRanks ? rankLabels.slice(0, sanitizedRanks) : generateRankLabels(sanitizedRanks);
  return {
    files: sanitizedFiles,
    ranks: sanitizedRanks,
    fileLabels: resolvedFileLabels,
    rankLabels: resolvedRankLabels
  };
}
const FILES = Object.freeze(generateFileLabels(DEFAULT_LABEL_COUNT));
const RANKS = Object.freeze(generateRankLabels(DEFAULT_LABEL_COUNT));
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
function isWhitePiece(piece) {
  return piece === piece.toUpperCase();
}
function sq(file, rank, files = FILES, ranks = RANKS) {
  const fileLabel = files[file];
  const rankLabel = ranks[rank];
  if (typeof fileLabel === "undefined" || typeof rankLabel === "undefined") {
    throw new RangeError(`Invalid square indices f=${file} r=${rank}`);
  }
  return `${fileLabel}${rankLabel}`;
}
function sqToFR(square, files = FILES, ranks = RANKS) {
  var _a;
  const normalized = square.toString().trim();
  const fileMatch = normalized.match(/^[a-zA-Z]+/);
  const rankPart = normalized.slice(((_a = fileMatch == null ? void 0 : fileMatch[0]) == null ? void 0 : _a.length) ?? 0);
  const filePart = ((fileMatch == null ? void 0 : fileMatch[0]) ?? "").toLowerCase();
  const f = files.findIndex((label) => label.toLowerCase() === filePart);
  const r = ranks.findIndex((label) => label === rankPart);
  if (f === -1 || r === -1) {
    throw new RangeError(`Invalid square notation: ${square}`);
  }
  return { f, r };
}
function getRelativeCoords(config, squares) {
  const boardWidth = Number(config.boardWidth);
  const boardHeight = Number(config.boardHeight);
  if (!Number.isFinite(boardWidth) || boardWidth <= 0) {
    throw new RangeError(`boardWidth must be a positive number. Received: ${config.boardWidth}`);
  }
  if (!Number.isFinite(boardHeight) || boardHeight <= 0) {
    throw new RangeError(`boardHeight must be a positive number. Received: ${config.boardHeight}`);
  }
  const files = sanitizeDimension(config.files, config.files);
  const ranks = sanitizeDimension(config.ranks, config.ranks);
  const orientation = normalizeOrientation(config.orientation);
  const resolvedFileLabels = resolveFileLabels(files, config.fileLabels);
  const resolvedRankLabels = resolveRankLabels(ranks, config.rankLabels);
  const squareWidth = boardWidth / files;
  const squareHeight = boardHeight / ranks;
  const maxFile = files - 1;
  const maxRank = ranks - 1;
  const targetSquares = Array.isArray(squares) ? squares : [squares];
  const results = targetSquares.map((targetSquare) => {
    const { f, r } = sqToFR(targetSquare, resolvedFileLabels, resolvedRankLabels);
    const fileIndex = orientation === "white" ? f : maxFile - f;
    const rankIndex = orientation === "white" ? maxRank - r : r;
    const x = fileIndex * squareWidth;
    const y = rankIndex * squareHeight;
    return {
      square: targetSquare,
      topLeft: { x, y },
      center: { x: x + squareWidth / 2, y: y + squareHeight / 2 },
      squareWidth,
      squareHeight
    };
  });
  return Array.isArray(squares) ? results : results[0];
}
function parseFEN(fen, dimensions = {}) {
  const parts = fen.split(" ");
  const files = Math.max(1, Math.floor(dimensions.files ?? 8));
  const ranks = Math.max(1, Math.floor(dimensions.ranks ?? 8));
  const board = Array.from({ length: ranks }, () => Array(files).fill(null));
  const rows = parts[0].split("/");
  const rowCount = Math.min(rows.length, ranks);
  for (let r = 0; r < rowCount; r++) {
    const row = rows[r];
    let f = 0;
    for (let i = 0; i < row.length && f < files; i++) {
      const char = row[i];
      if (/\d/.test(char)) {
        let digits = char;
        while (i + 1 < row.length && /\d/.test(row[i + 1])) {
          digits += row[i + 1];
          i++;
        }
        f += parseInt(digits, 10);
      } else {
        const targetRank = ranks - 1 - r;
        if (f < files) {
          board[targetRank][f] = char;
        }
        f++;
      }
    }
  }
  return {
    board,
    turn: parts[1] || "w",
    castling: parts[2] || "KQkq",
    ep: parts[3] === "-" ? null : parts[3],
    halfmove: parseInt(parts[4] || "0"),
    fullmove: parseInt(parts[5] || "1")
  };
}
function fenStringToPositionObject(fen, options = {}) {
  const { files, ranks, fileLabels, rankLabels } = options;
  const parsed = parseFEN(fen, { files, ranks });
  const board = parsed.board;
  const totalRanks = board.length;
  const totalFiles = totalRanks > 0 ? board[0].length : Math.max(1, Math.floor(files ?? 8));
  const resolvedFileLabels = resolveFileLabels(totalFiles, fileLabels);
  const resolvedRankLabels = resolveRankLabels(totalRanks, rankLabels);
  const position = {};
  for (let r = 0; r < totalRanks; r++) {
    const row = board[r];
    for (let f = 0; f < totalFiles; f++) {
      const piece = row[f];
      if (!piece) {
        continue;
      }
      const square = sq(f, r, resolvedFileLabels, resolvedRankLabels);
      position[square] = { pieceType: piece };
    }
  }
  return position;
}
function clonePosition(position) {
  return Object.entries(position).reduce((acc, [square, piece]) => {
    if (piece) {
      acc[square] = { pieceType: piece.pieceType };
    }
    return acc;
  }, {});
}
function getPositionUpdates(previous, next, options = {}) {
  const {
    previousOrientation = "white",
    nextOrientation = previousOrientation,
    ...fenOptions
  } = options;
  const resolvePosition = (value) => typeof value === "string" ? fenStringToPositionObject(value, fenOptions) : clonePosition(value);
  const previousPosition = resolvePosition(previous);
  const nextPosition = resolvePosition(next);
  const removedSet = /* @__PURE__ */ new Set();
  const added = {};
  const orientationChanged = previousOrientation !== nextOrientation;
  if (orientationChanged) {
    for (const square of Object.keys(previousPosition)) {
      removedSet.add(square);
    }
    for (const [square, piece] of Object.entries(nextPosition)) {
      if (piece) {
        added[square] = { pieceType: piece.pieceType };
      }
    }
  } else {
    const squares = /* @__PURE__ */ new Set([
      ...Object.keys(previousPosition),
      ...Object.keys(nextPosition)
    ]);
    for (const square of squares) {
      const previousPiece = previousPosition[square];
      const nextPiece = nextPosition[square];
      if (!nextPiece && previousPiece) {
        removedSet.add(square);
        continue;
      }
      if (nextPiece) {
        if (!previousPiece || previousPiece.pieceType !== nextPiece.pieceType) {
          if (previousPiece) {
            removedSet.add(square);
          }
          added[square] = { pieceType: nextPiece.pieceType };
        }
      }
    }
  }
  const removed = Array.from(removedSet);
  removed.sort((a, b) => a.localeCompare(b));
  return { added, removed };
}
function rowIndexToChessRow({
  rowIndex,
  totalRanks,
  orientation,
  rankLabels
}) {
  const count = Math.max(1, Math.floor(totalRanks));
  if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= count) {
    throw new RangeError(`rowIndex must be between 0 and ${count - 1}. Received: ${rowIndex}`);
  }
  const normalizedOrientation = normalizeOrientation(orientation);
  const labels = resolveRankLabels(count, rankLabels);
  const rankIndex = normalizedOrientation === "white" ? count - 1 - rowIndex : rowIndex;
  const rankLabel = labels[rankIndex];
  if (typeof rankLabel === "undefined") {
    throw new RangeError(`Rank label not found for index ${rankIndex}`);
  }
  return {
    rowIndex,
    rankIndex,
    rankLabel
  };
}
function columnIndexToChessColumn({
  columnIndex,
  totalFiles,
  orientation,
  fileLabels
}) {
  const count = Math.max(1, Math.floor(totalFiles));
  if (!Number.isInteger(columnIndex) || columnIndex < 0 || columnIndex >= count) {
    throw new RangeError(
      `columnIndex must be between 0 and ${count - 1}. Received: ${columnIndex}`
    );
  }
  const normalizedOrientation = normalizeOrientation(orientation);
  const labels = resolveFileLabels(count, fileLabels);
  const fileIndex = normalizedOrientation === "white" ? columnIndex : count - 1 - columnIndex;
  const fileLabel = labels[fileIndex];
  if (typeof fileLabel === "undefined") {
    throw new RangeError(`File label not found for index ${fileIndex}`);
  }
  return {
    columnIndex,
    fileIndex,
    fileLabel
  };
}
function chessColumnToColumnIndex({
  column,
  totalFiles,
  orientation,
  fileLabels
}) {
  if (typeof column !== "string") {
    throw new TypeError("column must be a string");
  }
  const count = Math.max(1, Math.floor(totalFiles));
  const labels = resolveFileLabels(count, fileLabels);
  const normalizedOrientation = normalizeOrientation(orientation);
  const normalizedColumn = column.trim().toLowerCase();
  if (!normalizedColumn) {
    throw new RangeError("column must be a non-empty string");
  }
  const fileIndex = labels.findIndex((label) => label.toLowerCase() === normalizedColumn);
  if (fileIndex === -1) {
    throw new RangeError(`Unknown column label: ${column}`);
  }
  const columnIndex = normalizedOrientation === "white" ? fileIndex : count - 1 - fileIndex;
  return {
    columnIndex,
    fileIndex,
    fileLabel: labels[fileIndex]
  };
}
function chessRowToRowIndex({
  row,
  totalRanks,
  orientation,
  rankLabels
}) {
  const count = Math.max(1, Math.floor(totalRanks));
  const labels = resolveRankLabels(count, rankLabels);
  const normalizedOrientation = normalizeOrientation(orientation);
  const normalizedRow = String(row).trim();
  if (!normalizedRow) {
    throw new RangeError("row must be a non-empty string or number");
  }
  const rankIndex = labels.findIndex((label) => label === normalizedRow);
  if (rankIndex === -1) {
    throw new RangeError(`Unknown row label: ${row}`);
  }
  const rowIndex = normalizedOrientation === "white" ? count - 1 - rankIndex : rankIndex;
  return {
    rowIndex,
    rankIndex,
    rankLabel: labels[rankIndex]
  };
}
function generateBoard({
  files,
  ranks,
  orientation,
  fileLabels,
  rankLabels
}) {
  const {
    files: resolvedFiles,
    ranks: resolvedRanks,
    fileLabels: resolvedFileLabels,
    rankLabels: resolvedRankLabels
  } = resolveBoardGeometry({
    files,
    ranks,
    fileLabels,
    rankLabels,
    defaultFiles: files,
    defaultRanks: ranks
  });
  const normalizedOrientation = normalizeOrientation(orientation);
  return Array.from({ length: resolvedRanks }, (_, rowIndex) => {
    const rowInfo = rowIndexToChessRow({
      rowIndex,
      totalRanks: resolvedRanks,
      orientation: normalizedOrientation,
      rankLabels: resolvedRankLabels
    });
    return Array.from({ length: resolvedFiles }, (_2, columnIndex) => {
      const columnInfo = columnIndexToChessColumn({
        columnIndex,
        totalFiles: resolvedFiles,
        orientation: normalizedOrientation,
        fileLabels: resolvedFileLabels
      });
      const square = `${columnInfo.fileLabel}${rowInfo.rankLabel}`;
      const squareData = {
        square,
        fileLabel: columnInfo.fileLabel,
        rankLabel: rowInfo.rankLabel,
        fileIndex: columnInfo.fileIndex,
        rankIndex: rowInfo.rankIndex,
        columnIndex: columnInfo.columnIndex,
        rowIndex: rowInfo.rowIndex
      };
      return squareData;
    });
  });
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
const CAL_REGEX = /%cal\s+([^%\s]+)/g;
const CSL_REGEX = /%csl\s+([^%\s]+)/g;
const VISUAL_ANNOTATION_REGEX = /%(?:cal|csl)\s+[^%\s]+/;
const SQUARE_REGEX = /^[a-h][1-8]$/;
const EVAL_REGEX = /(?:\[\s*)?%eval\s+([^\]\s}]+)(?:\s*\])?/gi;
const NUMERIC_VALUE_REGEX = /^[-+]?((\d+(?:\.\d+)?)|(?:\.\d+))$/;
const parseAnnotationValue = (value) => {
  const trimmed = value.trim();
  if (NUMERIC_VALUE_REGEX.test(trimmed)) {
    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return trimmed;
};
const COLOR_MAP = {
  R: "#ff0000",
  // Red
  G: "#00ff00",
  // Green
  Y: "#ffff00",
  // Yellow
  B: "#0000ff"
  // Blue
};
class PgnAnnotationParser {
  /**
   * Check if a comment contains visual annotations
   */
  static hasVisualAnnotations(comment) {
    return VISUAL_ANNOTATION_REGEX.test(comment);
  }
  /**
   * Parse visual annotations from a PGN comment
   */
  static parseComment(comment) {
    let processingComment = comment.startsWith("{") && comment.endsWith("}") ? comment.substring(1, comment.length - 1) : comment;
    const arrows = [];
    const highlights = [];
    let evaluation;
    const arrowMatches = [...processingComment.matchAll(CAL_REGEX)];
    for (const match of arrowMatches) {
      const arrowSpecs = match[1].split(",");
      for (const spec of arrowSpecs) {
        const trimmed = spec.trim();
        if (trimmed.length >= 5) {
          const colorCode = trimmed[0];
          const fromSquare = trimmed.slice(1, 3);
          const toSquare = trimmed.slice(3, 5);
          if (PgnAnnotationParser.isValidSquare(fromSquare) && PgnAnnotationParser.isValidSquare(toSquare)) {
            arrows.push({
              from: fromSquare,
              to: toSquare,
              color: PgnAnnotationParser.colorToHex(colorCode)
            });
          }
        }
      }
      processingComment = processingComment.replace(match[0], " ");
    }
    const circleMatches = [...processingComment.matchAll(CSL_REGEX)];
    for (const match of circleMatches) {
      const circleSpecs = match[1].split(",");
      for (const spec of circleSpecs) {
        const trimmed = spec.trim();
        if (trimmed.length >= 3) {
          const colorCode = trimmed[0];
          const square = trimmed.slice(1, 3);
          if (PgnAnnotationParser.isValidSquare(square)) {
            highlights.push({
              square,
              type: "circle",
              color: PgnAnnotationParser.colorToHex(colorCode)
            });
          }
        }
      }
      processingComment = processingComment.replace(match[0], " ");
    }
    processingComment = processingComment.replace(EVAL_REGEX, (_match, value) => {
      evaluation = parseAnnotationValue(value);
      return " ";
    });
    let textComment = processingComment.replace(/\s+/g, " ").trim();
    return {
      arrows,
      highlights,
      textComment: textComment || "",
      evaluation
    };
  }
  /**
   * Returns drawing objects from parsed annotations
   */
  static toDrawingObjects(parsed) {
    return {
      arrows: parsed.arrows,
      highlights: parsed.highlights
    };
  }
  /**
   * Remove visual annotations from a comment, keeping only text
   */
  static stripAnnotations(comment) {
    return comment.replace(new RegExp(VISUAL_ANNOTATION_REGEX.source, "g"), "").replace(/\s+/g, " ").trim();
  }
  /**
   * Create annotation string from arrows and circles
   */
  static fromDrawingObjects(arrows, highlights) {
    const parts = [];
    if (arrows.length > 0) {
      const arrowSpecs = arrows.map((arrow) => `${PgnAnnotationParser.hexToColor(arrow.color)}${arrow.from}${arrow.to}`).join(",");
      parts.push(`%cal ${arrowSpecs}`);
    }
    if (highlights.length > 0) {
      const circleSpecs = highlights.map(
        (circle) => `${PgnAnnotationParser.hexToColor(circle.color ?? COLOR_MAP["R"])}${circle.square}`
      ).join(",");
      parts.push(`%csl ${circleSpecs}`);
    }
    return parts.join(" ");
  }
  /**
   * Convert color code to hex color
   */
  static colorToHex(colorCode) {
    return COLOR_MAP[colorCode] || COLOR_MAP["R"];
  }
  /**
   * Convert hex color to color code
   */
  static hexToColor(hex) {
    for (const [code, color] of Object.entries(COLOR_MAP)) {
      if (color === hex) {
        return code;
      }
    }
    return "R";
  }
  /**
   * Check if a string is a valid chess square notation
   */
  static isValidSquare(square) {
    return SQUARE_REGEX.test(square);
  }
}
class PgnNotation {
  static isVerboseHistory(history) {
    return history.length > 0 && typeof history[0] !== "string";
  }
  constructor(rulesAdapter) {
    this.rulesAdapter = rulesAdapter;
    this.metadata = {
      Event: "Casual Game",
      Site: "Neo Chess Board",
      Date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0].replace(/-/g, "."),
      Round: "1",
      White: "Player 1",
      Black: "Player 2",
      Result: "*"
    };
    this.moves = [];
    this.result = "*";
  }
  /**
   * Set the game metadata (headers)
   */
  setMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
    if (!this.metadata.Event) this.metadata.Event = "Casual Game";
    if (!this.metadata.Site) this.metadata.Site = "Neo Chess Board";
    if (!this.metadata.Date)
      this.metadata.Date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0].replace(/-/g, ".");
    if (!this.metadata.Round) this.metadata.Round = "1";
    if (!this.metadata.White) this.metadata.White = "Player 1";
    if (!this.metadata.Black) this.metadata.Black = "Player 2";
    if (!this.metadata.Result) this.metadata.Result = this.result;
  }
  getMetadata() {
    return { ...this.metadata };
  }
  /**
   * Add a move to the game
   */
  addMove(moveNumber, whiteMove, blackMove, whiteComment, blackComment) {
    const existingMoveIndex = this.moves.findIndex((move) => move.moveNumber === moveNumber);
    if (existingMoveIndex >= 0) {
      const move = this.moves[existingMoveIndex];
      if (whiteMove) move.white = whiteMove;
      if (blackMove) move.black = blackMove;
      if (whiteComment) move.whiteComment = whiteComment;
      if (blackComment) move.blackComment = blackComment;
      if (!move.whiteAnnotations)
        move.whiteAnnotations = { arrows: [], circles: [], textComment: "" };
      if (!move.blackAnnotations)
        move.blackAnnotations = { arrows: [], circles: [], textComment: "" };
    } else {
      this.moves.push({
        moveNumber,
        white: whiteMove,
        black: blackMove,
        whiteComment,
        blackComment,
        whiteAnnotations: { arrows: [], circles: [], textComment: "" },
        blackAnnotations: { arrows: [], circles: [], textComment: "" }
      });
    }
  }
  /**
   * Set the game result
   */
  setResult(result) {
    this.result = result;
    this.metadata.Result = result;
  }
  /**
   * Import moves from a chess.js game
   */
  importFromChessJs(chess) {
    var _a;
    try {
      if (this.rulesAdapter && typeof this.rulesAdapter.getPGN === "function") {
        const pgnString = this.rulesAdapter.getPGN();
        this.parsePgnMoves(pgnString);
      } else if (typeof chess.pgn === "function") {
        const pgnString = chess.pgn();
        this.parsePgnMoves(pgnString);
      } else {
        const detailedHistory = chess.history({ verbose: true });
        this.moves = [];
        if (PgnNotation.isVerboseHistory(detailedHistory)) {
          for (let i = 0; i < detailedHistory.length; i++) {
            const move = detailedHistory[i];
            const moveNumber = Math.floor(i / 2) + 1;
            const isWhite = i % 2 === 0;
            if (isWhite) {
              this.addMove(moveNumber, move.san);
            } else {
              const existingMove = this.moves.find((m) => m.moveNumber === moveNumber);
              if (existingMove) {
                existingMove.black = move.san;
              } else {
                this.addMove(moveNumber, void 0, move.san);
              }
            }
          }
        } else {
          const historyStrings = detailedHistory;
          for (let i = 0; i < historyStrings.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = historyStrings[i];
            const blackMove = historyStrings[i + 1];
            this.addMove(moveNumber, whiteMove, blackMove);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to import proper PGN notation, using fallback:", error);
      const history = chess.history();
      this.moves = [];
      for (let i = 0; i < history.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = history[i];
        const blackMove = history[i + 1];
        this.addMove(moveNumber, whiteMove, blackMove);
      }
    }
    if (chess.isCheckmate()) {
      const turn = chess.turn();
      this.setResult(turn === "w" ? "0-1" : "1-0");
    } else if (((_a = chess.isDraw) == null ? void 0 : _a.call(chess)) || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
      this.setResult("1/2-1/2");
    } else {
      this.setResult("*");
    }
  }
  /**
   * Parse PGN move text to extract individual moves
   */
  parsePgnMoves(pgnText) {
    this.moves = [];
    let cleanPgn = pgnText.replace(/\{[^}]*\}/g, "").replace(/\([^)]*\)/g, "");
    const resultPattern = /\s*(1-0|0-1|1\/2-1\/2|\*)\s*$/;
    const resultMatch = cleanPgn.match(resultPattern);
    if (resultMatch) {
      this.setResult(resultMatch[1]);
      cleanPgn = cleanPgn.replace(resultPattern, "");
    }
    const movePattern = /(\d+)\.\s*([^\s]+)(?:\s+([^\s]+))?/g;
    let match;
    while ((match = movePattern.exec(cleanPgn)) !== null) {
      const moveNumber = parseInt(match[1]);
      const whiteMove = match[2];
      const blackMove = match[3];
      if (whiteMove && !["1-0", "0-1", "1/2-1/2", "*"].includes(whiteMove)) {
        const filteredBlackMove = blackMove && !["1-0", "0-1", "1/2-1/2", "*"].includes(blackMove) ? blackMove : void 0;
        this.addMove(moveNumber, whiteMove, filteredBlackMove);
      }
    }
  }
  /**
   * Generate the complete PGN string
   */
  toPgn(includeHeaders = true) {
    let pgn = "";
    if (includeHeaders) {
      const requiredHeaders = ["Event", "Site", "Date", "Round", "White", "Black", "Result"];
      for (const header of requiredHeaders) {
        if (this.metadata[header]) {
          pgn += `[${header} "${this.metadata[header]}"]
`;
        }
      }
      for (const [key, value] of Object.entries(this.metadata)) {
        if (!requiredHeaders.includes(key) && value) {
          pgn += `[${key} "${value}"]
`;
        }
      }
      pgn += "\n";
    }
    if (this.moves.length === 0 && !includeHeaders) {
      return this.result;
    }
    let lineLength = 0;
    const maxLineLength = 80;
    for (const move of this.moves) {
      let moveText = `${move.moveNumber}.`;
      if (move.white) {
        moveText += ` ${move.white}`;
        if (move.whiteComment) {
          moveText += ` {${move.whiteComment}}`;
        }
      }
      if (move.black) {
        moveText += ` ${move.black}`;
        if (move.blackComment) {
          moveText += ` {${move.blackComment}}`;
        }
      }
      if (lineLength + moveText.length + 1 > maxLineLength) {
        pgn += "\n";
        lineLength = 0;
      }
      if (lineLength > 0) {
        pgn += " ";
        lineLength++;
      }
      pgn += moveText;
      lineLength += moveText.length;
    }
    if (this.result !== "*") {
      if (lineLength > 0 && this.moves.length > 0) {
        pgn += " ";
      }
      pgn += this.result;
    }
    return pgn.trim();
  }
  /**
   * Clear all moves and reset
   */
  clear() {
    this.moves = [];
    this.result = "*";
    this.metadata.Result = "*";
  }
  /**
   * Get move count
   */
  getMoveCount() {
    return this.moves.length;
  }
  /**
   * Get current result
   */
  getResult() {
    return this.result;
  }
  /**
   * Create a PGN from a simple move list
   */
  static fromMoveList(moves, metadata) {
    const pgn = new PgnNotation();
    pgn.setMetadata(metadata || {});
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];
      pgn.addMove(moveNumber, whiteMove, blackMove);
    }
    return pgn.toPgn();
  }
  /**
   * Download PGN as file (browser only)
   */
  downloadPgn(filename = "game.pgn") {
    if (typeof window !== "undefined" && window.document) {
      const blob = new Blob([this.toPgnWithAnnotations()], { type: "application/x-chess-pgn" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
  /**
   * Add visual annotations to a move
   */
  addMoveAnnotations(moveNumber, isWhite, annotations) {
    const existingMoveIndex = this.moves.findIndex((move) => move.moveNumber === moveNumber);
    if (existingMoveIndex >= 0) {
      const move = this.moves[existingMoveIndex];
      if (isWhite) {
        move.whiteAnnotations = annotations;
        this.updateMoveEvaluation(move, "white", annotations.evaluation);
      } else {
        move.blackAnnotations = annotations;
        this.updateMoveEvaluation(move, "black", annotations.evaluation);
      }
    }
  }
  /**
   * Parse a PGN string with comments containing visual annotations
   */
  loadPgnWithAnnotations(pgnString) {
    const lines = pgnString.split("\n");
    let inMoves = false;
    let movesText = "";
    for (const line of lines) {
      if (line.startsWith("[")) {
        const match = line.match(/\[(\w+)\s+"([^"]*)"\]/);
        if (match) {
          this.metadata[match[1]] = match[2];
        }
      } else if (line.trim() && !line.startsWith("[")) {
        inMoves = true;
        movesText += line + " ";
      }
    }
    if (inMoves) {
      this.parseMovesWithAnnotations(movesText);
    }
  }
  /**
   * Parse moves string with embedded annotations
   */
  parseMovesWithAnnotations(movesText) {
    this.moves = [];
    const movePattern = /(\d+)\.(?!\d)(\.{2})?/g;
    const extractMoveSection = (startIndex) => {
      let index = startIndex;
      const comments = [];
      const length = movesText.length;
      const skipWhitespace = () => {
        while (index < length && /\s/.test(movesText[index])) {
          index++;
        }
      };
      const collectComments = () => {
        while (true) {
          skipWhitespace();
          if (index >= length || movesText[index] !== "{") {
            break;
          }
          const closingIndex = movesText.indexOf("}", index + 1);
          if (closingIndex === -1) {
            const remaining = movesText.slice(index + 1).trim();
            if (remaining) {
              comments.push(remaining);
            }
            index = length;
            break;
          }
          const content = movesText.slice(index + 1, closingIndex).trim();
          if (content) {
            comments.push(content);
          }
          index = closingIndex + 1;
        }
      };
      collectComments();
      skipWhitespace();
      if (index >= length) {
        return { san: void 0, comments, nextIndex: index };
      }
      const rest = movesText.slice(index);
      if (/^(\d+)\.(?!\d)(\.{2})?/.test(rest) || /^(1-0|0-1|1\/2-1\/2|\*)/.test(rest)) {
        return { san: void 0, comments, nextIndex: index };
      }
      const sanMatch = rest.match(/^([^\s{]+)/);
      if (!sanMatch) {
        return { san: void 0, comments, nextIndex: index };
      }
      const san = sanMatch[1];
      index += san.length;
      collectComments();
      return { san, comments, nextIndex: index };
    };
    let match;
    while ((match = movePattern.exec(movesText)) !== null) {
      const moveNumber = parseInt(match[1], 10);
      const startsWithBlack = Boolean(match[2]);
      let currentIndex = movePattern.lastIndex;
      let pgnMove = this.moves.find((move) => move.moveNumber === moveNumber);
      if (!pgnMove) {
        pgnMove = {
          moveNumber,
          whiteAnnotations: { arrows: [], circles: [], textComment: "" },
          blackAnnotations: { arrows: [], circles: [], textComment: "" }
        };
        this.moves.push(pgnMove);
      } else {
        if (!pgnMove.whiteAnnotations) {
          pgnMove.whiteAnnotations = { arrows: [], circles: [], textComment: "" };
        }
        if (!pgnMove.blackAnnotations) {
          pgnMove.blackAnnotations = { arrows: [], circles: [], textComment: "" };
        }
      }
      if (!startsWithBlack) {
        const whiteSection = extractMoveSection(currentIndex);
        currentIndex = whiteSection.nextIndex;
        if (whiteSection.san) {
          pgnMove.white = whiteSection.san;
          if (whiteSection.comments.length > 0) {
            const normalizedComment = this.normalizeCommentParts(whiteSection.comments);
            if (normalizedComment) {
              const parsed = PgnAnnotationParser.parseComment(normalizedComment);
              pgnMove.whiteComment = normalizedComment;
              pgnMove.whiteAnnotations = {
                arrows: parsed.arrows,
                circles: parsed.highlights,
                textComment: parsed.textComment,
                evaluation: parsed.evaluation
              };
              this.updateMoveEvaluation(pgnMove, "white", parsed.evaluation);
            }
          }
        }
      }
      const blackSection = extractMoveSection(currentIndex);
      if (blackSection.san) {
        pgnMove.black = blackSection.san;
        if (blackSection.comments.length > 0) {
          const normalizedComment = this.normalizeCommentParts(blackSection.comments);
          if (normalizedComment) {
            const parsed = PgnAnnotationParser.parseComment(normalizedComment);
            pgnMove.blackComment = normalizedComment;
            pgnMove.blackAnnotations = {
              arrows: parsed.arrows,
              circles: parsed.highlights,
              textComment: parsed.textComment,
              evaluation: parsed.evaluation
            };
            this.updateMoveEvaluation(pgnMove, "black", parsed.evaluation);
          }
        }
      }
    }
  }
  static formatEvaluation(value) {
    return `[%eval ${String(value).trim()}]`;
  }
  updateMoveEvaluation(move, color, value) {
    if (typeof value !== "undefined") {
      move.evaluation = { ...move.evaluation || {}, [color]: value };
      return;
    }
    if (!move.evaluation) {
      return;
    }
    if (color === "white") {
      delete move.evaluation.white;
    } else {
      delete move.evaluation.black;
    }
    if (typeof move.evaluation.white === "undefined" && typeof move.evaluation.black === "undefined") {
      move.evaluation = void 0;
    }
  }
  normalizeCommentParts(parts) {
    const normalizedParts = parts.map((part) => part.trim()).filter((part) => part.length > 0);
    if (normalizedParts.length === 0) {
      return void 0;
    }
    const normalizedContent = normalizedParts.join(" ").replace(/\s+/g, " ").trim();
    if (!normalizedContent) {
      return void 0;
    }
    return `{${normalizedContent}}`;
  }
  /**
   * Generate PGN with visual annotations embedded in comments
   */
  toPgnWithAnnotations() {
    var _a, _b;
    let pgn = "";
    const requiredHeaders = ["Event", "Site", "Date", "Round", "White", "Black", "Result"];
    for (const header of requiredHeaders) {
      if (this.metadata[header]) {
        pgn += `[${header} "${this.metadata[header]}"]
`;
      }
    }
    for (const [key, value] of Object.entries(this.metadata)) {
      if (!requiredHeaders.includes(key) && value) {
        pgn += `[${key} "${value}"]
`;
      }
    }
    pgn += "\n";
    let lineLength = 0;
    const maxLineLength = 80;
    for (const move of this.moves) {
      let moveText = `${move.moveNumber}.`;
      if (move.white) {
        moveText += ` ${move.white}`;
        let fullWhiteComment = "";
        if (move.whiteAnnotations) {
          const annotationParts = [];
          const visualAnnotations = PgnAnnotationParser.fromDrawingObjects(
            move.whiteAnnotations.arrows || [],
            move.whiteAnnotations.circles || []
          );
          if (visualAnnotations) {
            annotationParts.push(visualAnnotations);
          }
          if (typeof move.whiteAnnotations.evaluation !== "undefined") {
            annotationParts.push(PgnNotation.formatEvaluation(move.whiteAnnotations.evaluation));
          }
          const textComment = (_a = move.whiteAnnotations.textComment) == null ? void 0 : _a.trim();
          if (textComment) {
            annotationParts.push(textComment);
          }
          fullWhiteComment = annotationParts.join(" ").trim();
        } else if (move.whiteComment) {
          fullWhiteComment = move.whiteComment;
        }
        if (fullWhiteComment) {
          moveText += ` {${fullWhiteComment}}`;
        }
      }
      if (move.black) {
        moveText += ` ${move.black}`;
        let fullBlackComment = "";
        if (move.blackAnnotations) {
          const annotationParts = [];
          const visualAnnotations = PgnAnnotationParser.fromDrawingObjects(
            move.blackAnnotations.arrows || [],
            move.blackAnnotations.circles || []
          );
          if (visualAnnotations) {
            annotationParts.push(visualAnnotations);
          }
          if (typeof move.blackAnnotations.evaluation !== "undefined") {
            annotationParts.push(PgnNotation.formatEvaluation(move.blackAnnotations.evaluation));
          }
          const textComment = (_b = move.blackAnnotations.textComment) == null ? void 0 : _b.trim();
          if (textComment) {
            annotationParts.push(textComment);
          }
          fullBlackComment = annotationParts.join(" ").trim();
        } else if (move.blackComment) {
          fullBlackComment = move.blackComment;
        }
        if (fullBlackComment) {
          moveText += ` {${fullBlackComment}}`;
        }
      }
      if (lineLength + moveText.length + 1 > maxLineLength) {
        pgn += "\n";
        lineLength = 0;
      }
      if (lineLength > 0) {
        pgn += " ";
        lineLength++;
      }
      pgn += moveText;
      lineLength += moveText.length;
    }
    if (this.result !== "*") {
      if (lineLength > 0) {
        pgn += " ";
      }
      pgn += this.result;
    }
    return pgn.trim();
  }
  /**
   * Get annotations for a specific move
   */
  getMoveAnnotations(moveNumber, isWhite) {
    const move = this.moves.find((m) => m.moveNumber === moveNumber);
    if (!move) return void 0;
    return isWhite ? move.whiteAnnotations : move.blackAnnotations;
  }
  /**
   * Get all moves with their annotations
   */
  getMovesWithAnnotations() {
    return [...this.moves];
  }
}
class ChessJsRules {
  constructor(fen) {
    this.supportsSanMoves = true;
    this.chess = new Chess(fen);
    this.pgnNotation = new PgnNotation();
  }
  normalizePromotion(symbol) {
    return symbol === "q" || symbol === "r" || symbol === "b" || symbol === "n" ? symbol : void 0;
  }
  getFenParts(fen) {
    const fenString = (fen ?? this.chess.fen()).trim();
    const parts = fenString.split(/\s+/);
    if (parts.length < 6) {
      return parts.concat(new Array(6 - parts.length).fill(""));
    }
    return parts;
  }
  getChessInstance() {
    return this.chess;
  }
  /**
   * Get the current position in FEN format
   */
  getFEN() {
    return this.chess.fen();
  }
  /**
   * Set a position from a FEN string
   */
  setFEN(fen) {
    try {
      console.log("Attempting to load FEN:", fen);
      const fenParts = fen.split(" ");
      if (fenParts.length === 4) {
        fen += " - 0 1";
      } else if (fenParts.length === 5) {
        fen += " 1";
      }
      this.chess.load(fen);
    } catch (error) {
      console.error("Invalid FEN:", fen, error);
      throw new Error(`Invalid FEN: ${fen}`);
    }
  }
  move(moveData) {
    try {
      const chessMove = typeof moveData === "string" ? this.chess.move(moveData) : this.chess.move({
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion
      });
      return this.normalizeMoveResponse(chessMove);
    } catch (error) {
      if (error instanceof Error) {
        return { ok: false, reason: error.message };
      }
      return { ok: false, reason: "Invalid move" };
    }
  }
  normalizeMoveResponse(move) {
    if (!move) {
      return { ok: false, reason: "Invalid move" };
    }
    const normalizedMove = {
      ...move,
      from: move.from,
      to: move.to,
      san: move.san
    };
    return { ok: true, fen: this.chess.fen(), move: normalizedMove };
  }
  /**
   * Get every legal move from a square
   */
  movesFrom(square) {
    const moves = this.chess.moves({
      square,
      verbose: true
    });
    return moves.map((move) => ({
      from: move.from,
      to: move.to,
      promotion: this.normalizePromotion(move.promotion),
      piece: move.piece,
      captured: move.captured,
      flags: move.flags
    }));
  }
  /**
   * Get every legal move in the current position
   */
  getAllMoves() {
    const moves = this.chess.moves({ verbose: true });
    return moves.map((move) => ({
      from: move.from,
      to: move.to,
      promotion: this.normalizePromotion(move.promotion),
      piece: move.piece,
      captured: move.captured,
      flags: move.flags
    }));
  }
  /**
   * Check if a move is legal
   */
  isLegalMove(from, to, promotion) {
    try {
      const testChess = new Chess(this.chess.fen());
      const move = testChess.move({
        from,
        to,
        promotion
      });
      return move !== null;
    } catch {
      return false;
    }
  }
  /**
   * Check whether the side to move is in check
   */
  inCheck() {
    return this.chess.inCheck();
  }
  /**
   * Check whether the position is checkmate
   */
  isCheckmate() {
    return this.chess.isCheckmate();
  }
  /**
   * Check whether the position is stalemate
   */
  isStalemate() {
    return this.chess.isStalemate();
  }
  /**
   * Check whether the game is drawn
   */
  isDraw() {
    return this.chess.isDraw();
  }
  /**
   * Check whether the game is drawn by insufficient material
   */
  isInsufficientMaterial() {
    return this.chess.isInsufficientMaterial();
  }
  /**
   * Check whether the current position has occurred three times
   */
  isThreefoldRepetition() {
    return this.chess.isThreefoldRepetition();
  }
  /**
   * Determine whether the game has ended
   */
  isGameOver() {
    return this.chess.isGameOver();
  }
  /**
   * Get the result of the game
   */
  getGameResult() {
    if (this.chess.isCheckmate()) {
      return this.chess.turn() === "w" ? "0-1" : "1-0";
    } else if (this.chess.isStalemate() || this.chess.isDraw()) {
      return "1/2-1/2";
    }
    return "*";
  }
  /**
   * Get the player to move
   */
  turn() {
    return this.chess.turn();
  }
  /**
   * Get the piece on a square
   */
  get(square) {
    const piece = this.chess.get(square);
    return piece || null;
  }
  /**
   * Undo the last move
   */
  undo() {
    const move = this.chess.undo();
    return move !== null;
  }
  /**
   * Get the list of moves played
   */
  history() {
    return this.chess.history();
  }
  /**
   * Get the detailed move history
   */
  getHistory() {
    return this.chess.history({ verbose: true });
  }
  /**
   * Reset the game to the initial position
   */
  reset() {
    this.chess.reset();
  }
  /**
   * Get the squares attacked by the side to move
   *
   * Uses the native chess.js detection to identify every square currently
   * controlled by the active player.
   */
  getAttackedSquares() {
    const attackingColor = this.chess.turn();
    return SQUARES.filter((square) => this.chess.isAttacked(square, attackingColor)).map(
      (square) => square
    );
  }
  /**
   * Check whether a square is attacked
   *
   * @param square Square to inspect (algebraic notation, case insensitive)
   * @param by Optional color to check a specific side
   * @throws {Error} if the square or color value is invalid
   */
  isSquareAttacked(square, by) {
    if (typeof square !== "string") {
      throw new Error(`Invalid square: ${square}`);
    }
    const normalizedSquare = square.toLowerCase();
    if (!SQUARES.includes(normalizedSquare)) {
      throw new Error(`Invalid square: ${square}`);
    }
    let colorToCheck;
    if (by === void 0) {
      colorToCheck = this.chess.turn();
    } else if (by === "w" || by === "b") {
      colorToCheck = by;
    } else {
      throw new Error(`Invalid color: ${by}`);
    }
    return this.chess.isAttacked(normalizedSquare, colorToCheck);
  }
  /**
   * Get the king squares that are in check (for highlighting)
   */
  getCheckSquares() {
    if (!this.chess.inCheck()) return [];
    const kingSquare = this.getKingSquare(this.chess.turn());
    return kingSquare ? [kingSquare] : [];
  }
  /**
   * Locate the king square for a color
   */
  getKingSquare(color) {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
    for (const file of files) {
      for (const rank of ranks) {
        const square = `${file}${rank}`;
        const piece = this.chess.get(square);
        if (piece && piece.type === "k" && piece.color === color) {
          return square;
        }
      }
    }
    return null;
  }
  /**
   * Check if castling is allowed
   */
  canCastle(side, color) {
    const currentColor = color || this.chess.turn();
    const castlingRights = this.chess.getCastlingRights(currentColor);
    if (side === "k") {
      return castlingRights.k;
    } else {
      return castlingRights.q;
    }
  }
  /**
   * Get the current move number
   */
  moveNumber() {
    return this.chess.moveNumber();
  }
  /**
   * Get the halfmove clock since the last capture or pawn move
   */
  halfMoves() {
    const fenParts = this.getFenParts();
    const halfMoveField = fenParts[4] ?? "0";
    const halfMoveCount = Number.parseInt(halfMoveField, 10);
    return Number.isNaN(halfMoveCount) ? 0 : halfMoveCount;
  }
  /**
   * Create a copy of the current state
   */
  clone() {
    return new ChessJsRules(this.chess.fen());
  }
  /**
   * Validate a FEN string
   */
  static isValidFEN(fen) {
    try {
      const chess = new Chess();
      chess.load(fen);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Get information about the last move played
   */
  getLastMove() {
    const history = this.chess.history({ verbose: true });
    return history.length > 0 ? history[history.length - 1] : null;
  }
  /**
   * Generate the FEN string for the current position
   */
  generateFEN() {
    return this.chess.fen();
  }
  /**
   * Set PGN metadata for the current game
   */
  setPgnMetadata(metadata) {
    this.pgnNotation.setMetadata(metadata);
  }
  /**
   * Export the current game as PGN
   */
  toPgn(includeHeaders = true) {
    this.pgnNotation.importFromChessJs(this.chess);
    return this.pgnNotation.toPgn(includeHeaders);
  }
  /**
   * Download the current game as a PGN file (browser only)
   */
  downloadPgn(filename) {
    this.pgnNotation.importFromChessJs(this.chess);
    this.pgnNotation.downloadPgn(filename);
  }
  /**
   * Get the PgnNotation instance for advanced manipulation
   */
  getPgnNotation() {
    return this.pgnNotation;
  }
  /**
   * Load a game from a PGN string
   */
  loadPgn(pgn) {
    try {
      this.chess.loadPgn(pgn);
      this.pgnNotation.importFromChessJs(this.chess);
      return true;
    } catch (_error) {
      return false;
    }
  }
  /**
   * Get the PGN notation for the most recent move
   */
  getLastMoveNotation() {
    const history = this.chess.history();
    return history.length > 0 ? history[history.length - 1] : null;
  }
  /**
   * Retrieve the entire move history in PGN notation
   */
  getPgnMoves() {
    return this.chess.history();
  }
}
class FlatSprites {
  constructor(size, colors) {
    this.size = size;
    this.colors = colors;
    this.sheet = this.build(size);
  }
  getSheet() {
    return this.sheet;
  }
  rr(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }
  build(px) {
    const c = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(px * 6, px * 2) : Object.assign(document.createElement("canvas"), { width: px * 6, height: px * 2 });
    const ctx = c.getContext("2d");
    const order = ["k", "q", "r", "b", "n", "p"];
    order.forEach((t, i) => {
      this.draw(ctx, i * px, 0, px, t, "black");
      this.draw(ctx, i * px, px, px, t, "white");
    });
    return c;
  }
  draw(ctx, x, y, s, type, color) {
    const C = color === "white" ? this.colors.whitePiece : this.colors.blackPiece;
    const S = this.colors.pieceShadow;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = S;
    ctx.beginPath();
    ctx.ellipse(s * 0.5, s * 0.68, s * 0.28, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const base = () => {
      ctx.beginPath();
      ctx.moveTo(s * 0.2, s * 0.7);
      ctx.quadraticCurveTo(s * 0.5, s * 0.6, s * 0.8, s * 0.7);
      ctx.lineTo(s * 0.8, s * 0.8);
      ctx.quadraticCurveTo(s * 0.5, s * 0.85, s * 0.2, s * 0.8);
      ctx.closePath();
      ctx.fill();
    };
    if (type === "p") {
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.38, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.38, s * 0.52);
      ctx.quadraticCurveTo(s * 0.5, s * 0.42, s * 0.62, s * 0.52);
      ctx.quadraticCurveTo(s * 0.64, s * 0.6, s * 0.5, s * 0.62);
      ctx.quadraticCurveTo(s * 0.36, s * 0.6, s * 0.38, s * 0.52);
      ctx.closePath();
      ctx.fill();
      base();
    }
    if (type === "r") {
      ctx.beginPath();
      this.rr(ctx, s * 0.32, s * 0.3, s * 0.36, s * 0.34, s * 0.04);
      ctx.fill();
      ctx.beginPath();
      this.rr(ctx, s * 0.3, s * 0.22, s * 0.12, s * 0.1, s * 0.02);
      ctx.fill();
      ctx.beginPath();
      this.rr(ctx, s * 0.44, s * 0.2, s * 0.12, s * 0.12, s * 0.02);
      ctx.fill();
      ctx.beginPath();
      this.rr(ctx, s * 0.58, s * 0.22, s * 0.12, s * 0.1, s * 0.02);
      ctx.fill();
      base();
    }
    if (type === "n") {
      ctx.beginPath();
      ctx.moveTo(s * 0.64, s * 0.6);
      ctx.quadraticCurveTo(s * 0.7, s * 0.35, s * 0.54, s * 0.28);
      ctx.quadraticCurveTo(s * 0.46, s * 0.24, s * 0.44, s * 0.3);
      ctx.quadraticCurveTo(s * 0.42, s * 0.42, s * 0.34, s * 0.44);
      ctx.quadraticCurveTo(s * 0.3, s * 0.46, s * 0.28, s * 0.5);
      ctx.quadraticCurveTo(s * 0.26, s * 0.6, s * 0.38, s * 0.62);
      ctx.closePath();
      ctx.fill();
      const originalFillStyle = ctx.fillStyle;
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.36, s * 0.02, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = originalFillStyle;
      base();
    }
    if (type === "b") {
      ctx.beginPath();
      ctx.ellipse(s * 0.5, s * 0.42, s * 0.12, s * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      const C2 = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.moveTo(s * 0.5, s * 0.28);
      ctx.lineTo(s * 0.5, s * 0.52);
      ctx.lineWidth = s * 0.04;
      ctx.stroke();
      ctx.globalCompositeOperation = C2;
      base();
    }
    if (type === "q") {
      ctx.beginPath();
      ctx.moveTo(s * 0.3, s * 0.3);
      ctx.lineTo(s * 0.4, s * 0.18);
      ctx.lineTo(s * 0.5, s * 0.3);
      ctx.lineTo(s * 0.6, s * 0.18);
      ctx.lineTo(s * 0.7, s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.5, s * 0.5, s * 0.16, s * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      base();
    }
    if (type === "k") {
      ctx.beginPath();
      this.rr(ctx, s * 0.47, s * 0.16, s * 0.06, s * 0.16, s * 0.02);
      ctx.fill();
      ctx.beginPath();
      this.rr(ctx, s * 0.4, s * 0.22, s * 0.2, s * 0.06, s * 0.02);
      ctx.fill();
      ctx.beginPath();
      this.rr(ctx, s * 0.36, s * 0.34, s * 0.28, s * 0.26, s * 0.08);
      ctx.fill();
      base();
    }
    ctx.restore();
  }
}
const DEFAULT_ARROW_STYLE = {
  color: "rgba(34, 197, 94, 0.6)",
  width: 2,
  opacity: 0.8
};
const ARROW_COLOR_BY_MODIFIER = {
  default: "#ffeb3b",
  shiftKey: "#22c55e",
  ctrlKey: "#ef4444",
  altKey: "#f59e0b"
};
const MODIFIER_PRIORITY = ["shiftKey", "ctrlKey", "altKey"];
const HIGHLIGHT_COLORS = {
  green: "rgba(34, 197, 94, 0.6)",
  red: "rgba(239, 68, 68, 0.6)",
  blue: "rgba(59, 130, 246, 0.6)",
  yellow: "rgba(245, 158, 11, 0.6)",
  orange: "rgba(249, 115, 22, 0.6)",
  purple: "rgba(168, 85, 247, 0.6)"
};
const HIGHLIGHT_SEQUENCE = [
  "green",
  "red",
  "blue",
  "yellow",
  "orange",
  "purple"
];
const HIGHLIGHT_TYPE_BY_MODIFIER = {
  shiftKey: "green",
  ctrlKey: "red",
  altKey: "yellow"
};
const DEFAULT_HIGHLIGHT_OPACITY = 0.3;
const SPECIAL_HIGHLIGHT_OPACITY = {
  selected: 0.5,
  lastMove: 0.6
};
const DEFAULT_CIRCLE_COLOR = "rgba(255, 255, 0, 0.5)";
class DrawingManager {
  constructor(canvas, config = {}) {
    this.state = {
      arrows: [],
      highlights: [],
      premove: void 0,
      promotionPreview: void 0
    };
    this.squareSize = 60;
    this.orientation = "white";
    this.showSquareNames = false;
    this.allowDrawingArrows = true;
    this.clearArrowsOnClick = false;
    this.arrowOptions = {};
    this.suppressArrowsChange = false;
    this.filesCount = 8;
    this.ranksCount = 8;
    this.fileLabels = generateFileLabels(8);
    this.rankLabels = generateRankLabels(8);
    this.currentAction = { type: "none" };
    this.clearAll = this.clearAllDrawings;
    this.canvas = canvas;
    if (config.arrowOptions) {
      this.arrowOptions = { ...config.arrowOptions };
    }
    if (typeof config.allowDrawingArrows !== "undefined") {
      this.allowDrawingArrows = config.allowDrawingArrows;
    }
    if (typeof config.clearArrowsOnClick !== "undefined") {
      this.clearArrowsOnClick = config.clearArrowsOnClick;
    }
    if (config.onArrowsChange) {
      this.arrowsChangeCallback = config.onArrowsChange;
    }
    this.setNotationStyles({
      light: config.lightSquareNotationStyle ?? void 0,
      dark: config.darkSquareNotationStyle ?? void 0,
      alpha: config.alphaNotationStyle ?? void 0,
      numeric: config.numericNotationStyle ?? void 0
    });
    this.updateDimensions({
      files: config.boardFiles ?? this.filesCount,
      ranks: config.boardRanks ?? this.ranksCount,
      fileLabels: config.fileLabels ?? this.fileLabels,
      rankLabels: config.rankLabels ?? this.rankLabels
    });
  }
  setBoardGeometry({ files, ranks, fileLabels, rankLabels }) {
    const geometry = resolveBoardGeometry({
      files,
      ranks,
      fileLabels,
      rankLabels,
      defaultFiles: this.filesCount,
      defaultRanks: this.ranksCount
    });
    this.filesCount = geometry.files;
    this.ranksCount = geometry.ranks;
    this.fileLabels = geometry.fileLabels;
    this.rankLabels = geometry.rankLabels;
  }
  squareFromIndices(file, rank) {
    return sq(file, rank, this.fileLabels, this.rankLabels);
  }
  indicesFromSquare(square) {
    return sqToFR(square, this.fileLabels, this.rankLabels);
  }
  resolveRelativeCoords(square) {
    return getRelativeCoords(
      {
        boardWidth: this.squareSize * this.filesCount,
        boardHeight: this.squareSize * this.ranksCount,
        files: this.filesCount,
        ranks: this.ranksCount,
        orientation: this.orientation,
        fileLabels: this.fileLabels,
        rankLabels: this.rankLabels
      },
      square
    );
  }
  setNotationStyles(styles) {
    if (Object.prototype.hasOwnProperty.call(styles, "light")) {
      this.lightNotationStyle = styles.light ? { ...styles.light } : void 0;
    }
    if (Object.prototype.hasOwnProperty.call(styles, "dark")) {
      this.darkNotationStyle = styles.dark ? { ...styles.dark } : void 0;
    }
    if (Object.prototype.hasOwnProperty.call(styles, "alpha")) {
      this.alphaNotationStyle = styles.alpha ? { ...styles.alpha } : void 0;
    }
    if (Object.prototype.hasOwnProperty.call(styles, "numeric")) {
      this.numericNotationStyle = styles.numeric ? { ...styles.numeric } : void 0;
    }
  }
  updateDimensions(geometry) {
    if (geometry) {
      this.setBoardGeometry(geometry);
    }
    if (!this.filesCount || !this.ranksCount) {
      return;
    }
    const squareWidth = this.canvas.width / this.filesCount;
    const squareHeight = this.canvas.height / this.ranksCount;
    this.squareSize = Math.min(squareWidth, squareHeight);
  }
  setOrientation(orientation) {
    this.orientation = orientation;
  }
  setShowSquareNames(show) {
    this.showSquareNames = show;
  }
  setAllowDrawingArrows(allow) {
    if (this.allowDrawingArrows === allow) {
      return;
    }
    this.allowDrawingArrows = allow;
    if (!allow) {
      this.cancelCurrentAction();
    }
  }
  setClearArrowsOnClick(clear) {
    this.clearArrowsOnClick = clear;
  }
  setArrowOptions(options) {
    this.arrowOptions = options ? { ...options } : {};
  }
  setOnArrowsChange(callback) {
    this.arrowsChangeCallback = callback;
  }
  setArrows(arrows) {
    this.withSuppressedArrowsChange(() => {
      this.state.arrows = arrows.map((arrow) => this.normalizeArrow(arrow));
    });
  }
  withSuppressedArrowsChange(callback) {
    const previousState = this.suppressArrowsChange;
    this.suppressArrowsChange = true;
    try {
      callback();
    } finally {
      this.suppressArrowsChange = previousState;
    }
  }
  notifyArrowsChange() {
    if (this.suppressArrowsChange) {
      return;
    }
    if (this.arrowsChangeCallback) {
      this.arrowsChangeCallback(this.getArrows());
    }
  }
  // Arrow management
  addArrow(fromOrArrow, to, color, width, opacity) {
    const arrow = typeof fromOrArrow === "object" ? this.normalizeArrow(fromOrArrow) : this.normalizeArrow({
      from: fromOrArrow,
      to,
      color,
      width,
      opacity
    });
    const existingIndex = this.findArrowIndex(arrow.from, arrow.to);
    if (existingIndex >= 0) {
      this.state.arrows[existingIndex] = {
        ...this.state.arrows[existingIndex],
        ...arrow
      };
      this.notifyArrowsChange();
      return;
    }
    this.state.arrows.push(arrow);
    this.notifyArrowsChange();
  }
  normalizeArrow(arrow) {
    const color = arrow.color ?? this.arrowOptions.color ?? DEFAULT_ARROW_STYLE.color;
    const width = typeof arrow.width === "number" ? arrow.width : typeof this.arrowOptions.width === "number" ? this.arrowOptions.width : DEFAULT_ARROW_STYLE.width;
    const opacity = typeof arrow.opacity === "number" ? arrow.opacity : typeof this.arrowOptions.opacity === "number" ? this.arrowOptions.opacity : DEFAULT_ARROW_STYLE.opacity;
    const knightMove = arrow.knightMove ?? this.isKnightMove(arrow.from, arrow.to);
    return {
      from: arrow.from,
      to: arrow.to,
      color,
      width,
      opacity,
      knightMove
    };
  }
  findArrowIndex(from, to) {
    return this.state.arrows.findIndex(
      (candidate) => candidate.from === from && candidate.to === to
    );
  }
  removeArrow(from, to) {
    const index = this.findArrowIndex(from, to);
    if (index >= 0) {
      this.state.arrows.splice(index, 1);
      this.notifyArrowsChange();
    }
  }
  clearArrows() {
    if (this.state.arrows.length === 0) {
      return;
    }
    this.state.arrows = [];
    this.notifyArrowsChange();
  }
  getArrows() {
    return this.state.arrows.map((arrow) => ({ ...arrow }));
  }
  // Highlight management
  addHighlight(square, type = "green", opacity) {
    const calculatedOpacity = opacity ?? this.getDefaultHighlightOpacity(type);
    const existingIndex = this.findHighlightIndex(square);
    if (existingIndex >= 0) {
      this.state.highlights[existingIndex] = {
        ...this.state.highlights[existingIndex],
        type,
        opacity: calculatedOpacity
      };
      return;
    }
    this.state.highlights.push({
      square,
      type,
      opacity: calculatedOpacity
    });
  }
  getDefaultHighlightOpacity(type) {
    return SPECIAL_HIGHLIGHT_OPACITY[type] ?? DEFAULT_HIGHLIGHT_OPACITY;
  }
  findHighlightIndex(square) {
    return this.state.highlights.findIndex((highlight) => highlight.square === square);
  }
  removeHighlight(square) {
    const index = this.findHighlightIndex(square);
    if (index >= 0) {
      this.state.highlights.splice(index, 1);
    }
  }
  clearHighlights() {
    this.state.highlights = [];
  }
  /**
   * Get the pixel coordinates of the top-left corner of a square
   * @param square The square in algebraic notation (e.g., 'a1', 'h8')
   * @returns An object with x and y coordinates
   */
  getSquareCoordinates(square) {
    const coords = this.resolveRelativeCoords(square);
    return coords.topLeft;
  }
  /**
   * Get the size of a square in pixels
   */
  getSquareSize() {
    return this.squareSize;
  }
  /**
   * Get the center point of a square in pixels
   */
  getSquareCenter(square) {
    const coords = this.resolveRelativeCoords(square);
    return coords.center;
  }
  getHighlights() {
    return this.state.highlights.map((highlight) => ({ ...highlight }));
  }
  // Premove management
  setPremove(from, to, promotion) {
    this.state.premove = { from, to, promotion };
  }
  clearPremove() {
    this.state.premove = void 0;
  }
  getPremove() {
    return this.state.premove;
  }
  setPromotionPreview(square, color, piece) {
    this.state.promotionPreview = { square, color, piece };
  }
  clearPromotionPreview() {
    this.state.promotionPreview = void 0;
  }
  // Coordinate utilities
  squareToCoords(square) {
    const { x, y } = this.getSquareCoordinates(square);
    return [x, y];
  }
  coordsToSquare(x, y) {
    const maxFile = this.filesCount - 1;
    const maxRank = this.ranksCount - 1;
    const file = clamp(Math.floor(x / this.squareSize), 0, maxFile);
    const rank = clamp(Math.floor(y / this.squareSize), 0, maxRank);
    const boardFile = this.orientation === "white" ? file : maxFile - file;
    const boardRank = this.orientation === "white" ? maxRank - rank : rank;
    return this.squareFromIndices(boardFile, boardRank);
  }
  // Knight move detection
  isKnightMove(from, to) {
    const { f: fromFile, r: fromRank } = this.indicesFromSquare(from);
    const { f: toFile, r: toRank } = this.indicesFromSquare(to);
    const dx = Math.abs(toFile - fromFile);
    const dy = Math.abs(toRank - fromRank);
    return dx === 1 && dy === 2 || dx === 2 && dy === 1;
  }
  // Square names rendering
  renderSquareNames(orientation, _square, dpr = 1) {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    const squareSize = this.squareSize / dpr;
    const boardHeight = this.canvas.height / dpr;
    const bottomRankIndex = orientation === "white" ? 0 : this.ranksCount - 1;
    const leftFileIndex = orientation === "white" ? 0 : this.filesCount - 1;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    for (let column = 0; column < this.filesCount; column++) {
      const boardFileIndex = orientation === "white" ? column : this.filesCount - 1 - column;
      const char = this.resolveFileLabel(boardFileIndex);
      const isLightSquare = (boardFileIndex + bottomRankIndex) % 2 === 0;
      const { color, font, padding, opacity, textTransform } = this.resolveNotationStyle(
        squareSize,
        this.alphaNotationStyle,
        isLightSquare ? this.lightNotationStyle : this.darkNotationStyle,
        isLightSquare
      );
      ctx.font = font;
      ctx.globalAlpha = opacity;
      const x = column * squareSize + padding;
      const y = boardHeight - padding;
      ctx.fillStyle = color;
      ctx.fillText(this.applyTextTransform(char, textTransform), x, y);
      ctx.globalAlpha = 1;
    }
    ctx.textBaseline = "middle";
    for (let row = 0; row < this.ranksCount; row++) {
      const boardRankIndex = orientation === "white" ? row : this.ranksCount - 1 - row;
      const label = this.resolveRankLabel(boardRankIndex);
      const isLightSquare = (leftFileIndex + boardRankIndex) % 2 === 0;
      const { color, font, padding, opacity, textTransform } = this.resolveNotationStyle(
        squareSize,
        this.numericNotationStyle,
        isLightSquare ? this.lightNotationStyle : this.darkNotationStyle,
        isLightSquare
      );
      ctx.font = font;
      ctx.globalAlpha = opacity;
      const x = padding;
      const y = boardHeight - (row + 0.5) * squareSize;
      ctx.fillStyle = color;
      ctx.fillText(this.applyTextTransform(label, textTransform), x, y);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  resolveNotationStyle(squareSize, axisStyle, squareStyle, isLight) {
    const DEFAULT_LIGHT_COLOR = "rgba(240, 217, 181, 0.7)";
    const DEFAULT_DARK_COLOR = "rgba(181, 136, 99, 0.7)";
    const merged = { ...axisStyle, ...squareStyle };
    const fontSizeValue = merged.fontSize ?? Math.max(10, squareSize * 0.18);
    const fontSize = typeof fontSizeValue === "number" ? `${fontSizeValue}px` : fontSizeValue || `${Math.max(10, squareSize * 0.18)}px`;
    const fontFamily = merged.fontFamily ?? "'Segoe UI', Arial, sans-serif";
    const fontStyle = merged.fontStyle ? `${merged.fontStyle.trim()} ` : "";
    const fontWeight = merged.fontWeight ?? 500;
    const padding = merged.padding ?? squareSize * 0.12;
    const opacity = typeof merged.opacity === "number" ? merged.opacity : 1;
    const color = merged.color ?? (isLight ? DEFAULT_LIGHT_COLOR : DEFAULT_DARK_COLOR);
    const textTransform = merged.textTransform ?? "none";
    return {
      color,
      font: `${fontStyle}${fontWeight} ${fontSize} ${fontFamily}`,
      padding,
      opacity,
      textTransform
    };
  }
  applyTextTransform(value, transform) {
    if (transform === "uppercase") {
      return value.toUpperCase();
    }
    if (transform === "lowercase") {
      return value.toLowerCase();
    }
    return value;
  }
  resolveFileLabel(boardFileIndex) {
    const fallbackFileLabels = generateFileLabels(boardFileIndex + 1);
    return this.fileLabels[boardFileIndex] ?? FILES[boardFileIndex] ?? fallbackFileLabels[fallbackFileLabels.length - 1] ?? "";
  }
  resolveRankLabel(boardRankIndex) {
    const fallbackRankLabels = generateRankLabels(boardRankIndex + 1);
    return this.rankLabels[boardRankIndex] ?? RANKS[boardRankIndex] ?? fallbackRankLabels[fallbackRankLabels.length - 1] ?? String(boardRankIndex + 1);
  }
  drawArrows(ctx) {
    ctx.save();
    for (const arrow of this.state.arrows) {
      this.drawArrow(ctx, arrow);
    }
    ctx.restore();
  }
  drawArrow(ctx, arrow) {
    if (arrow.knightMove) {
      this.drawKnightArrow(ctx, arrow);
    } else {
      this.drawStraightArrow(ctx, arrow);
    }
  }
  applyArrowStyle(ctx, arrow) {
    const lineWidth = arrow.width;
    ctx.globalAlpha = arrow.opacity;
    ctx.strokeStyle = arrow.color;
    ctx.fillStyle = arrow.color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return lineWidth;
  }
  drawStraightArrow(ctx, arrow) {
    const [fromX, fromY] = this.squareToCoords(arrow.from);
    const [toX, toY] = this.squareToCoords(arrow.to);
    const centerFromX = fromX + this.squareSize / 2;
    const centerFromY = fromY + this.squareSize / 2;
    const centerToX = toX + this.squareSize / 2;
    const centerToY = toY + this.squareSize / 2;
    const dx = centerToX - centerFromX;
    const dy = centerToY - centerFromY;
    const angle = Math.atan2(dy, dx);
    const offset = this.squareSize * 0.25;
    const startX = centerFromX + Math.cos(angle) * offset;
    const startY = centerFromY + Math.sin(angle) * offset;
    const endX = centerToX - Math.cos(angle) * offset;
    const endY = centerToY - Math.sin(angle) * offset;
    const lineWidth = this.applyArrowStyle(ctx, arrow);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    const arrowHeadSize = lineWidth * 3;
    const arrowAngle = Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowHeadSize * Math.cos(angle - arrowAngle),
      endY - arrowHeadSize * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      endX - arrowHeadSize * Math.cos(angle + arrowAngle),
      endY - arrowHeadSize * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
  }
  drawKnightArrow(ctx, arrow) {
    const [fromX, fromY] = this.squareToCoords(arrow.from);
    const [toX, toY] = this.squareToCoords(arrow.to);
    const centerFromX = fromX + this.squareSize / 2;
    const centerFromY = fromY + this.squareSize / 2;
    const centerToX = toX + this.squareSize / 2;
    const centerToY = toY + this.squareSize / 2;
    const dx = centerToX - centerFromX;
    const dy = centerToY - centerFromY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    let cornerX, cornerY;
    if (absDx > absDy) {
      cornerX = centerToX;
      cornerY = centerFromY;
    } else {
      cornerX = centerFromX;
      cornerY = centerToY;
    }
    const lineWidth = this.applyArrowStyle(ctx, arrow);
    const offset = this.squareSize * 0.2;
    let startX = centerFromX;
    let startY = centerFromY;
    let endX = centerToX;
    let endY = centerToY;
    if (absDx > absDy) {
      startX += dx > 0 ? offset : -offset;
      endX += dx > 0 ? -offset : offset;
    } else {
      startY += dy > 0 ? offset : -offset;
      endY += dy > 0 ? -offset : offset;
    }
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(cornerX, cornerY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    const arrowHeadSize = lineWidth * 3;
    const arrowAngle = Math.PI / 6;
    let finalAngle;
    if (absDx > absDy) {
      finalAngle = dy > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      finalAngle = dx > 0 ? 0 : Math.PI;
    }
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowHeadSize * Math.cos(finalAngle - arrowAngle),
      endY - arrowHeadSize * Math.sin(finalAngle - arrowAngle)
    );
    ctx.lineTo(
      endX - arrowHeadSize * Math.cos(finalAngle + arrowAngle),
      endY - arrowHeadSize * Math.sin(finalAngle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
  }
  // Highlight rendering
  drawHighlights(ctx) {
    ctx.save();
    for (const highlight of this.state.highlights) {
      this.drawHighlight(ctx, highlight);
    }
    ctx.restore();
  }
  drawHighlight(ctx, highlight) {
    const [x, y] = this.squareToCoords(highlight.square);
    const color = this.resolveHighlightColor(highlight);
    const opacity = highlight.opacity ?? 0.6;
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    const centerX = x + this.squareSize / 2;
    const centerY = y + this.squareSize / 2;
    const radius = this.squareSize * 0.15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = opacity * 1.5;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  resolveHighlightColor(highlight) {
    if (highlight.type === "circle") {
      return highlight.color ?? DEFAULT_CIRCLE_COLOR;
    }
    const managedType = highlight.type;
    return HIGHLIGHT_COLORS[managedType] ?? highlight.color ?? DEFAULT_CIRCLE_COLOR;
  }
  isInHighlightSequence(type) {
    return HIGHLIGHT_SEQUENCE.includes(type);
  }
  getNextHighlightType(type) {
    if (!this.isInHighlightSequence(type)) {
      return null;
    }
    const currentIndex = HIGHLIGHT_SEQUENCE.indexOf(type);
    const nextIndex = (currentIndex + 1) % HIGHLIGHT_SEQUENCE.length;
    if (nextIndex === 0) {
      return null;
    }
    return HIGHLIGHT_SEQUENCE[nextIndex];
  }
  getActiveModifier(modifiers) {
    for (const key of MODIFIER_PRIORITY) {
      if (modifiers[key]) {
        return key;
      }
    }
    return null;
  }
  resolveArrowColor(modifiers) {
    const modifier = this.getActiveModifier(modifiers);
    if (!modifier) {
      return this.arrowOptions.color ?? ARROW_COLOR_BY_MODIFIER.default;
    }
    return ARROW_COLOR_BY_MODIFIER[modifier];
  }
  resolveHighlightTypeFromModifiers(modifiers) {
    const modifier = this.getActiveModifier(modifiers);
    if (!modifier) {
      return HIGHLIGHT_SEQUENCE[0];
    }
    return HIGHLIGHT_TYPE_BY_MODIFIER[modifier];
  }
  withContext(callback) {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    callback(ctx);
  }
  // Premove rendering
  drawPremove(ctx) {
    if (!this.state.premove) return;
    ctx.save();
    const [fromX, fromY] = this.squareToCoords(this.state.premove.from);
    const [toX, toY] = this.squareToCoords(this.state.premove.to);
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 3;
    if (ctx.setLineDash) {
      ctx.setLineDash([8, 4]);
    }
    ctx.lineCap = "round";
    const centerFromX = fromX + this.squareSize / 2;
    const centerFromY = fromY + this.squareSize / 2;
    const centerToX = toX + this.squareSize / 2;
    const centerToY = toY + this.squareSize / 2;
    ctx.beginPath();
    ctx.moveTo(centerFromX, centerFromY);
    ctx.lineTo(centerToX, centerToY);
    ctx.stroke();
    if (ctx.setLineDash) {
      ctx.setLineDash([]);
    }
    ctx.fillStyle = "rgba(255, 152, 0, 0.3)";
    ctx.fillRect(fromX, fromY, this.squareSize, this.squareSize);
    ctx.fillRect(toX, toY, this.squareSize, this.squareSize);
    ctx.restore();
  }
  drawPromotionPreview(ctx) {
    const preview = this.state.promotionPreview;
    if (!preview) {
      return;
    }
    const [x, y] = this.squareToCoords(preview.square);
    const size = this.squareSize;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "rgba(17, 24, 39, 0.4)";
    ctx.fillRect(x, y, size, size);
    if (preview.piece) {
      const isWhite = preview.color === "w";
      ctx.fillStyle = isWhite ? "#f9fafb" : "#111827";
      ctx.font = `${Math.max(24, Math.round(size * 0.58))}px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = preview.piece.toUpperCase();
      ctx.fillText(label, x + size / 2, y + size / 2);
    }
    ctx.restore();
  }
  // Methods to get the complete state
  getDrawingState() {
    return {
      arrows: this.getArrows(),
      highlights: this.getHighlights(),
      premove: this.state.premove ? { ...this.state.premove } : void 0,
      promotionPreview: this.state.promotionPreview ? { ...this.state.promotionPreview } : void 0
    };
  }
  setDrawingState(state) {
    this.withSuppressedArrowsChange(() => {
      if (state.arrows !== void 0) {
        this.state.arrows = state.arrows.map((arrow) => this.normalizeArrow(arrow));
      }
      if (state.highlights !== void 0) {
        this.state.highlights = state.highlights.map((highlight) => ({ ...highlight }));
      }
      if (state.premove !== void 0) {
        this.state.premove = state.premove ? { ...state.premove } : void 0;
      }
      if (state.promotionPreview !== void 0) {
        this.state.promotionPreview = state.promotionPreview ? { ...state.promotionPreview } : void 0;
      }
    });
  }
  // Utilities for interactions
  getSquareFromMousePosition(mouseX, mouseY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (mouseX - rect.left) * (this.canvas.width / rect.width);
    const y = (mouseY - rect.top) * (this.canvas.height / rect.height);
    if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) {
      return null;
    }
    return this.coordsToSquare(x, y);
  }
  // Cycle highlight colors on right-click
  cycleHighlight(square) {
    const existingIndex = this.findHighlightIndex(square);
    if (existingIndex >= 0) {
      const currentHighlight = this.state.highlights[existingIndex];
      const nextType = this.getNextHighlightType(currentHighlight.type);
      if (!nextType) {
        this.removeHighlight(square);
        return;
      }
      this.state.highlights[existingIndex].type = nextType;
      return;
    }
    this.addHighlight(square, HIGHLIGHT_SEQUENCE[0]);
  }
  // Complete rendering of all elements
  draw(ctx) {
    this.drawHighlights(ctx);
    this.drawPremove(ctx);
    this.drawArrows(ctx);
    if (this.showSquareNames) {
      this._drawSquareNames(ctx);
    }
  }
  // Check if a point is near an arrow (for deletion)
  getArrowAt(mouseX, mouseY, tolerance = 10) {
    const rect = this.canvas.getBoundingClientRect();
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;
    for (const arrow of this.state.arrows) {
      if (this.isPointNearArrow(x, y, arrow, tolerance)) {
        return { ...arrow };
      }
    }
    return null;
  }
  isPointNearArrow(x, y, arrow, tolerance) {
    const [fromX, fromY] = this.squareToCoords(arrow.from);
    const [toX, toY] = this.squareToCoords(arrow.to);
    const centerFromX = fromX + this.squareSize / 2;
    const centerFromY = fromY + this.squareSize / 2;
    const centerToX = toX + this.squareSize / 2;
    const centerToY = toY + this.squareSize / 2;
    const lineLength = Math.sqrt(
      Math.pow(centerToX - centerFromX, 2) + Math.pow(centerToY - centerFromY, 2)
    );
    if (lineLength === 0) return false;
    const distance = Math.abs(
      ((centerToY - centerFromY) * x - (centerToX - centerFromX) * y + centerToX * centerFromY - centerToY * centerFromX) / lineLength
    );
    return distance <= tolerance;
  }
  // Export/Import for persistence
  exportState() {
    return JSON.stringify(this.getDrawingState());
  }
  importState(stateJson) {
    try {
      const imported = JSON.parse(stateJson);
      this.setDrawingState(imported);
    } catch (error) {
      console.warn("Failed to import drawing state:", error);
    }
  }
  // Interaction methods for NeoChessBoard
  handleMouseDown(_x, _y, _shiftKey, _ctrlKey) {
    return false;
  }
  handleLeftClick() {
    if (!this.clearArrowsOnClick || this.state.arrows.length === 0) {
      return false;
    }
    this.clearArrows();
    return true;
  }
  handleRightMouseDown(x, y, shiftKey = false, ctrlKey = false, altKey = false) {
    if (!this.allowDrawingArrows) {
      return false;
    }
    const square = this.coordsToSquare(x, y);
    this.currentAction = { type: "drawing_arrow", startSquare: square, shiftKey, ctrlKey, altKey };
    return true;
  }
  handleMouseMove(_x, _y) {
    return false;
  }
  handleMouseUp(_x, _y) {
    this.cancelCurrentAction();
    return false;
  }
  handleRightMouseUp(x, y) {
    if (!this.allowDrawingArrows) {
      this.cancelCurrentAction();
      return false;
    }
    if (this.currentAction.type !== "drawing_arrow") {
      this.cancelCurrentAction();
      return false;
    }
    const currentDrawingAction = this.currentAction;
    const endSquare = this.coordsToSquare(x, y);
    if (endSquare === currentDrawingAction.startSquare) {
      this.cancelCurrentAction();
      return false;
    }
    const color = this.resolveArrowColor(currentDrawingAction);
    const existingArrow = this.state.arrows.find(
      (arrow) => arrow.from === currentDrawingAction.startSquare && arrow.to === endSquare && arrow.color === color
    );
    if (existingArrow) {
      this.removeArrow(currentDrawingAction.startSquare, endSquare);
    } else {
      this.addArrow(currentDrawingAction.startSquare, endSquare, color);
    }
    this.cancelCurrentAction();
    return true;
  }
  handleHighlightClick(square, shiftKey = false, ctrlKey = false, altKey = false) {
    if (!shiftKey && !ctrlKey && !altKey) {
      this.cycleHighlight(square);
      return;
    }
    const modifiers = { shiftKey, ctrlKey, altKey };
    const highlightType = this.resolveHighlightTypeFromModifiers(modifiers);
    const existingIndex = this.state.highlights.findIndex(
      (highlight) => highlight.square === square && highlight.type === highlightType
    );
    if (existingIndex >= 0) {
      this.removeHighlight(square);
      return;
    }
    this.addHighlight(square, highlightType);
  }
  renderPremove() {
    this.withContext((ctx) => this.drawPremove(ctx));
  }
  renderHighlights() {
    this.withContext((ctx) => this.drawHighlights(ctx));
  }
  renderPromotionPreview() {
    this.withContext((ctx) => this.drawPromotionPreview(ctx));
  }
  // Methods with signatures adapted for NeoChessBoard
  addArrowFromObject(arrow) {
    this.addArrow(arrow.from, arrow.to, arrow.color, arrow.width, arrow.opacity);
  }
  addHighlightFromObject(highlight) {
    this.addHighlight(highlight.square, highlight.type, highlight.opacity);
  }
  setPremoveFromObject(premove) {
    this.setPremove(premove.from, premove.to, premove.promotion);
  }
  _drawSquareNames(ctx) {
    ctx.save();
    ctx.font = `${Math.floor(this.squareSize * 0.18)}px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto`;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    for (let r = 0; r < this.ranksCount; r++) {
      for (let f = 0; f < this.filesCount; f++) {
        const square = this.coordsToSquare(f * this.squareSize, r * this.squareSize);
        const [x, y] = this.squareToCoords(square);
        if (r === (this.orientation === "white" ? this.ranksCount - 1 : 0)) {
          const boardFileIndex = this.orientation === "white" ? f : this.filesCount - 1 - f;
          const file = this.resolveFileLabel(boardFileIndex);
          ctx.textAlign = this.orientation === "white" ? "left" : "right";
          ctx.textBaseline = "bottom";
          ctx.fillText(
            file,
            x + (this.orientation === "white" ? this.squareSize * 0.06 : this.squareSize - this.squareSize * 0.06),
            y + this.squareSize - this.squareSize * 0.06
          );
        }
        if (f === (this.orientation === "white" ? 0 : this.filesCount - 1)) {
          const boardRankIndex = this.orientation === "white" ? this.ranksCount - 1 - r : r;
          const rank = this.resolveRankLabel(boardRankIndex);
          ctx.textAlign = this.orientation === "white" ? "left" : "right";
          ctx.textBaseline = this.orientation === "white" ? "top" : "bottom";
          ctx.fillText(
            rank,
            x + (this.orientation === "white" ? this.squareSize * 0.06 : this.squareSize - this.squareSize * 0.06),
            y + (this.orientation === "white" ? this.squareSize * 0.06 : this.squareSize - this.squareSize * 0.06)
          );
        }
      }
    }
    ctx.restore();
  }
  // Additional helper methods for integration with NeoChessBoard
  /**
   * Render arrows on the canvas
   */
  renderArrows() {
    this.withContext((ctx) => this.drawArrows(ctx));
  }
  /**
   * Cancel the current drawing action
   */
  cancelCurrentAction() {
    this.currentAction = { type: "none" };
  }
  /**
   * Clear all drawings (arrows, highlights, premoves)
   */
  clearAllDrawings() {
    const hadArrows = this.state.arrows.length > 0;
    this.state.arrows = [];
    this.state.highlights = [];
    this.state.premove = void 0;
    this.state.promotionPreview = void 0;
    if (hadArrows) {
      this.notifyArrowsChange();
    }
  }
}
class BoardDomManager {
  constructor(options) {
    this.appliedBoardStyleKeys = /* @__PURE__ */ new Set();
    const { root, ...rest } = options;
    this.root = root;
    this.options = rest;
    this.boardInlineStyle = options.boardInlineStyle ? { ...options.boardInlineStyle } : void 0;
  }
  build() {
    this.setupRootElement();
    const { cBoard, cPieces, cOverlay } = this.createCanvases();
    const { domOverlay, squareLayer, pieceLayer } = this.createDomLayers();
    const { ctxBoard, ctxPieces, ctxOverlay } = this.initializeContexts({
      cBoard,
      cPieces,
      cOverlay
    });
    const drawingManager = this.createDrawingManager(cOverlay);
    const sprites = new FlatSprites(this.options.spriteSize, this.options.theme);
    this.setupResizeObserver();
    this.injectStyles();
    return {
      cBoard,
      cPieces,
      cOverlay,
      ctxBoard,
      ctxPieces,
      ctxOverlay,
      domOverlay,
      squareLayer,
      pieceLayer,
      drawingManager,
      sprites
    };
  }
  setBoardStyle(style) {
    this.boardInlineStyle = style ? { ...style } : void 0;
    this.applyBoardStyle();
  }
  disconnect() {
    var _a;
    (_a = this.resizeObserver) == null ? void 0 : _a.disconnect();
    this.resizeObserver = void 0;
  }
  setupRootElement() {
    this.root.classList.add("ncb-root");
    this.root.style.position = "relative";
    this.root.style.userSelect = "none";
    this.root.style.aspectRatio = `${this.options.filesCount} / ${this.options.ranksCount}`;
    if (this.options.boardId) {
      this.root.id = this.options.boardId;
    }
    this.applyBoardStyle();
  }
  createCanvases() {
    const doc = this.root.ownerDocument ?? document;
    const create = () => {
      const canvas = doc.createElement("canvas");
      Object.assign(canvas.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%"
      });
      return canvas;
    };
    const cBoard = create();
    const cPieces = create();
    const cOverlay = create();
    this.root.append(cBoard, cPieces, cOverlay);
    return { cBoard, cPieces, cOverlay };
  }
  createDomLayers() {
    if (typeof document === "undefined") {
      return {};
    }
    const overlay = document.createElement("div");
    overlay.classList.add("ncb-dom-overlay");
    Object.assign(overlay.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none"
    });
    const squareLayer = document.createElement("div");
    squareLayer.classList.add("ncb-square-overlay");
    Object.assign(squareLayer.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none"
    });
    overlay.appendChild(squareLayer);
    const pieceLayer = document.createElement("div");
    pieceLayer.classList.add("ncb-piece-overlay");
    Object.assign(pieceLayer.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none"
    });
    overlay.appendChild(pieceLayer);
    this.root.appendChild(overlay);
    return { domOverlay: overlay, squareLayer, pieceLayer };
  }
  initializeContexts(canvases) {
    const ctxBoard = canvases.cBoard.getContext("2d");
    const ctxPieces = canvases.cPieces.getContext("2d");
    const ctxOverlay = canvases.cOverlay.getContext("2d");
    return { ctxBoard, ctxPieces, ctxOverlay };
  }
  createDrawingManager(cOverlay) {
    const drawingManager = new DrawingManager(cOverlay, {
      allowDrawingArrows: this.options.allowDrawingArrows,
      arrowOptions: this.options.arrowOptions,
      clearArrowsOnClick: this.options.clearArrowsOnClick,
      onArrowsChange: this.options.onArrowsChange,
      lightSquareNotationStyle: this.options.lightNotationStyle,
      darkSquareNotationStyle: this.options.darkNotationStyle,
      alphaNotationStyle: this.options.alphaNotationStyle,
      numericNotationStyle: this.options.numericNotationStyle,
      boardFiles: this.options.filesCount,
      boardRanks: this.options.ranksCount,
      fileLabels: [...this.options.fileLabels],
      rankLabels: [...this.options.rankLabels]
    });
    drawingManager.setOrientation(this.options.orientation);
    drawingManager.setShowSquareNames(this.options.showSquareNames);
    if (this.options.controlledArrows) {
      drawingManager.setArrows(this.options.controlledArrows);
    }
    return drawingManager;
  }
  setupResizeObserver() {
    var _a;
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    (_a = this.resizeObserver) == null ? void 0 : _a.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.options.onResizeRequested());
    this.resizeObserver.observe(this.root);
  }
  injectStyles() {
    if (typeof document === "undefined") {
      return;
    }
    const style = document.createElement("style");
    style.textContent = `
      .ncb-root {
        display: block;
        max-width: 100%;
        aspect-ratio: auto 606/606;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.10);
      }
      canvas {
        image-rendering: optimizeQuality;
        aspect-ratio: auto 606/606;
      }
    `;
    document.head.appendChild(style);
  }
  applyBoardStyle() {
    const style = this.boardInlineStyle;
    const nextKeys = new Set(style ? Object.keys(style) : []);
    for (const key of this.appliedBoardStyleKeys) {
      if (!nextKeys.has(key)) {
        this.setRootStyleValue(key, "");
      }
    }
    this.appliedBoardStyleKeys.clear();
    if (!style) {
      return;
    }
    for (const [key, value] of Object.entries(style)) {
      const normalized = this.normalizeStyleValue(value);
      this.setRootStyleValue(key, normalized);
      this.appliedBoardStyleKeys.add(key);
    }
  }
  setRootStyleValue(key, value) {
    if (key.includes("-")) {
      this.root.style.setProperty(key, value);
    } else {
      this.root.style[key] = value;
    }
  }
  normalizeStyleValue(value) {
    if (typeof value === "number") {
      return Number.isFinite(value) ? `${value}` : "";
    }
    return value;
  }
}
const DEFAULT_AUDIO_VOLUME = 0.3;
class BoardAudioManager {
  constructor(config) {
    this.moveSound = null;
    this.moveSounds = {};
    this.enabled = config.enabled;
    this.soundUrl = config.soundUrl;
    this.soundUrls = config.soundUrls;
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) {
      this.initialize();
    } else {
      this.clear();
    }
  }
  setSoundUrl(soundUrl) {
    this.soundUrl = soundUrl;
    this.refresh();
  }
  setSoundUrls(soundUrls) {
    this.soundUrls = soundUrls;
    this.refresh();
  }
  initialize() {
    var _a, _b;
    this.moveSound = null;
    this.moveSounds = {};
    if (!this.enabled || typeof Audio === "undefined") {
      return;
    }
    const defaultUrl = this.soundUrl;
    const whiteUrl = (_a = this.soundUrls) == null ? void 0 : _a.white;
    const blackUrl = (_b = this.soundUrls) == null ? void 0 : _b.black;
    if (!defaultUrl && !whiteUrl && !blackUrl) {
      return;
    }
    if (whiteUrl) {
      const whiteSound = this.createAudioElement(whiteUrl);
      if (whiteSound) {
        this.moveSounds.white = whiteSound;
      }
    }
    if (blackUrl) {
      const blackSound = this.createAudioElement(blackUrl);
      if (blackSound) {
        this.moveSounds.black = blackSound;
      }
    }
    if (defaultUrl) {
      this.moveSound = this.createAudioElement(defaultUrl);
    }
  }
  playMoveSound(nextTurn) {
    if (!this.enabled) {
      return;
    }
    const movedColor = nextTurn === "w" ? "black" : "white";
    const sound = this.moveSounds[movedColor] ?? this.moveSound;
    if (!sound) {
      return;
    }
    try {
      sound.currentTime = 0;
      void sound.play().catch((error) => {
        console.debug("Sound not played:", (error == null ? void 0 : error.message) ?? error);
      });
    } catch (error) {
      console.debug("Error playing sound:", error);
    }
  }
  clear() {
    this.moveSound = null;
    this.moveSounds = {};
  }
  refresh() {
    if (this.enabled) {
      this.initialize();
    } else {
      this.clear();
    }
  }
  createAudioElement(url) {
    try {
      const audio = new Audio(url);
      audio.volume = DEFAULT_AUDIO_VOLUME;
      audio.preload = "auto";
      audio.addEventListener("error", () => {
        console.debug("Sound not available");
      });
      return audio;
    } catch (error) {
      console.warn("Unable to load move sound:", error);
      return null;
    }
  }
}
class BoardEventManager {
  constructor(overlay, callbacks) {
    this.overlay = overlay;
    this.callbacks = callbacks;
    this.pointerDownAttached = false;
    this.globalPointerEventsAttached = false;
    this.localPointerEventsAttached = false;
    this.cancelledDragWithRightClick = false;
  }
  attach() {
    const cancelActiveDrag = () => {
      const cancelled = this.callbacks.cancelActiveDrag();
      if (cancelled) {
        this.cancelledDragWithRightClick = true;
      }
      return cancelled;
    };
    const onPointerDown = (event) => {
      if (event.button === 2) {
        event.preventDefault();
        if (cancelActiveDrag()) {
          return;
        }
        this.cancelledDragWithRightClick = false;
        this.callbacks.handleRightMouseDown(event);
        return;
      }
      if (event.button !== 0 || !this.callbacks.isInteractive()) {
        return;
      }
      this.callbacks.handleLeftMouseDown(event);
    };
    const onPointerMove = (event) => {
      const point = this.callbacks.getPointerPosition(event);
      this.callbacks.handleMouseMove(event, point);
    };
    const onPointerUp = (event) => {
      if (event.button === 2) {
        if (cancelActiveDrag()) {
          this.cancelledDragWithRightClick = false;
          return;
        }
        if (this.cancelledDragWithRightClick) {
          this.cancelledDragWithRightClick = false;
          return;
        }
        this.callbacks.handleRightMouseUp(event);
        return;
      }
      this.callbacks.handleLeftMouseUp(event);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        this.callbacks.handleEscapeKey();
      }
    };
    const onContextMenu = (event) => {
      if (this.callbacks.allowRightClickHighlights()) {
        event.preventDefault();
      }
    };
    this.pointerDownHandler = onPointerDown;
    this.pointerMoveHandler = onPointerMove;
    this.pointerUpHandler = onPointerUp;
    this.keyDownHandler = onKeyDown;
    this.contextMenuHandler = onContextMenu;
    this.overlay.addEventListener("contextmenu", onContextMenu);
    globalThis.addEventListener("keydown", onKeyDown);
    this.updatePointerBindings();
  }
  detach() {
    if (this.pointerDownAttached && this.pointerDownHandler) {
      this.overlay.removeEventListener("pointerdown", this.pointerDownHandler);
      this.pointerDownAttached = false;
    }
    if (this.contextMenuHandler) {
      this.overlay.removeEventListener("contextmenu", this.contextMenuHandler);
      this.contextMenuHandler = void 0;
    }
    this.unbindGlobalPointerEvents();
    this.unbindLocalPointerEvents();
    if (this.keyDownHandler) {
      globalThis.removeEventListener("keydown", this.keyDownHandler);
      this.keyDownHandler = void 0;
    }
    this.pointerDownHandler = void 0;
    this.pointerMoveHandler = void 0;
    this.pointerUpHandler = void 0;
  }
  updatePointerBindings() {
    if (!this.pointerDownHandler || !this.pointerMoveHandler || !this.pointerUpHandler) {
      return;
    }
    if (!this.pointerDownAttached) {
      this.overlay.addEventListener("pointerdown", this.pointerDownHandler);
      this.pointerDownAttached = true;
    }
    if (this.callbacks.allowDragging()) {
      this.unbindLocalPointerEvents();
      this.bindGlobalPointerEvents();
    } else {
      this.unbindGlobalPointerEvents();
      this.bindLocalPointerEvents();
    }
  }
  bindGlobalPointerEvents() {
    if (this.globalPointerEventsAttached || !this.pointerMoveHandler || !this.pointerUpHandler) {
      return;
    }
    globalThis.addEventListener("pointermove", this.pointerMoveHandler);
    globalThis.addEventListener("pointerup", this.pointerUpHandler);
    this.globalPointerEventsAttached = true;
  }
  unbindGlobalPointerEvents() {
    if (!this.globalPointerEventsAttached || !this.pointerMoveHandler || !this.pointerUpHandler) {
      return;
    }
    globalThis.removeEventListener("pointermove", this.pointerMoveHandler);
    globalThis.removeEventListener("pointerup", this.pointerUpHandler);
    this.globalPointerEventsAttached = false;
  }
  bindLocalPointerEvents() {
    if (this.localPointerEventsAttached || !this.pointerMoveHandler || !this.pointerUpHandler) {
      return;
    }
    this.overlay.addEventListener("pointermove", this.pointerMoveHandler);
    this.overlay.addEventListener("pointerup", this.pointerUpHandler);
    this.localPointerEventsAttached = true;
  }
  unbindLocalPointerEvents() {
    if (!this.localPointerEventsAttached || !this.pointerMoveHandler || !this.pointerUpHandler) {
      return;
    }
    this.overlay.removeEventListener("pointermove", this.pointerMoveHandler);
    this.overlay.removeEventListener("pointerup", this.pointerUpHandler);
    this.localPointerEventsAttached = false;
  }
}
const DEFAULT_BOARD_SIZE = 480;
const DEFAULT_ANIMATION_MS = 300;
const SPRITE_SIZE = 128;
const DEFAULT_BOARD_RANKS = 8;
const DEFAULT_BOARD_FILES = 8;
const DRAG_SCALE = 1.05;
const LEGAL_MOVE_DOT_RADIUS = 0.12;
const ARROW_HEAD_SIZE_FACTOR = 0.25;
const ARROW_THICKNESS_FACTOR = 0.08;
const MIN_ARROW_HEAD_SIZE = 16;
const MIN_ARROW_THICKNESS = 6;
const ARROW_OPACITY = 0.95;
const PREMOVE_EXECUTION_DELAY = 150;
const POST_MOVE_PREMOVE_DELAY = 50;
const PROMOTION_CHOICES = ["q", "r", "b", "n"];
const PIECE_INDEX_MAP = {
  k: 0,
  q: 1,
  r: 2,
  b: 3,
  n: 4,
  p: 5
};
class NeoChessBoard {
  // ============================================================================
  // Constructor
  // ============================================================================
  constructor(root, options = {}) {
    this.bus = new EventBus();
    this.squareElements = /* @__PURE__ */ new Map();
    this.pieceElements = /* @__PURE__ */ new Map();
    this.sizePx = DEFAULT_BOARD_SIZE;
    this.square = 60;
    this.dpr = 1;
    this.filesCount = DEFAULT_BOARD_FILES;
    this.ranksCount = DEFAULT_BOARD_RANKS;
    this.fileLabels = generateFileLabels(DEFAULT_BOARD_FILES);
    this.rankLabels = generateRankLabels(DEFAULT_BOARD_RANKS);
    this.drawingManagerArrowsChangeHandler = (arrows) => {
      var _a;
      (_a = this.onArrowsChange) == null ? void 0 : _a.call(this, arrows);
    };
    this._lastMove = null;
    this._premove = null;
    this._selected = null;
    this._legalCached = null;
    this._dragging = null;
    this._hoverSq = null;
    this._pointerSquare = null;
    this._pendingDrag = null;
    this._arrows = [];
    this._customHighlights = null;
    this._drawingArrow = null;
    this._raf = 0;
    this._scrollContainer = null;
    this.customPieceSprites = {};
    this._pieceSetToken = 0;
    this._pendingPromotion = null;
    this._promotionToken = 0;
    this.extensionStates = [];
    this.root = root;
    this.initialOptions = { ...options };
    this.theme = resolveTheme(options.theme ?? "classic");
    const desiredOrientation = options.boardOrientation ?? options.orientation;
    this.orientation = desiredOrientation ?? "white";
    this._setBoardGeometry(
      options.chessboardColumns ?? DEFAULT_BOARD_FILES,
      options.chessboardRows ?? DEFAULT_BOARD_RANKS
    );
    this.boardId = options.id ?? void 0;
    const boardStyle = options.boardStyle ? { ...options.boardStyle } : void 0;
    this.baseSquareStyle = options.squareStyle ? { ...options.squareStyle } : void 0;
    this.lightSquareStyleOptions = options.lightSquareStyle ? { ...options.lightSquareStyle } : void 0;
    this.darkSquareStyleOptions = options.darkSquareStyle ? { ...options.darkSquareStyle } : void 0;
    if (options.squareStyles) {
      this.squareStylesMap = Object.entries(options.squareStyles).reduce((acc, [sqKey, style]) => {
        if (style) {
          acc[sqKey] = { ...style };
        }
        return acc;
      }, {});
    } else {
      this.squareStylesMap = void 0;
    }
    this.lightNotationStyle = options.lightSquareNotationStyle ? { ...options.lightSquareNotationStyle } : void 0;
    this.darkNotationStyle = options.darkSquareNotationStyle ? { ...options.darkSquareNotationStyle } : void 0;
    this.alphaNotationStyle = options.alphaNotationStyle ? { ...options.alphaNotationStyle } : void 0;
    this.numericNotationStyle = options.numericNotationStyle ? { ...options.numericNotationStyle } : void 0;
    this.customSquareRenderer = options.squareRenderer;
    this.customPieceRenderers = options.pieces ? { ...options.pieces } : void 0;
    const resolvedAnimationDuration = typeof options.animationDurationInMs === "number" ? options.animationDurationInMs : options.animationMs;
    const sanitizedAnimationDuration = typeof resolvedAnimationDuration === "number" && Number.isFinite(resolvedAnimationDuration) ? Math.max(0, resolvedAnimationDuration) : void 0;
    this.animationMs = sanitizedAnimationDuration ?? DEFAULT_ANIMATION_MS;
    this.showAnimations = options.showAnimations !== false;
    this.interactive = options.interactive !== false;
    this.showCoords = options.showCoordinates || false;
    this.highlightLegal = options.highlightLegal !== false;
    this.allowPremoves = options.allowPremoves !== false;
    this.showArrows = options.showArrows !== false;
    this.showHighlights = options.showHighlights !== false;
    this.rightClickHighlights = options.rightClickHighlights !== false;
    this.allowDrawingArrows = options.allowDrawingArrows !== false;
    this.clearArrowsOnClick = options.clearArrowsOnClick === true;
    this.soundEnabled = options.soundEnabled !== false;
    const showNotationOption = options.showNotation ?? options.showSquareNames;
    this.showSquareNames = Boolean(showNotationOption);
    this.autoFlip = options.autoFlip ?? false;
    this.allowAutoScroll = options.allowAutoScroll === true;
    this.allowDragging = options.allowDragging !== false;
    this.allowDragOffBoard = options.allowDragOffBoard !== false;
    this.canDragPiece = options.canDragPiece;
    const activationDistance = typeof options.dragActivationDistance === "number" && Number.isFinite(options.dragActivationDistance) ? options.dragActivationDistance : 0;
    this.dragActivationDistance = Math.max(0, activationDistance);
    this.arrowOptions = options.arrowOptions;
    this.onArrowsChange = options.onArrowsChange;
    this.controlledArrows = options.arrows;
    this.audioManager = new BoardAudioManager({
      enabled: this.soundEnabled,
      soundUrl: options.soundUrl,
      soundUrls: options.soundUrls
    });
    this.audioManager.initialize();
    this.promotionHandler = options.onPromotionRequired;
    this.rules = options.rulesAdapter || new ChessJsRules();
    const initialFen = options.fen ?? options.position;
    if (initialFen) {
      this.rules.setFEN(initialFen);
    }
    this.state = this._parseFEN(this.rules.getFEN());
    this._syncOrientationFromTurn(true);
    this._initializeExtensions(options.extensions);
    this.domManager = new BoardDomManager({
      root: this.root,
      boardId: this.boardId,
      boardInlineStyle: boardStyle,
      filesCount: this.filesCount,
      ranksCount: this.ranksCount,
      fileLabels: this.fileLabels,
      rankLabels: this.rankLabels,
      orientation: this.orientation,
      showSquareNames: this.showSquareNames,
      allowDrawingArrows: this.allowDrawingArrows,
      arrowOptions: this.arrowOptions,
      clearArrowsOnClick: this.clearArrowsOnClick,
      controlledArrows: this.controlledArrows,
      lightNotationStyle: this.lightNotationStyle,
      darkNotationStyle: this.darkNotationStyle,
      alphaNotationStyle: this.alphaNotationStyle,
      numericNotationStyle: this.numericNotationStyle,
      onArrowsChange: this.drawingManagerArrowsChangeHandler,
      onResizeRequested: () => this.resize(),
      theme: this.theme,
      spriteSize: SPRITE_SIZE
    });
    const domResult = this.domManager.build();
    this.cBoard = domResult.cBoard;
    this.cPieces = domResult.cPieces;
    this.cOverlay = domResult.cOverlay;
    this.ctxB = domResult.ctxBoard;
    this.ctxP = domResult.ctxPieces;
    this.ctxO = domResult.ctxOverlay;
    this.domOverlay = domResult.domOverlay;
    this.squareLayer = domResult.squareLayer;
    this.pieceLayer = domResult.pieceLayer;
    this.drawingManager = domResult.drawingManager;
    this.sprites = domResult.sprites;
    this.squareElements.clear();
    this.pieceElements.clear();
    this._applyNotationStyles();
    this._invokeExtensionHook("onInit");
    this.eventManager = new BoardEventManager(this.cOverlay, {
      cancelActiveDrag: () => {
        if (!this._dragging) {
          return false;
        }
        this._clearInteractionState();
        this.renderAll();
        return true;
      },
      handleLeftMouseDown: (event) => this._handleLeftMouseDown(event),
      handleLeftMouseUp: (event) => this._handleLeftMouseUp(event),
      handleMouseMove: (event, point) => this._handleMouseMove(event, point),
      handleRightMouseDown: (event) => this._handleRightMouseDown(event),
      handleRightMouseUp: (event) => this._handleRightMouseUp(event),
      handleEscapeKey: () => this._handleEscapeKey(),
      getPointerPosition: (event) => this._getPointerPosition(event),
      isInteractive: () => this.interactive,
      allowDragging: () => this.allowDragging,
      allowRightClickHighlights: () => this.rightClickHighlights
    });
    this.eventManager.attach();
    this.resize();
    if (options.pieceSet) {
      void this.setPieceSet(options.pieceSet);
    }
  }
  // ============================================================================
  // Public API - Board Information
  // ============================================================================
  getPosition() {
    return this.rules.getFEN();
  }
  getCurrentFEN() {
    return this.rules.getFEN();
  }
  getRootElement() {
    return this.root;
  }
  getOrientation() {
    return this.orientation;
  }
  getTurn() {
    return this.state.turn;
  }
  getPieceAt(square) {
    return this._pieceAt(square) ?? null;
  }
  /**
   * Returns every square currently occupied by the requested piece.
   *
   * The `piece` parameter must use FEN notation: uppercase letters (`K`, `Q`, `R`, `B`, `N`, `P`)
   * target white pieces while their lowercase counterparts (`k`, `q`, `r`, `b`, `n`, `p`) target
   * black pieces. The resulting array is sorted from the lowest rank/file combination (for
   * example `a1`) up to the highest (such as `h8`) to provide a stable order for assertions and
   * deterministic rendering helpers.
   */
  getPieceSquares(piece) {
    const board = this.state.board;
    const squares = [];
    for (let r = 0; r < board.length; r++) {
      const row = board[r];
      if (!row) continue;
      for (let f = 0; f < row.length; f++) {
        if (row[f] === piece) {
          squares.push(this._indicesToSquare(f, r));
        }
      }
    }
    return squares;
  }
  getMoveHistory() {
    if (typeof this.rules.history === "function") {
      return this.rules.history();
    }
    return [];
  }
  isDraw() {
    return this.rules.isDraw();
  }
  isInsufficientMaterial() {
    return this.rules.isInsufficientMaterial();
  }
  isThreefoldRepetition() {
    return this.rules.isThreefoldRepetition();
  }
  // ============================================================================
  // Public API - Position Management
  // ============================================================================
  setPosition(fen, immediate = false) {
    this.setFEN(fen, immediate);
  }
  loadPosition(fen, immediate = true) {
    this.setPosition(fen, immediate);
    this._clearInteractionState();
  }
  reset(immediate = true) {
    this._resetRulesAdapter();
    this.loadPosition(this.rules.getFEN(), immediate);
    this._clearAllDrawings();
  }
  setFEN(fen, immediate = false) {
    this._cancelPendingPromotion();
    const oldState = this.state;
    const oldTurn = this.state.turn;
    this.rules.setFEN(fen);
    this.state = this._parseFEN(this.rules.getFEN());
    this._syncOrientationFromTurn(false);
    this._lastMove = null;
    if (oldTurn !== this.state.turn) {
      this._executePremoveIfValid();
    }
    this._premove = null;
    if (immediate) {
      this._clearAnimation();
      this.renderAll();
    } else {
      this._animateTo(this.state, oldState);
    }
    this._emitUpdateEvent();
  }
  _adapterSupportsSanMoves() {
    const adapter = this.rules;
    return (adapter == null ? void 0 : adapter.supportsSanMoves) === true;
  }
  // ============================================================================
  // Public API - Move Submission
  // ============================================================================
  submitMove(notation) {
    const sanitizedNotation = notation.trim();
    if (!sanitizedNotation) {
      return false;
    }
    if (this._adapterSupportsSanMoves()) {
      let sanResult;
      try {
        sanResult = this.rules.move(sanitizedNotation);
      } catch (error) {
        sanResult = null;
        if (process.env.NODE_ENV !== "production") {
          console.warn("SAN move submission failed; falling back to coordinates.", error);
        }
      }
      if (sanResult == null ? void 0 : sanResult.ok) {
        const move = sanResult.move;
        if ((move == null ? void 0 : move.from) && (move == null ? void 0 : move.to)) {
          this._processMoveSuccess(move.from, move.to);
        } else {
          const fen = sanResult.fen ?? this.rules.getFEN();
          this.setFEN(fen, true);
        }
        return true;
      }
    }
    const parsed = this._parseCoordinateNotation(sanitizedNotation);
    if (!parsed) {
      return false;
    }
    return this.attemptMove(parsed.from, parsed.to, { promotion: parsed.promotion });
  }
  attemptMove(from, to, options = {}) {
    const outcome = this._attemptMove(from, to, options);
    return outcome !== false;
  }
  undoMove(immediate = false) {
    var _a, _b;
    const previousState = this.state;
    const undone = this.rules.undo();
    if (!undone) {
      return false;
    }
    this._cancelPendingPromotion();
    this._pendingPromotion = null;
    (_a = this.drawingManager) == null ? void 0 : _a.clearPromotionPreview();
    const fen = this.rules.getFEN();
    const newState = this._parseFEN(fen);
    this.state = newState;
    this._syncOrientationFromTurn(false);
    this._lastMove = null;
    this._clearInteractionState();
    this._premove = null;
    (_b = this.drawingManager) == null ? void 0 : _b.clearPremove();
    if (immediate || !this.showAnimations || this.animationMs <= 0) {
      this._clearAnimation();
      this.renderAll();
    } else {
      this._animateTo(newState, previousState);
    }
    this._emitUpdateEvent();
    return true;
  }
  // ============================================================================
  // Public API - PGN Management
  // ============================================================================
  exportPGN() {
    if (typeof this.rules.toPgn === "function") {
      return this.rules.toPgn(true);
    }
    if (this.rules.getPGN) {
      return this.rules.getPGN();
    }
    console.warn("[NeoChessBoard] The current rules adapter does not support PGN export.");
    return "";
  }
  loadPgnWithAnnotations(pgnString) {
    try {
      const success = this._loadPgnInRules(pgnString);
      if (success) {
        this._displayPgnAnnotations(pgnString);
        this._updateStateAfterPgnLoad();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading PGN with annotations:", error);
      return false;
    }
  }
  exportPgnWithAnnotations() {
    var _a, _b;
    const pgnNotation = this._getPgnNotation();
    if (pgnNotation && typeof pgnNotation.toPgnWithAnnotations === "function") {
      return pgnNotation.toPgnWithAnnotations();
    }
    return ((_b = (_a = this.rules).toPgn) == null ? void 0 : _b.call(_a)) ?? "";
  }
  addAnnotationsToCurrentMove(arrows = [], circles = [], comment = "") {
    if (!this.drawingManager) return;
    this._saveAnnotationsToPgn(arrows, circles, comment);
    this._displayAnnotations(arrows, circles);
    this.renderAll();
  }
  // ============================================================================
  // Public API - Visual Configuration
  // ============================================================================
  setTheme(theme) {
    this.applyTheme(theme);
  }
  applyTheme(theme) {
    this.theme = resolveTheme(theme);
    this._rasterize();
    this.renderAll();
  }
  async setPieceSet(pieceSet) {
    if (this._shouldClearPieceSet(pieceSet)) {
      this._clearPieceSet();
      return;
    }
    if (pieceSet === this._pieceSetRaw) {
      return;
    }
    await this._loadPieceSet(pieceSet);
  }
  setOrientation(orientation) {
    this.orientation = orientation;
    if (this.drawingManager) {
      this.drawingManager.setOrientation(orientation);
    }
    this.renderAll();
  }
  // ============================================================================
  // Public API - Feature Toggles
  // ============================================================================
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    this.audioManager.setEnabled(enabled);
  }
  setSoundUrls(soundUrls) {
    this.audioManager.setSoundUrls(soundUrls);
  }
  setAutoFlip(autoFlip) {
    this.autoFlip = autoFlip;
    if (autoFlip) {
      this._syncOrientationFromTurn(!this.drawingManager);
    }
  }
  setAnimationDuration(duration) {
    if (typeof duration !== "number" || !Number.isFinite(duration)) {
      return;
    }
    this.animationMs = Math.max(0, duration);
  }
  setShowAnimations(show) {
    this.showAnimations = show;
    if (!show) {
      this._clearAnimation();
      this.renderAll();
    }
  }
  setDraggingEnabled(enabled) {
    var _a;
    if (this.allowDragging === enabled) {
      return;
    }
    this.allowDragging = enabled;
    if (!enabled) {
      this._clearInteractionState();
      this.renderAll();
    }
    (_a = this.eventManager) == null ? void 0 : _a.updatePointerBindings();
  }
  setAllowDragOffBoard(allow) {
    this.allowDragOffBoard = allow;
  }
  setAutoScrollEnabled(allow) {
    this.allowAutoScroll = allow;
    if (!allow) {
      this._scrollContainer = null;
    } else if (this._dragging) {
      this._ensureScrollContainer();
    }
  }
  setCanDragPiece(evaluator) {
    this.canDragPiece = evaluator;
  }
  setDragActivationDistance(distance) {
    if (typeof distance !== "number" || !Number.isFinite(distance)) {
      return;
    }
    this.dragActivationDistance = Math.max(0, distance);
  }
  setBoardStyle(style) {
    this.domManager.setBoardStyle(style);
  }
  setBoardId(id) {
    this.boardId = id ?? void 0;
    if (id && id.length > 0) {
      this.root.id = id;
    } else {
      this.root.removeAttribute("id");
    }
  }
  setSquareStyle(style) {
    this.baseSquareStyle = style ? { ...style } : void 0;
    this.renderAll();
  }
  setLightSquareStyle(style) {
    this.lightSquareStyleOptions = style ? { ...style } : void 0;
    this.renderAll();
  }
  setDarkSquareStyle(style) {
    this.darkSquareStyleOptions = style ? { ...style } : void 0;
    this.renderAll();
  }
  setSquareStyles(styles) {
    if (styles) {
      this.squareStylesMap = Object.entries(styles).reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = { ...value };
        }
        return acc;
      }, {});
    } else {
      this.squareStylesMap = void 0;
    }
    this.renderAll();
  }
  setLightSquareNotationStyle(style) {
    this.lightNotationStyle = style ? { ...style } : void 0;
    this._applyNotationStyles();
    this.renderAll();
  }
  setDarkSquareNotationStyle(style) {
    this.darkNotationStyle = style ? { ...style } : void 0;
    this._applyNotationStyles();
    this.renderAll();
  }
  setAlphaNotationStyle(style) {
    this.alphaNotationStyle = style ? { ...style } : void 0;
    this._applyNotationStyles();
    this.renderAll();
  }
  setNumericNotationStyle(style) {
    this.numericNotationStyle = style ? { ...style } : void 0;
    this._applyNotationStyles();
    this.renderAll();
  }
  setShowNotation(show) {
    this.setShowSquareNames(show);
  }
  setSquareRenderer(renderer) {
    this.customSquareRenderer = renderer;
    if (!renderer) {
      this._clearSquareOverlay();
    }
    this.renderAll();
  }
  setPieceRenderers(renderers) {
    this.customPieceRenderers = renderers ? { ...renderers } : void 0;
    if (!this.customPieceRenderers) {
      this._clearDomPieces();
    }
    this.renderAll();
  }
  setShowArrows(show) {
    this.showArrows = show;
    this.renderAll();
  }
  setShowHighlights(show) {
    this.showHighlights = show;
    this.renderAll();
  }
  setAllowPremoves(allow) {
    this.allowPremoves = allow;
    if (!allow) {
      this.clearPremove();
    }
    this.renderAll();
  }
  setHighlightLegal(highlight) {
    this.highlightLegal = highlight;
    this.renderAll();
  }
  setShowSquareNames(show) {
    this.showSquareNames = show;
    if (this.drawingManager) {
      this.drawingManager.setShowSquareNames(show);
    }
    this.renderAll();
  }
  setAllowDrawingArrows(allow) {
    var _a;
    this.allowDrawingArrows = allow;
    (_a = this.drawingManager) == null ? void 0 : _a.setAllowDrawingArrows(allow);
  }
  setClearArrowsOnClick(clear) {
    var _a;
    this.clearArrowsOnClick = clear;
    (_a = this.drawingManager) == null ? void 0 : _a.setClearArrowsOnClick(clear);
  }
  setArrowOptions(options) {
    var _a;
    this.arrowOptions = options;
    (_a = this.drawingManager) == null ? void 0 : _a.setArrowOptions(options);
    this.renderAll();
  }
  setArrows(arrows) {
    this.controlledArrows = arrows;
    if (!this.drawingManager || typeof arrows === "undefined") {
      return;
    }
    this.drawingManager.setArrows(arrows);
    this.renderAll();
  }
  setOnArrowsChange(handler) {
    this.onArrowsChange = handler;
  }
  // ============================================================================
  // Public API - Drawing Management
  // ============================================================================
  addArrow(arrow) {
    if (!this.drawingManager) return;
    if ("from" in arrow && "to" in arrow) {
      if ("knightMove" in arrow) {
        this.drawingManager.addArrowFromObject(arrow);
      } else {
        this.drawingManager.addArrow(arrow);
      }
      this.renderAll();
    }
  }
  removeArrow(from, to) {
    if (this.drawingManager) {
      this.drawingManager.removeArrow(from, to);
      this.renderAll();
    }
  }
  clearArrows() {
    if (this.drawingManager) {
      this.drawingManager.clearArrows();
      this.renderAll();
    }
  }
  addHighlight(square, type) {
    if (!this.drawingManager) return;
    if (typeof square === "string" && type) {
      this.drawingManager.addHighlight(square, type);
    } else if (typeof square === "object" && "square" in square) {
      this.drawingManager.addHighlightFromObject(square);
    }
    this.renderAll();
  }
  removeHighlight(square) {
    if (this.drawingManager) {
      this.drawingManager.removeHighlight(square);
      this.renderAll();
    }
  }
  clearHighlights() {
    if (this.drawingManager) {
      this.drawingManager.clearHighlights();
      this.renderAll();
    }
  }
  setPremove(premove) {
    if (this.drawingManager && this.allowPremoves) {
      this.drawingManager.setPremoveFromObject(premove);
      this._premove = { ...premove };
      this.renderAll();
    }
  }
  clearPremove() {
    if (this.drawingManager) {
      this.drawingManager.clearPremove();
      this._premove = null;
      this.renderAll();
    }
  }
  getPremove() {
    return this.drawingManager ? this.drawingManager.getPremove() || null : null;
  }
  clearAllDrawings() {
    if (this.drawingManager) {
      this.drawingManager.clearAll();
      this.renderAll();
    }
  }
  exportDrawings() {
    return this.drawingManager ? this.drawingManager.exportState() : null;
  }
  importDrawings(state) {
    if (this.drawingManager) {
      this.drawingManager.importState(state);
      this.renderAll();
    }
  }
  // ============================================================================
  // Public API - Promotion Management
  // ============================================================================
  previewPromotionPiece(piece) {
    if (!this._pendingPromotion || !this.drawingManager) {
      return;
    }
    const { to, color } = this._pendingPromotion;
    if (piece) {
      this.drawingManager.setPromotionPreview(to, color, piece);
    } else {
      this.drawingManager.setPromotionPreview(to, color);
    }
    this.renderAll();
  }
  clearPromotionPreview() {
    if (!this.drawingManager) {
      return;
    }
    this.drawingManager.clearPromotionPreview();
    this.renderAll();
  }
  isPromotionPending() {
    return this._pendingPromotion !== null;
  }
  getPendingPromotion() {
    if (!this._pendingPromotion) {
      return null;
    }
    const { from, to, color, mode } = this._pendingPromotion;
    return { from, to, color, mode };
  }
  // ============================================================================
  // Public API - Event Management
  // ============================================================================
  on(event, handler) {
    return this.bus.on(event, handler);
  }
  registerExtensionPoint(extensionId, event, handler) {
    const state = this._findExtensionState(extensionId);
    if (!state) {
      throw new Error(`No extension with id "${extensionId}" is registered on this board.`);
    }
    return this._registerExtensionHandler(state, event, handler);
  }
  // ============================================================================
  // Public API - Lifecycle
  // ============================================================================
  resize() {
    const dimensions = this._calculateBoardDimensions();
    this._updateCanvasDimensions(dimensions);
    this._updateInternalDimensions(dimensions);
    this._notifyDrawingManagerResize();
    this.renderAll();
  }
  renderAll() {
    this._invokeExtensionHook("onBeforeRender");
    this._drawBoard();
    this._drawPieces();
    this._drawOverlay();
    this._invokeExtensionHook("onAfterRender");
  }
  destroy() {
    var _a;
    this._cancelPendingPromotion();
    (_a = this.eventManager) == null ? void 0 : _a.detach();
    this.domManager.disconnect();
    this._disposeExtensions();
    this.root.innerHTML = "";
    this.domOverlay = void 0;
    this.squareLayer = void 0;
    this.pieceLayer = void 0;
    this.squareElements.clear();
    this.pieceElements.clear();
  }
  // ============================================================================
  // Private - DOM Utilities
  // ============================================================================
  _applyNotationStyles() {
    if (!this.drawingManager) {
      return;
    }
    this.drawingManager.setNotationStyles({
      light: this.lightNotationStyle ?? null,
      dark: this.darkNotationStyle ?? null,
      alpha: this.alphaNotationStyle ?? null,
      numeric: this.numericNotationStyle ?? null
    });
  }
  _rasterize() {
    this.sprites = new FlatSprites(SPRITE_SIZE, this.theme);
  }
  // ============================================================================
  // Private - Dimension Management
  // ============================================================================
  _setBoardGeometry(files, ranks, fileLabels, rankLabels) {
    const geometry = resolveBoardGeometry({
      files,
      ranks,
      fileLabels,
      rankLabels,
      defaultFiles: DEFAULT_BOARD_FILES,
      defaultRanks: DEFAULT_BOARD_RANKS
    });
    this.filesCount = geometry.files;
    this.ranksCount = geometry.ranks;
    this.fileLabels = geometry.fileLabels;
    this.rankLabels = geometry.rankLabels;
  }
  _parseFEN(fen) {
    return parseFEN(fen, { files: this.filesCount, ranks: this.ranksCount });
  }
  _indicesToSquare(file, rank) {
    return sq(file, rank, this.fileLabels, this.rankLabels);
  }
  _squareToIndices(square) {
    return sqToFR(square, this.fileLabels, this.rankLabels);
  }
  _calculateBoardDimensions() {
    const rect = this.root.getBoundingClientRect();
    const availableWidth = rect.width || DEFAULT_BOARD_SIZE;
    const availableHeight = rect.height || DEFAULT_BOARD_SIZE;
    const aspectRatio = this.filesCount / this.ranksCount;
    let cssWidth = availableWidth;
    let cssHeight = cssWidth / aspectRatio;
    if (cssHeight > availableHeight) {
      cssHeight = availableHeight;
      cssWidth = cssHeight * aspectRatio;
    }
    const dpr = globalThis.devicePixelRatio || 1;
    const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
    const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));
    const square = pixelWidth / this.filesCount;
    return { cssWidth, cssHeight, pixelWidth, pixelHeight, dpr, square };
  }
  _updateCanvasDimensions(dimensions) {
    const { pixelWidth, pixelHeight } = dimensions;
    [this.cBoard, this.cPieces, this.cOverlay].forEach((canvas) => {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    });
  }
  _updateInternalDimensions(dimensions) {
    this.sizePx = Math.max(dimensions.cssWidth, dimensions.cssHeight);
    this.dpr = dimensions.dpr;
    this.square = dimensions.square;
  }
  _notifyDrawingManagerResize() {
    if (this.drawingManager) {
      this.drawingManager.updateDimensions({
        files: this.filesCount,
        ranks: this.ranksCount,
        fileLabels: this.fileLabels,
        rankLabels: this.rankLabels
      });
    }
  }
  // ============================================================================
  // Private - Rendering
  // ============================================================================
  _drawBoard() {
    const { light, dark, boardBorder } = this.theme;
    const ctx = this.ctxB;
    const s = this.square;
    const W = this.cBoard.width;
    const H = this.cBoard.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = boardBorder;
    ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < this.ranksCount; r++) {
      for (let f = 0; f < this.filesCount; f++) {
        const square = this._indicesToSquare(f, r);
        const { x, y } = this._calculateSquarePosition(f, r);
        const isLight = (r + f) % 2 === 0;
        const style = this._resolveSquareStyle(square, isLight);
        const fill = style.fill ?? (isLight ? light : dark);
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fillRect(x, y, s, s);
        }
        if (style.stroke) {
          const strokeWidth = style.strokeWidth ?? 1;
          ctx.lineWidth = strokeWidth;
          ctx.strokeStyle = style.stroke;
          const inset = strokeWidth / 2;
          ctx.strokeRect(x + inset, y + inset, s - strokeWidth, s - strokeWidth);
        }
      }
    }
    this._renderSquareOverlays();
  }
  _drawPieces() {
    var _a;
    const ctx = this.ctxP;
    const W = this.cPieces.width;
    const H = this.cPieces.height;
    ctx.clearRect(0, 0, W, H);
    const draggingSq = (_a = this._dragging) == null ? void 0 : _a.from;
    const activeDomPieces = /* @__PURE__ */ new Set();
    const hasCustomPieces = this.customPieceRenderers && Object.keys(this.customPieceRenderers).length > 0;
    if (!hasCustomPieces) {
      this._clearDomPieces();
    }
    for (let r = 0; r < this.ranksCount; r++) {
      for (let f = 0; f < this.filesCount; f++) {
        const piece = this.state.board[r][f];
        if (!piece) continue;
        const square = this._indicesToSquare(f, r);
        const renderer = this._getCustomPieceRenderer(piece);
        if (renderer) {
          if (draggingSq === square) {
            this._removeDomPiece(square);
            continue;
          }
          this._renderDomPiece(square, piece, renderer, activeDomPieces);
          continue;
        }
        this._removeDomPiece(square);
        if (draggingSq === square) {
          continue;
        }
        const { x, y } = this._sqToXY(square);
        this._drawPieceSprite(piece, x, y, 1);
      }
    }
    if (hasCustomPieces) {
      this._cleanupDomPieces(activeDomPieces);
    }
    if (this._dragging) {
      this._drawDraggingPiece();
    }
  }
  _drawDraggingPiece() {
    if (!this._dragging) return;
    const { piece, x, y } = this._dragging;
    this._drawPieceSprite(piece, x - this.square / 2, y - this.square / 2, DRAG_SCALE);
  }
  _getCustomPieceRenderer(piece) {
    if (!this.customPieceRenderers) {
      return void 0;
    }
    return this.customPieceRenderers[piece];
  }
  _renderDomPiece(square, piece, renderer, active) {
    if (!this.pieceLayer) {
      return;
    }
    const element = this._ensurePieceElement(square);
    element.dataset.square = square;
    element.dataset.piece = piece;
    this._positionPieceElement(element, square);
    renderer({ square, piece, element, board: this });
    active.add(square);
  }
  _ensurePieceElement(square) {
    var _a;
    let element = this.pieceElements.get(square);
    if (element) {
      return element;
    }
    const doc = this.root.ownerDocument ?? document;
    element = doc.createElement("div");
    element.dataset.square = square;
    element.style.position = "absolute";
    element.style.left = "0";
    element.style.top = "0";
    element.style.pointerEvents = "none";
    element.style.willChange = "transform";
    (_a = this.pieceLayer) == null ? void 0 : _a.appendChild(element);
    this.pieceElements.set(square, element);
    return element;
  }
  _positionPieceElement(element, square) {
    const size = this.dpr ? this.square / this.dpr : this.square;
    const { x, y } = this._sqToXY(square);
    const cssX = this.dpr ? x / this.dpr : x;
    const cssY = this.dpr ? y / this.dpr : y;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.transform = `translate(${cssX}px, ${cssY}px)`;
  }
  _cleanupDomPieces(active) {
    for (const [square, element] of this.pieceElements.entries()) {
      if (active.has(square)) {
        continue;
      }
      element.remove();
      this.pieceElements.delete(square);
    }
  }
  _removeDomPiece(square) {
    const element = this.pieceElements.get(square);
    if (!element) {
      return;
    }
    element.remove();
    this.pieceElements.delete(square);
  }
  _clearDomPieces() {
    for (const element of this.pieceElements.values()) {
      element.remove();
    }
    this.pieceElements.clear();
  }
  _resolveSquareStyle(square, isLight) {
    var _a;
    const layers = [];
    if (this.baseSquareStyle) {
      layers.push(this.baseSquareStyle);
    }
    const colorStyle = isLight ? this.lightSquareStyleOptions : this.darkSquareStyleOptions;
    if (colorStyle) {
      layers.push(colorStyle);
    }
    const squareSpecific = (_a = this.squareStylesMap) == null ? void 0 : _a[square];
    if (squareSpecific) {
      layers.push(squareSpecific);
    }
    if (layers.length === 0) {
      return {};
    }
    return layers.reduce((acc, style) => ({ ...acc, ...style }), {});
  }
  _renderSquareOverlays() {
    if (!this.squareLayer) {
      return;
    }
    if (!this.customSquareRenderer) {
      this._clearSquareOverlay();
      return;
    }
    const renderer = this.customSquareRenderer;
    for (let r = 0; r < this.ranksCount; r++) {
      for (let f = 0; f < this.filesCount; f++) {
        const square = this._indicesToSquare(f, r);
        const element = this._ensureSquareElement(square);
        this._positionSquareElement(element, square);
        const isLight = (r + f) % 2 === 0;
        renderer({ square, isLight, element, board: this });
      }
    }
  }
  _ensureSquareElement(square) {
    var _a;
    let element = this.squareElements.get(square);
    if (element) {
      return element;
    }
    const doc = this.root.ownerDocument ?? document;
    element = doc.createElement("div");
    element.dataset.square = square;
    element.style.position = "absolute";
    element.style.left = "0";
    element.style.top = "0";
    element.style.pointerEvents = "none";
    element.style.willChange = "transform";
    (_a = this.squareLayer) == null ? void 0 : _a.appendChild(element);
    this.squareElements.set(square, element);
    return element;
  }
  _positionSquareElement(element, square) {
    const size = this.dpr ? this.square / this.dpr : this.square;
    const { x, y } = this._sqToXY(square);
    const cssX = this.dpr ? x / this.dpr : x;
    const cssY = this.dpr ? y / this.dpr : y;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.transform = `translate(${cssX}px, ${cssY}px)`;
  }
  _clearSquareOverlay() {
    if (!this.squareLayer) {
      return;
    }
    this.squareLayer.innerHTML = "";
    this.squareElements.clear();
  }
  _drawPieceSprite(piece, x, y, scale = 1) {
    const custom = this.customPieceSprites[piece];
    if (custom) {
      this._drawCustomPieceSprite(custom, x, y, scale);
      return;
    }
    this._drawDefaultPieceSprite(piece, x, y, scale);
  }
  _drawCustomPieceSprite(sprite, x, y, scale) {
    const spriteScale = scale * (sprite.scale ?? 1);
    const size = this.square * spriteScale;
    const dx = x + (this.square - size) / 2 + sprite.offsetX * this.square;
    const dy = y + (this.square - size) / 2 + sprite.offsetY * this.square;
    this.ctxP.drawImage(sprite.image, dx, dy, size, size);
  }
  _drawDefaultPieceSprite(piece, x, y, scale) {
    const isWhite = isWhitePiece(piece);
    const idx = PIECE_INDEX_MAP[piece.toLowerCase()];
    const sx = idx * SPRITE_SIZE;
    const sy = isWhite ? SPRITE_SIZE : 0;
    const d = this.square * scale;
    const dx = x + (this.square - d) / 2;
    const dy = y + (this.square - d) / 2;
    this.ctxP.drawImage(this.sprites.getSheet(), sx, sy, SPRITE_SIZE, SPRITE_SIZE, dx, dy, d, d);
  }
  _drawOverlay() {
    const ctx = this.ctxO;
    const W = this.cOverlay.width;
    const H = this.cOverlay.height;
    ctx.clearRect(0, 0, W, H);
    this._drawLastMoveHighlight();
    this._drawCustomHighlights();
    this._drawSelectedSquare();
    this._drawLegalMoves();
    this._drawLegacyArrows();
    this._drawPremoveHighlight();
    this._drawHoverHighlight();
    this._drawDrawingManagerElements();
  }
  _drawLastMoveHighlight() {
    if (!this._lastMove) return;
    const { from, to } = this._lastMove;
    const s = this.square;
    const A = this._sqToXY(from);
    const B = this._sqToXY(to);
    this.ctxO.fillStyle = this.theme.lastMove;
    this.ctxO.fillRect(A.x, A.y, s, s);
    this.ctxO.fillRect(B.x, B.y, s, s);
  }
  _drawCustomHighlights() {
    var _a;
    if (!((_a = this._customHighlights) == null ? void 0 : _a.squares)) return;
    this.ctxO.fillStyle = this.theme.moveTo;
    for (const sqr of this._customHighlights.squares) {
      const { x, y } = this._sqToXY(sqr);
      this.ctxO.fillRect(x, y, this.square, this.square);
    }
  }
  _drawSelectedSquare() {
    if (!this._selected) return;
    const { x, y } = this._sqToXY(this._selected);
    this.ctxO.fillStyle = this.theme.moveFrom;
    this.ctxO.fillRect(x, y, this.square, this.square);
  }
  _drawLegalMoves() {
    if (!this.highlightLegal || !this._selected || !this._legalCached) return;
    const s = this.square;
    this.ctxO.fillStyle = this.theme.dot;
    for (const move of this._legalCached) {
      const { x, y } = this._sqToXY(move.to);
      this.ctxO.beginPath();
      this.ctxO.arc(x + s / 2, y + s / 2, s * LEGAL_MOVE_DOT_RADIUS, 0, Math.PI * 2);
      this.ctxO.fill();
    }
  }
  _drawLegacyArrows() {
    for (const arrow of this._arrows) {
      this._drawArrow(arrow.from, arrow.to, arrow.color || this.theme.arrow);
    }
  }
  _drawPremoveHighlight() {
    if (!this._premove) return;
    const s = this.square;
    const A = this._sqToXY(this._premove.from);
    const B = this._sqToXY(this._premove.to);
    this.ctxO.fillStyle = this.theme.premove;
    this.ctxO.fillRect(A.x, A.y, s, s);
    this.ctxO.fillRect(B.x, B.y, s, s);
  }
  _drawHoverHighlight() {
    if (!this._hoverSq || !this._dragging) return;
    const { x, y } = this._sqToXY(this._hoverSq);
    this.ctxO.fillStyle = this.theme.moveTo;
    this.ctxO.fillRect(x, y, this.square, this.square);
  }
  _drawDrawingManagerElements() {
    if (!this.drawingManager) return;
    if (this.showArrows) {
      this.drawingManager.renderArrows();
    }
    if (this.showHighlights) {
      this.drawingManager.renderHighlights();
    }
    if (this.allowPremoves) {
      this.drawingManager.renderPremove();
    }
    this.drawingManager.renderPromotionPreview();
    if (this.showSquareNames) {
      this.drawingManager.renderSquareNames(this.orientation, this.square, this.dpr);
    }
  }
  _drawArrow(from, to, color) {
    const s = this.square;
    const A = this._sqToXY(from);
    const B = this._sqToXY(to);
    this._drawArrowBetween(A.x + s / 2, A.y + s / 2, B.x + s / 2, B.y + s / 2, color);
  }
  _drawArrowBetween(fromX, fromY, toX, toY, color) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;
    const ux = dx / len;
    const uy = dy / len;
    const head = Math.min(MIN_ARROW_HEAD_SIZE * this.dpr, len * ARROW_HEAD_SIZE_FACTOR);
    const thick = Math.max(MIN_ARROW_THICKNESS * this.dpr, this.square * ARROW_THICKNESS_FACTOR);
    const ctx = this.ctxO;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = ARROW_OPACITY;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX - ux * head, toY - uy * head);
    ctx.lineWidth = thick;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - ux * head - uy * head * 0.5, toY - uy * head + ux * head * 0.5);
    ctx.lineTo(toX - ux * head + uy * head * 0.5, toY - uy * head - ux * head * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // ============================================================================
  // Private - Coordinate Conversion
  // ============================================================================
  _sqToXY(square) {
    const { f, r } = this._squareToIndices(square);
    return this._calculateSquarePosition(f, r);
  }
  _calculateSquarePosition(file, rank) {
    const maxFile = this.filesCount - 1;
    const maxRank = this.ranksCount - 1;
    const ff = this.orientation === "white" ? file : maxFile - file;
    const rr = this.orientation === "white" ? maxRank - rank : rank;
    return { x: ff * this.square, y: rr * this.square };
  }
  _xyToSquare(x, y) {
    const maxFile = this.filesCount - 1;
    const maxRank = this.ranksCount - 1;
    const f = clamp(Math.floor(x / this.square), 0, maxFile);
    const r = clamp(Math.floor(y / this.square), 0, maxRank);
    const ff = this.orientation === "white" ? f : maxFile - f;
    const rr = this.orientation === "white" ? maxRank - r : r;
    return this._indicesToSquare(ff, rr);
  }
  _pieceAt(square) {
    var _a;
    const { f, r } = this._squareToIndices(square);
    return ((_a = this.state.board[r]) == null ? void 0 : _a[f]) ?? null;
  }
  // ============================================================================
  // Private - Event Handling
  // ============================================================================
  _emitSquarePointerEvent(type, square, event) {
    const piece = this._pieceAt(square) ?? null;
    const payload = { square, piece, event };
    this.bus.emit(type, payload);
  }
  _emitSquareTransitionEvent(type, square, relatedSquare, event) {
    const piece = this._pieceAt(square) ?? null;
    const payload = {
      square,
      piece,
      relatedSquare,
      event
    };
    this.bus.emit(type, payload);
  }
  _updatePointerSquare(square, event) {
    if (square === this._pointerSquare) {
      return;
    }
    const previous = this._pointerSquare;
    if (previous) {
      this._emitSquareTransitionEvent("squareMouseOut", previous, square, event);
    }
    this._pointerSquare = square;
    if (square) {
      this._emitSquareTransitionEvent("squareMouseOver", square, previous, event);
    }
  }
  _emitPieceDragEvent(event, from, piece, over, pt) {
    this.bus.emit("pieceDrag", {
      from,
      piece,
      over,
      position: pt ? { x: pt.x, y: pt.y } : null,
      event
    });
  }
  _emitPieceDropEvent(event, from, piece, drop, pt) {
    this.bus.emit("pieceDrop", {
      from,
      piece,
      drop,
      position: pt ? { x: pt.x, y: pt.y } : null,
      event
    });
  }
  _handleLeftMouseDown(e) {
    const pt = this._getPointerPosition(e);
    if (!pt) {
      this._updatePointerSquare(null, e);
      return;
    }
    const from = this._xyToSquare(pt.x, pt.y);
    this._updatePointerSquare(from, e);
    this._emitSquarePointerEvent("squareMouseDown", from, e);
    const piece = this._pieceAt(from);
    if (!piece) {
      return;
    }
    const side = isWhitePiece(piece) ? "w" : "b";
    if (side !== this.state.turn && !this.allowPremoves) {
      return;
    }
    if (this.canDragPiece) {
      const currentPosition = fenStringToPositionObject(this.getPosition(), {
        files: this.filesCount,
        ranks: this.ranksCount,
        fileLabels: this.fileLabels,
        rankLabels: this.rankLabels
      });
      const canDrag = this.canDragPiece({
        board: this,
        orientation: this.orientation,
        position: currentPosition,
        square: from,
        piece: { pieceType: piece }
      });
      if (!canDrag) {
        return;
      }
    }
    if (!this._shouldSelectOnPointerDown(from, piece)) {
      this._hoverSq = from;
      this.renderAll();
      return;
    }
    this._setSelection(from, piece);
    this._hoverSq = from;
    this.renderAll();
    if (!this.allowDragging) {
      return;
    }
    this._pendingDrag = {
      from,
      piece,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: pt.x,
      startY: pt.y
    };
    if (this.dragActivationDistance <= 0) {
      this._activatePendingDrag(pt, e);
    }
  }
  _handleLeftMouseUp(e) {
    var _a, _b;
    const pt = this._getPointerPosition(e);
    const square = pt ? this._xyToSquare(pt.x, pt.y) : null;
    if (square) {
      this._updatePointerSquare(square, e);
      this._emitSquarePointerEvent("squareMouseUp", square, e);
    } else {
      this._updatePointerSquare(null, e);
    }
    if ((_a = this.drawingManager) == null ? void 0 : _a.handleMouseUp((pt == null ? void 0 : pt.x) || 0, (pt == null ? void 0 : pt.y) || 0)) {
      this.renderAll();
      this._pendingDrag = null;
      return;
    }
    if (!this._dragging) {
      if ((_b = this.drawingManager) == null ? void 0 : _b.handleLeftClick()) {
        this.renderAll();
      }
      if (square && e.button === 0) {
        this._emitSquarePointerEvent("squareClick", square, e);
        const clickedPiece = this._pieceAt(square);
        if (clickedPiece) {
          this.bus.emit("pieceClick", { square, piece: clickedPiece, event: e });
        }
        if (this.interactive) {
          this._handleClickMove(square);
        }
      }
      this._pendingDrag = null;
      return;
    }
    const dropPoint = pt ?? (!this.allowDragOffBoard && this._dragging ? { x: this._dragging.x, y: this._dragging.y } : null);
    this._handleDragEnd(e, dropPoint);
    this._pendingDrag = null;
  }
  _handleRightMouseDown(e) {
    var _a;
    const pt = this._getPointerPosition(e);
    if (pt) {
      const square = this._xyToSquare(pt.x, pt.y);
      this._updatePointerSquare(square, e);
      this._emitSquarePointerEvent("squareRightClick", square, e);
    } else {
      this._updatePointerSquare(null, e);
    }
    if (pt && ((_a = this.drawingManager) == null ? void 0 : _a.handleRightMouseDown(pt.x, pt.y, e.shiftKey, e.ctrlKey, e.altKey))) {
      this.renderAll();
    }
  }
  _handleRightMouseUp(e) {
    var _a, _b;
    const pt = this._getPointerPosition(e);
    let handled = false;
    if (this.drawingManager && pt) {
      handled = this.drawingManager.handleRightMouseUp(pt.x, pt.y);
    }
    if (!handled && pt) {
      if ((_a = this.drawingManager) == null ? void 0 : _a.getPremove()) {
        this.drawingManager.clearPremove();
        this._premove = null;
        console.log("Premove cancelled by right-click");
        handled = true;
      } else if (this.rightClickHighlights) {
        const square = this._xyToSquare(pt.x, pt.y);
        (_b = this.drawingManager) == null ? void 0 : _b.handleHighlightClick(square, e.shiftKey, e.ctrlKey, e.altKey);
      }
    }
    this.renderAll();
  }
  _handleMouseMove(e, pt) {
    var _a;
    const square = pt ? this._xyToSquare(pt.x, pt.y) : null;
    if (square || this._pointerSquare) {
      this._updatePointerSquare(square, e);
    }
    if (this._pendingDrag && this.allowDragging) {
      const distance = Math.hypot(
        e.clientX - this._pendingDrag.startClientX,
        e.clientY - this._pendingDrag.startClientY
      );
      if (distance >= this.dragActivationDistance) {
        const activationPoint = pt ?? {
          x: this._pendingDrag.startX,
          y: this._pendingDrag.startY
        };
        this._activatePendingDrag(activationPoint, e);
      }
    }
    if (pt && ((_a = this.drawingManager) == null ? void 0 : _a.handleMouseMove(pt.x, pt.y))) {
      this.renderAll();
    }
    if (this._dragging && pt) {
      this._dragging.x = pt.x;
      this._dragging.y = pt.y;
      this._hoverSq = square;
      this._autoScrollDuringDrag(e);
      this._drawPieces();
      this._drawOverlay();
      this._emitPieceDragEvent(e, this._dragging.from, this._dragging.piece, square, pt);
    } else if (this._dragging && !pt) {
      this._autoScrollDuringDrag(e);
      this._emitPieceDragEvent(e, this._dragging.from, this._dragging.piece, null, null);
    } else if (pt && this.interactive) {
      const piece = square ? this._pieceAt(square) : null;
      this._updateCursor(piece ? "pointer" : "default");
    } else if (!pt) {
      this._updateCursor("default");
    }
  }
  _activatePendingDrag(pt, event) {
    if (!this._pendingDrag) {
      return;
    }
    const { from, piece } = this._pendingDrag;
    this._dragging = { from, piece, x: pt.x, y: pt.y };
    this._pendingDrag = null;
    this._hoverSq = this._xyToSquare(pt.x, pt.y);
    if (this.allowAutoScroll) {
      this._ensureScrollContainer();
    }
    this._drawPieces();
    this._drawOverlay();
    this._emitPieceDragEvent(event, from, piece, this._hoverSq, pt);
  }
  _ensureScrollContainer() {
    var _a;
    if (!this.allowAutoScroll) {
      this._scrollContainer = null;
      return;
    }
    if (this._scrollContainer && this._scrollContainer.isConnected) {
      return;
    }
    let element = this.root;
    while (element) {
      const style = (_a = globalThis.getComputedStyle) == null ? void 0 : _a.call(globalThis, element);
      if (style && /(auto|scroll)/.test(`${style.overflow}${style.overflowX}${style.overflowY}`)) {
        this._scrollContainer = element;
        return;
      }
      element = element.parentElement;
    }
    this._scrollContainer = null;
  }
  _autoScrollDuringDrag(e) {
    if (!this.allowAutoScroll || !this._dragging) {
      return;
    }
    this._ensureScrollContainer();
    const container = this._scrollContainer;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const threshold = 32;
    const maxStep = 24;
    const horizontalScrollable = container.scrollWidth > container.clientWidth;
    const verticalScrollable = container.scrollHeight > container.clientHeight;
    let deltaX = 0;
    let deltaY = 0;
    if (horizontalScrollable) {
      const distanceLeft = e.clientX - rect.left;
      const distanceRight = rect.right - e.clientX;
      if (distanceLeft < threshold) {
        deltaX = -Math.min(maxStep, threshold - distanceLeft);
      } else if (distanceRight < threshold) {
        deltaX = Math.min(maxStep, threshold - distanceRight);
      }
    }
    if (verticalScrollable) {
      const distanceTop = e.clientY - rect.top;
      const distanceBottom = rect.bottom - e.clientY;
      if (distanceTop < threshold) {
        deltaY = -Math.min(maxStep, threshold - distanceTop);
      } else if (distanceBottom < threshold) {
        deltaY = Math.min(maxStep, threshold - distanceBottom);
      }
    }
    if (!deltaX && !deltaY) {
      return;
    }
    if (typeof container.scrollBy === "function") {
      container.scrollBy({ left: deltaX, top: deltaY, behavior: "auto" });
    } else {
      container.scrollLeft += deltaX;
      container.scrollTop += deltaY;
    }
  }
  _handleEscapeKey() {
    this._clearInteractionState();
    if (this.drawingManager) {
      this.drawingManager.cancelCurrentAction();
    }
    this.renderAll();
  }
  _handleDragEnd(e, pt) {
    if (!this._dragging) {
      return;
    }
    const dragging = this._dragging;
    const drop = pt ? this._xyToSquare(pt.x, pt.y) : null;
    this._emitPieceDropEvent(e, dragging.from, dragging.piece, drop, pt);
    this._dragging = null;
    this._hoverSq = null;
    if (!drop) {
      this._selected = null;
      this._legalCached = null;
      this.renderAll();
      return;
    }
    if (drop === dragging.from) {
      this.renderAll();
      return;
    }
    this.attemptMove(dragging.from, drop);
  }
  _getPointerPosition(e) {
    const rect = this.cOverlay.getBoundingClientRect();
    const scaleX = rect.width ? this.cOverlay.width / rect.width : 1;
    const scaleY = rect.height ? this.cOverlay.height / rect.height : 1;
    let x = (e.clientX - rect.left) * scaleX;
    let y = (e.clientY - rect.top) * scaleY;
    if (!this.allowDragOffBoard) {
      if (x < 0 || y < 0 || x > this.cOverlay.width || y > this.cOverlay.height) {
        return null;
      }
    } else {
      x = clamp(x, 0, this.cOverlay.width);
      y = clamp(y, 0, this.cOverlay.height);
    }
    return { x, y };
  }
  _updateCursor(cursor) {
    this.cOverlay.style.cursor = cursor;
  }
  // ============================================================================
  // Private - Move Logic
  // ============================================================================
  _parseCoordinateNotation(notation) {
    var _a;
    const cleaned = notation.trim();
    if (!cleaned) return null;
    const match = cleaned.match(
      /^([a-zA-Z]+\d+)\s*(?:-|\s)?\s*([a-zA-Z]+\d+)(?:\s*(?:=)?\s*([qrbnQRBN]))?$/
    );
    if (!match) return null;
    return {
      from: match[1],
      to: match[2],
      promotion: (_a = match[3]) == null ? void 0 : _a.toLowerCase()
    };
  }
  _handleClickMove(target) {
    const from = this._selected;
    if (!from || from === target) {
      if (from === target) {
        this.renderAll();
      }
      return;
    }
    const piece = this._pieceAt(from);
    if (!piece) {
      this._clearSelectionState();
      this.renderAll();
      return;
    }
    const targetPiece = this._pieceAt(target);
    if (targetPiece && isWhitePiece(targetPiece) === isWhitePiece(piece)) {
      this._setSelection(target, targetPiece);
      this.renderAll();
      return;
    }
    this.attemptMove(from, target);
  }
  _attemptMove(from, to, options = {}) {
    var _a;
    if (this._isConflictingWithPendingPromotion(from, to)) {
      return false;
    }
    const piece = this._pieceAt(from);
    if (!piece) return false;
    const side = isWhitePiece(piece) ? "w" : "b";
    const promotion = (_a = options.promotion) == null ? void 0 : _a.toLowerCase();
    if (from === to) {
      this.renderAll();
      return true;
    }
    if (side !== this.state.turn) {
      return this._handlePremoveAttempt(from, to, side, promotion);
    }
    if (this._isPromotionMove(piece, to, side) && !promotion) {
      return this._beginPromotionRequest(from, to, side, "move");
    }
    return this._executeMove(from, to, promotion);
  }
  _isConflictingWithPendingPromotion(from, to) {
    return Boolean(
      this._pendingPromotion && this._pendingPromotion.mode === "move" && (this._pendingPromotion.from !== from || this._pendingPromotion.to !== to)
    );
  }
  _handlePremoveAttempt(from, to, side, promotion) {
    if (!this.allowPremoves) return false;
    const piece = this._pieceAt(from);
    if (this._isPromotionMove(piece, to, side) && !promotion) {
      return this._beginPromotionRequest(from, to, side, "premove");
    }
    this._setPremove(from, to, promotion);
    return true;
  }
  _executeMove(from, to, promotion) {
    const legal = this.rules.move({ from, to, promotion });
    if (legal == null ? void 0 : legal.ok) {
      this._processMoveSuccess(from, to);
      return true;
    }
    this._processMoveFailure(from, to, legal);
    return false;
  }
  _processMoveSuccess(from, to) {
    const fen = this.rules.getFEN();
    const oldState = this.state;
    const newState = this._parseFEN(fen);
    this.state = newState;
    this._syncOrientationFromTurn(false);
    this._clearSelectionState();
    this._lastMove = { from, to };
    if (this.drawingManager) {
      this.drawingManager.clearArrows();
    }
    this.audioManager.playMoveSound(this.state.turn);
    this._animateTo(newState, oldState);
    this._emitMoveEvent(from, to, fen);
    setTimeout(() => {
      this._executePremoveIfValid();
    }, this.animationMs + POST_MOVE_PREMOVE_DELAY);
  }
  _processMoveFailure(from, to, legal) {
    this._clearSelectionState();
    this.renderAll();
    this._emitIllegalMoveEvent(from, to, legal);
  }
  _setPremove(from, to, promotion) {
    if (!this.allowPremoves) return;
    if (this.drawingManager) {
      this.drawingManager.setPremove(from, to, promotion);
    }
    this._premove = promotion ? { from, to, promotion } : { from, to };
    this._clearSelectionState();
    this.renderAll();
  }
  _shouldSelectOnPointerDown(square, piece) {
    if (!this._selected || this._selected === square) {
      return true;
    }
    const current = this._pieceAt(this._selected);
    if (!current) return true;
    const currentIsWhite = isWhitePiece(current);
    const nextIsWhite = isWhitePiece(piece);
    if (currentIsWhite === nextIsWhite) return true;
    const orientationIsWhite = this.orientation === "white";
    return nextIsWhite === orientationIsWhite;
  }
  _setSelection(square, piece) {
    const side = isWhitePiece(piece) ? "w" : "b";
    this._selected = square;
    if (side === this.state.turn) {
      this._legalCached = this.rules.movesFrom(square);
    } else if (this.allowPremoves) {
      this._legalCached = [];
    } else {
      this._legalCached = null;
    }
  }
  // ============================================================================
  // Private - Promotion Logic
  // ============================================================================
  _isPromotionMove(piece, to, side) {
    if (piece.toLowerCase() !== "p") return false;
    if (this.ranksCount <= 0) return false;
    let rankIndex;
    try {
      ({ r: rankIndex } = this._squareToIndices(to));
    } catch {
      return false;
    }
    const promotionRankIndex = side === "w" ? this.ranksCount - 1 : 0;
    return rankIndex === promotionRankIndex;
  }
  _beginPromotionRequest(from, to, color, mode) {
    this._cancelPendingPromotion();
    const token = ++this._promotionToken;
    const pending = {
      token,
      from,
      to,
      color,
      mode,
      request: void 0
    };
    this._pendingPromotion = pending;
    this._clearSelectionState();
    this._dragging = null;
    this.previewPromotionPiece(null);
    const request = {
      from,
      to,
      color,
      mode,
      choices: [...PROMOTION_CHOICES],
      resolve: (choice) => this._resolvePromotion(token, choice),
      cancel: () => this._cancelPromotionRequest(token)
    };
    pending.request = request;
    this._emitPromotionRequest(request);
    return "pending";
  }
  _resolvePromotion(token, piece) {
    const pending = this._pendingPromotion;
    if (!pending || pending.token !== token) return;
    this.previewPromotionPiece(piece);
    const { from, to, mode } = pending;
    this._pendingPromotion = null;
    if (mode === "move") {
      this._attemptMove(from, to, { promotion: piece });
    } else {
      this._setPremove(from, to, piece);
    }
    this.clearPromotionPreview();
  }
  _cancelPromotionRequest(token) {
    const pending = this._pendingPromotion;
    if (!pending || pending.token !== token) return;
    this._pendingPromotion = null;
    this.clearPromotionPreview();
  }
  _cancelPendingPromotion() {
    if (this._pendingPromotion) {
      this._pendingPromotion.request.cancel();
    }
  }
  _emitPromotionRequest(request) {
    if (this.promotionHandler) {
      try {
        const result = this.promotionHandler(request);
        if (result && typeof result.then === "function") {
          void result.catch((error) => {
            console.error("[NeoChessBoard] Promotion handler rejected.", error);
          });
        }
      } catch (error) {
        console.error("[NeoChessBoard] Promotion handler threw an error.", error);
      }
    }
    this.bus.emit("promotion", request);
  }
  // ============================================================================
  // Private - Premove Execution
  // ============================================================================
  _executePremoveIfValid() {
    if (!this.allowPremoves || !this.drawingManager) return;
    const premove = this.drawingManager.getPremove();
    if (!premove) return;
    const premoveResult = this.rules.move({
      from: premove.from,
      to: premove.to,
      promotion: premove.promotion
    });
    if (premoveResult == null ? void 0 : premoveResult.ok) {
      setTimeout(() => {
        this._executePremove(premove);
      }, PREMOVE_EXECUTION_DELAY);
    } else {
      this._clearPremove();
    }
  }
  _executePremove(premove) {
    var _a, _b;
    const newFen = this.rules.getFEN();
    const newState = this._parseFEN(newFen);
    const oldState = this.state;
    this.state = newState;
    this._syncOrientationFromTurn(false);
    this._lastMove = { from: premove.from, to: premove.to };
    (_a = this.drawingManager) == null ? void 0 : _a.clearPremove();
    (_b = this.drawingManager) == null ? void 0 : _b.clearArrows();
    this._premove = null;
    this._animateTo(newState, oldState);
    this._emitMoveEvent(premove.from, premove.to, newFen);
  }
  _clearPremove() {
    var _a;
    (_a = this.drawingManager) == null ? void 0 : _a.clearPremove();
    this._premove = null;
    this.renderAll();
  }
  // ============================================================================
  // Private - Animation
  // ============================================================================
  _clearAnimation() {
    cancelAnimationFrame(this._raf);
    this._raf = 0;
  }
  _animateTo(target, start) {
    this._clearAnimation();
    if (!this.showAnimations || this.animationMs <= 0) {
      this.renderAll();
      return;
    }
    const startTime = performance.now();
    const moving = this._identifyMovingPieces(start, target);
    const tick = () => {
      const progress = clamp((performance.now() - startTime) / this.animationMs, 0, 1);
      const eased = easeOutCubic(progress);
      this._renderAnimationFrame(target, moving, eased);
      if (progress < 1) {
        this._raf = requestAnimationFrame(tick);
      } else {
        this._raf = 0;
        this.renderAll();
      }
    };
    this._raf = requestAnimationFrame(tick);
  }
  _identifyMovingPieces(start, target) {
    const moving = /* @__PURE__ */ new Map();
    for (let r = 0; r < this.ranksCount; r++) {
      for (let f = 0; f < this.filesCount; f++) {
        const startPiece = start.board[r][f];
        const targetPiece = target.board[r][f];
        if (startPiece && (!targetPiece || startPiece !== targetPiece)) {
          const destination = this._findPieceDestination(
            target.board,
            startPiece,
            r,
            f,
            start.board
          );
          if (destination) {
            moving.set(
              this._indicesToSquare(f, r),
              this._indicesToSquare(destination.f, destination.r)
            );
          }
        }
      }
    }
    return moving;
  }
  _renderAnimationFrame(target, moving, progress) {
    const ctx = this.ctxP;
    ctx.clearRect(0, 0, this.cPieces.width, this.cPieces.height);
    for (let r = 0; r < this.ranksCount; r++) {
      for (let f = 0; f < this.filesCount; f++) {
        const targetPiece = target.board[r][f];
        if (!targetPiece) continue;
        const toSq = this._indicesToSquare(f, r);
        const fromKey = this._findMovingPieceSource(moving, toSq);
        if (fromKey) {
          this._drawMovingPiece(fromKey, toSq, targetPiece, progress);
        } else {
          this._drawStationaryPiece(toSq, targetPiece);
        }
      }
    }
    this._drawOverlay();
  }
  _findMovingPieceSource(moving, target) {
    for (const [from, to] of moving.entries()) {
      if (to === target) return from;
    }
    return null;
  }
  _drawMovingPiece(from, to, piece, progress) {
    const { x: fx, y: fy } = this._sqToXY(from);
    const { x: tx, y: ty } = this._sqToXY(to);
    const x = lerp(fx, tx, progress);
    const y = lerp(fy, ty, progress);
    this._drawPieceSprite(piece, x, y, 1);
  }
  _drawStationaryPiece(square, piece) {
    const { x, y } = this._sqToXY(square);
    this._drawPieceSprite(piece, x, y, 1);
  }
  _findPieceDestination(board, piece, r0, f0, start) {
    for (let r = 0; r < this.ranksCount; r++) {
      for (let f = 0; f < this.filesCount; f++) {
        if (board[r][f] === piece && start[r][f] !== piece) {
          return { r, f };
        }
      }
    }
    return null;
  }
  // ============================================================================
  // Private - Sound Management
  // ============================================================================
  // ============================================================================
  // Private - Piece Set Management
  // ============================================================================
  _shouldClearPieceSet(pieceSet) {
    const hasExistingPieces = Boolean(this._pieceSetRaw) || Object.keys(this.customPieceSprites).length > 0;
    return (!pieceSet || !pieceSet.pieces || Object.keys(pieceSet.pieces).length === 0) && hasExistingPieces;
  }
  _clearPieceSet() {
    this._pieceSetRaw = void 0;
    this.customPieceSprites = {};
    this._pieceSetToken++;
    this.renderAll();
  }
  async _loadPieceSet(pieceSet) {
    this._pieceSetRaw = pieceSet;
    const token = ++this._pieceSetToken;
    const defaultScale = pieceSet.defaultScale ?? 1;
    const resolved = {};
    const entries = Object.entries(pieceSet.pieces);
    await Promise.all(
      entries.map(async ([pieceKey, sprite]) => {
        if (!sprite) return;
        try {
          const resolvedSprite = await this._resolvePieceSprite(sprite, defaultScale);
          if (resolvedSprite) {
            resolved[pieceKey] = resolvedSprite;
          }
        } catch (error) {
          console.warn(`[NeoChessBoard] Failed to load sprite for piece "${pieceKey}".`, error);
        }
      })
    );
    if (token !== this._pieceSetToken) return;
    this.customPieceSprites = resolved;
    this.renderAll();
  }
  async _resolvePieceSprite(sprite, defaultScale) {
    const config = typeof sprite === "object" && sprite !== null && "image" in sprite ? sprite : { image: sprite };
    let source = null;
    if (typeof config.image === "string") {
      source = await this._loadImage(config.image);
    } else if (config.image) {
      source = config.image;
    }
    if (!source) return null;
    return {
      image: source,
      scale: config.scale ?? defaultScale ?? 1,
      offsetX: config.offsetX ?? 0,
      offsetY: config.offsetY ?? 0
    };
  }
  _loadImage(src) {
    return new Promise((resolve, reject) => {
      var _a;
      const doc = ((_a = this.root) == null ? void 0 : _a.ownerDocument) ?? (typeof document !== "undefined" ? document : null);
      const img = typeof Image !== "undefined" ? new Image() : doc ? doc.createElement("img") : null;
      if (!img) {
        reject(new Error("Image loading is not supported in the current environment."));
        return;
      }
      if (!src.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }
      try {
        img.decoding = "async";
      } catch (_error) {
      }
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err instanceof Error ? err : new Error(String(err)));
      img.src = src;
    });
  }
  // ============================================================================
  // Private - Extension Management
  // ============================================================================
  _initializeExtensions(configs) {
    this.extensionStates = [];
    if (!configs || configs.length === 0) return;
    configs.forEach((config, index) => {
      const id = config.id ?? `extension-${index + 1}`;
      const state = {
        id,
        config,
        context: null,
        instance: null,
        disposers: [],
        initialized: false,
        destroyed: false
      };
      this.extensionStates.push(state);
      const options = config.options ?? {};
      const context = this._createExtensionContext(state, options);
      state.context = context;
      try {
        const instance = config.create(context);
        state.instance = instance ?? null;
      } catch (error) {
        console.error(`[NeoChessBoard] Failed to create extension "${id}".`, error);
        state.instance = null;
      }
    });
  }
  _createExtensionContext(state, options) {
    return {
      id: state.id,
      board: this,
      bus: this.bus,
      options,
      initialOptions: this.initialOptions,
      registerExtensionPoint: (event, handler) => this._registerExtensionHandler(state, event, handler)
    };
  }
  _registerExtensionHandler(state, event, handler) {
    const off = this.bus.on(event, handler);
    state.disposers.push(off);
    return () => {
      off();
      state.disposers = state.disposers.filter((candidate) => candidate !== off);
    };
  }
  _findExtensionState(extensionId) {
    return this.extensionStates.find((item) => item.id === extensionId);
  }
  _callExtensionHook(state, hook, ...args) {
    if (!state.instance || !state.context) {
      return;
    }
    const fn = state.instance[hook];
    if (typeof fn !== "function") return;
    try {
      fn.apply(state.instance, [state.context, ...args]);
    } catch (error) {
      console.error(`Extension "${state.id}" hook ${String(hook)} failed.`, error);
    }
  }
  _invokeExtensionHook(hook) {
    for (const state of this.extensionStates) {
      if (state.destroyed) continue;
      if (hook === "onInit") {
        if (state.initialized) continue;
        state.initialized = true;
      }
      this._callExtensionHook(state, hook);
    }
  }
  _notifyExtensionEvent(hook, payload) {
    for (const state of this.extensionStates) {
      if (state.destroyed) continue;
      this._callExtensionHook(state, hook, payload);
    }
  }
  _runExtensionDisposers(state) {
    while (state.disposers.length) {
      const disposer = state.disposers.pop();
      if (!disposer) continue;
      try {
        disposer();
      } catch (error) {
        console.error(`Extension "${state.id}" cleanup failed.`, error);
      }
    }
  }
  _disposeExtensions() {
    for (const state of this.extensionStates) {
      if (state.destroyed) continue;
      state.destroyed = true;
      this._callExtensionHook(state, "onDestroy");
      this._runExtensionDisposers(state);
    }
    this.extensionStates = [];
  }
  // ============================================================================
  // Private - PGN & Annotations
  // ============================================================================
  _loadPgnInRules(pgnString) {
    var _a, _b;
    return ((_b = (_a = this.rules).loadPgn) == null ? void 0 : _b.call(_a, pgnString)) ?? false;
  }
  _getPgnNotation() {
    var _a, _b;
    return ((_b = (_a = this.rules).getPgnNotation) == null ? void 0 : _b.call(_a)) ?? null;
  }
  _displayPgnAnnotations(pgnString) {
    const pgnNotation = this._getPgnNotation();
    if (pgnNotation) {
      pgnNotation.loadPgnWithAnnotations(pgnString);
      this._displayAnnotationsFromPgn(pgnNotation);
    }
  }
  _updateStateAfterPgnLoad() {
    this.state = this._parseFEN(this.rules.getFEN());
    this._syncOrientationFromTurn(false);
    this.renderAll();
  }
  _displayAnnotationsFromPgn(pgnNotation) {
    if (!this.drawingManager) return;
    this.drawingManager.clearArrows();
    this.drawingManager.clearHighlights();
    const moves = pgnNotation.getMovesWithAnnotations();
    if (moves.length === 0) return;
    const lastMove = moves[moves.length - 1];
    const totalMoves = moves.reduce(
      (acc, move) => acc + (move.white ? 1 : 0) + (move.black ? 1 : 0),
      0
    );
    let annotationsToShow = null;
    if (totalMoves % 2 === 0 && lastMove.blackAnnotations) {
      annotationsToShow = lastMove.blackAnnotations;
    } else if (totalMoves % 2 === 1 && lastMove.whiteAnnotations) {
      annotationsToShow = lastMove.whiteAnnotations;
    }
    if (annotationsToShow) {
      this._applyAnnotations(annotationsToShow);
    }
  }
  _applyAnnotations(annotations) {
    if (annotations.arrows) {
      for (const arrow of annotations.arrows) {
        this.drawingManager.addArrowFromObject(arrow);
      }
    }
    if (annotations.circles) {
      for (const circle of annotations.circles) {
        this.drawingManager.addHighlightFromObject(circle);
      }
    }
  }
  _saveAnnotationsToPgn(arrows, circles, comment) {
    const pgnNotation = this._getPgnNotation();
    if (!pgnNotation) return;
    const moveHistory = this.rules.history ? this.rules.history() : [];
    const moveCount = moveHistory.length;
    const moveNumber = Math.floor(moveCount / 2) + 1;
    const isWhite = moveCount % 2 === 0;
    pgnNotation.addMoveAnnotations(moveNumber, isWhite, {
      arrows,
      circles,
      textComment: comment
    });
  }
  _displayAnnotations(arrows, circles) {
    for (const arrow of arrows) {
      this.drawingManager.addArrowFromObject(arrow);
    }
    for (const circle of circles) {
      this.drawingManager.addHighlightFromObject(circle);
    }
  }
  // ============================================================================
  // Private - State Management
  // ============================================================================
  _clearInteractionState() {
    this._selected = null;
    this._legalCached = null;
    this._dragging = null;
    this._hoverSq = null;
    this._pendingDrag = null;
  }
  _clearSelectionState() {
    this._selected = null;
    this._legalCached = null;
    this._hoverSq = null;
  }
  _clearAllDrawings() {
    this._customHighlights = null;
    this._arrows = [];
    if (this.drawingManager) {
      if (typeof this.drawingManager.clearAllDrawings === "function") {
        this.drawingManager.clearAllDrawings();
      } else {
        this.drawingManager.clearArrows();
        this.drawingManager.clearHighlights();
        this.drawingManager.clearPremove();
      }
    }
  }
  _resetRulesAdapter() {
    if (typeof this.rules.reset === "function") {
      this.rules.reset();
    } else {
      this.rules.setFEN(START_FEN);
    }
  }
  _syncOrientationFromTurn(initial = false) {
    if (!this.autoFlip) return;
    const desired = this.state.turn === "w" ? "white" : "black";
    if (initial || !this.drawingManager) {
      this.orientation = desired;
      if (this.drawingManager && !initial) {
        this.drawingManager.setOrientation(desired);
      }
      return;
    }
    if (this.orientation !== desired) {
      this.setOrientation(desired);
    }
  }
  // ============================================================================
  // Private - Event Emission
  // ============================================================================
  _emitUpdateEvent() {
    const updatePayload = { fen: this.getPosition() };
    this.bus.emit("update", updatePayload);
    this._notifyExtensionEvent("onUpdate", updatePayload);
  }
  _emitMoveEvent(from, to, fen) {
    const movePayload = { from, to, fen };
    this.bus.emit("move", movePayload);
    this._notifyExtensionEvent("onMove", movePayload);
  }
  _emitIllegalMoveEvent(from, to, legal) {
    const illegalPayload = {
      from,
      to,
      reason: (legal == null ? void 0 : legal.reason) ?? "illegal"
    };
    this.bus.emit("illegal", illegalPayload);
    this._notifyExtensionEvent("onIllegalMove", illegalPayload);
  }
}
export {
  ChessJsRules as C,
  EventBus as E,
  FILES as F,
  NeoChessBoard as N,
  PgnNotation as P,
  RANKS as R,
  START_FEN as S,
  THEMES as T,
  resolveTheme as a,
  FlatSprites as b,
  generateRankLabels as c,
  resolveBoardGeometry as d,
  sq as e,
  getRelativeCoords as f,
  generateFileLabels as g,
  fenStringToPositionObject as h,
  isWhitePiece as i,
  getPositionUpdates as j,
  rowIndexToChessRow as k,
  columnIndexToChessColumn as l,
  chessColumnToColumnIndex as m,
  chessRowToRowIndex as n,
  generateBoard as o,
  parseFEN as p,
  clamp as q,
  registerTheme as r,
  sqToFR as s,
  lerp as t,
  easeOutCubic as u
};
//# sourceMappingURL=NeoChessBoard-BhfuqwVC.js.map
