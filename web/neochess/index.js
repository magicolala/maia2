import { p as parseFEN, S as START_FEN, F as FILES, R as RANKS, i as isWhitePiece, s as sqToFR } from "./NeoChessBoard-BhfuqwVC.js";
import { C, E, b, N, P, T, m, n, q, l, u, h, o, g, c, j, f, t, r, d, a, k, e } from "./NeoChessBoard-BhfuqwVC.js";
function boardToFEN(state) {
  const rows = [];
  for (let r2 = 7; r2 >= 0; r2--) {
    let s = "";
    let e2 = 0;
    for (let f2 = 0; f2 < 8; f2++) {
      const p = state.board[r2][f2];
      if (!p) e2++;
      else {
        if (e2) {
          s += e2;
          e2 = 0;
        }
        s += p;
      }
    }
    if (e2) s += e2;
    rows.push(s);
  }
  return `${rows.join("/")} ${state.turn} ${state.castling || "-"} ${state.ep || "-"} ${state.halfmove || 0} ${state.fullmove || 1}`;
}
class LightRules {
  constructor() {
    this.state = parseFEN(START_FEN);
    this.historyStack = [];
    this.supportsSanMoves = false;
  }
  cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }
  reset() {
    this.state = parseFEN(START_FEN);
    this.historyStack = [];
  }
  setFEN(f2) {
    this.state = parseFEN(f2);
    this.historyStack = [];
  }
  getFEN() {
    return boardToFEN(this.state);
  }
  turn() {
    return this.state.turn;
  }
  pieceAt(square) {
    const f2 = FILES.indexOf(square[0]);
    const r2 = RANKS.indexOf(square[1]);
    return this.state.board[r2][f2];
  }
  movesFrom(square) {
    const p = this.pieceAt(square);
    if (!p) return [];
    const isW = isWhitePiece(p);
    const me = isW ? "w" : "b";
    if (me !== this.state.turn) return [];
    const f0 = FILES.indexOf(square[0]);
    const r0 = RANKS.indexOf(square[1]);
    const occ = (F, R) => this.state.board[R][F];
    const enemy = (pp) => pp && isWhitePiece(pp) !== isW;
    const pushes = [];
    const ray = (df, dr) => {
      let F = f0 + df, R = r0 + dr;
      while (F >= 0 && F < 8 && R >= 0 && R < 8) {
        const t2 = occ(F, R);
        if (!t2) pushes.push({ f: F, r: R });
        else {
          if (enemy(t2)) pushes.push({ f: F, r: R });
          break;
        }
        F += df;
        R += dr;
      }
    };
    switch (p.toLowerCase()) {
      case "p": {
        const dir = isW ? 1 : -1;
        const start = isW ? 1 : 6;
        if (!occ(f0, r0 + dir)) pushes.push({ f: f0, r: r0 + dir });
        if (r0 === start && !occ(f0, r0 + dir) && !occ(f0, r0 + 2 * dir))
          pushes.push({ f: f0, r: r0 + 2 * dir });
        for (const df of [-1, 1]) {
          const F = f0 + df, R = r0 + dir;
          if (F >= 0 && F < 8 && R >= 0 && R < 8) {
            const t2 = occ(F, R);
            if (t2 && enemy(t2)) pushes.push({ f: F, r: R });
          }
        }
        if (this.state.ep && this.state.ep !== "-") {
          const ef = FILES.indexOf(this.state.ep[0]);
          const er = RANKS.indexOf(this.state.ep[1]);
          if (er === r0 + dir && Math.abs(ef - f0) === 1) pushes.push({ f: ef, r: er, ep: true });
        }
        break;
      }
      case "n":
        for (const [df, dr] of [
          [1, 2],
          [2, 1],
          [-1, 2],
          [-2, 1],
          [1, -2],
          [2, -1],
          [-1, -2],
          [-2, -1]
        ]) {
          const F = f0 + df, R = r0 + dr;
          if (F < 0 || F > 7 || R < 0 || R > 7) continue;
          const t2 = occ(F, R);
          if (!t2 || enemy(t2)) pushes.push({ f: F, r: R });
        }
        break;
      case "b":
        ray(1, 1);
        ray(-1, 1);
        ray(1, -1);
        ray(-1, -1);
        break;
      case "r":
        ray(1, 0);
        ray(-1, 0);
        ray(0, 1);
        ray(0, -1);
        break;
      case "q":
        ray(1, 0);
        ray(-1, 0);
        ray(0, 1);
        ray(0, -1);
        ray(1, 1);
        ray(-1, 1);
        ray(1, -1);
        ray(-1, -1);
        break;
      case "k":
        for (let df = -1; df <= 1; df++)
          for (let dr = -1; dr <= 1; dr++) {
            if (!df && !dr) continue;
            const F = f0 + df, R = r0 + dr;
            if (F < 0 || F > 7 || R < 0 || R > 7) continue;
            const t2 = occ(F, R);
            if (!t2 || enemy(t2)) pushes.push({ f: F, r: R });
          }
        break;
    }
    const sq = (f2, r2) => FILES[f2] + RANKS[r2];
    return pushes.map(({ f: f2, r: r2, ep }) => ({
      from: FILES[f0] + RANKS[r0],
      to: sq(f2, r2),
      ...ep ? { captured: "p", ep: true } : {}
    }));
  }
  move(moveData) {
    if (typeof moveData === "string") {
      return { ok: false, reason: "SAN moves are not supported by LightRules" };
    }
    const { from, to, promotion } = moveData;
    const s = this.cloneState(this.state);
    const f0 = FILES.indexOf(from[0]);
    const r0 = RANKS.indexOf(from[1]);
    const f1 = FILES.indexOf(to[0]);
    const r1 = RANKS.indexOf(to[1]);
    const p = s.board[r0][f0];
    if (!p) return { ok: false, reason: "empty" };
    const isW = isWhitePiece(p);
    if (isW && s.turn !== "w" || !isW && s.turn !== "b") return { ok: false, reason: "turn" };
    const legal = this.movesFrom(from).find((m2) => m2.to === to);
    if (!legal) return { ok: false, reason: "illegal" };
    if (legal.ep) {
      const dir = isW ? 1 : -1;
      s.board[r1 - dir][f1] = null;
    }
    s.board[r1][f1] = p;
    s.board[r0][f0] = null;
    if (p.toLowerCase() === "p" && (r1 === 7 || r1 === 0)) {
      const promo = promotion || "q";
      s.board[r1][f1] = isW ? promo.toUpperCase() : promo;
    }
    s.turn = s.turn === "w" ? "b" : "w";
    this.historyStack.push(this.cloneState(this.state));
    this.state = s;
    return { ok: true, fen: boardToFEN(s), state: s };
  }
  undo() {
    const previous = this.historyStack.pop();
    if (!previous) return false;
    this.state = previous;
    return true;
  }
  isDraw() {
    return false;
  }
  isInsufficientMaterial() {
    return false;
  }
  isThreefoldRepetition() {
    return false;
  }
}
class PGNRecorder {
  constructor(adapter) {
    this.adapter = adapter;
    this.moves = [];
    this.headers = {
      Event: "Casual Game",
      Site: "Local",
      Date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "."),
      Round: "1",
      White: "White",
      Black: "Black",
      Result: "*"
    };
  }
  reset() {
    this.moves = [];
  }
  push(move) {
    this.moves.push(move);
  }
  setHeaders(h2) {
    var _a, _b;
    Object.assign(this.headers, h2);
    (_b = (_a = this.adapter) == null ? void 0 : _a.header) == null ? void 0 : _b.call(_a, this.headers);
  }
  setResult(res) {
    this.headers.Result = res;
  }
  getPGN() {
    var _a;
    if ((_a = this.adapter) == null ? void 0 : _a.getPGN) {
      return this.adapter.getPGN();
    }
    const head = Object.entries(this.headers).map(([k2, v]) => `[${k2} "${v}"]`).join("\n");
    let body = "";
    for (let i = 0; i < this.moves.length; i += 2) {
      const n2 = i / 2 + 1;
      const w = this.fmt(this.moves[i]);
      const b2 = this.moves[i + 1] ? this.fmt(this.moves[i + 1]) : "";
      body += `${n2}. ${w}${b2 ? " " + b2 : ""} `;
    }
    return head + "\n\n" + body.trim() + (this.headers.Result ? " " + this.headers.Result : "");
  }
  toBlob() {
    const pgn = this.getPGN();
    return new Blob([pgn], { type: "application/x-chess-pgn" });
  }
  suggestFilename() {
    const safe = (s) => s.replace(/[^a-z0-9_-]+/gi, "_");
    const d2 = (this.headers.Date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).replace(/\./g, "-");
    return `${safe(this.headers.White || "White")}_vs_${safe(this.headers.Black || "Black")}_${d2}.pgn`;
  }
  download(filename = this.suggestFilename()) {
    if (typeof document === "undefined") {
      return;
    }
    const url = URL.createObjectURL(this.toBlob());
    const a2 = document.createElement("a");
    a2.href = url;
    a2.download = filename;
    document.body.appendChild(a2);
    a2.click();
    setTimeout(() => {
      document.body.removeChild(a2);
      URL.revokeObjectURL(url);
    }, 0);
  }
  fmt(m2) {
    const promo = m2.promotion ? `=${m2.promotion.toUpperCase()}` : "";
    return `${m2.from}${m2.captured ? "x" : ""}${m2.to}${promo}`;
  }
}
const arrowKey = (from, to) => `${from}-${to}`;
function createArrowHighlightExtension(config = {}) {
  const { id, ...rest } = config;
  return {
    id: id ?? "arrow-highlight",
    options: rest,
    create(context) {
      const {
        arrows = [],
        highlights = [],
        highlightLastMove = true,
        lastMoveColor,
        persistOnUpdate = true
      } = context.options ?? {};
      const initialArrows = /* @__PURE__ */ new Map();
      const initialHighlights = /* @__PURE__ */ new Map();
      for (const arrow of arrows) {
        initialArrows.set(arrowKey(arrow.from, arrow.to), arrow);
      }
      for (const highlight of highlights) {
        initialHighlights.set(highlight.square, highlight);
      }
      let lastMove = null;
      let replacedInitialArrow = null;
      const applyInitialArrows = (ctx) => {
        initialArrows.forEach((arrow) => {
          ctx.board.addArrow(arrow);
        });
      };
      const applyInitialHighlights = (ctx) => {
        initialHighlights.forEach((highlight) => {
          ctx.board.addHighlight(highlight);
        });
      };
      const clearInitialArrows = (ctx) => {
        initialArrows.forEach((arrow) => {
          ctx.board.removeArrow(arrow.from, arrow.to);
        });
      };
      const clearInitialHighlights = (ctx) => {
        initialHighlights.forEach((highlight) => {
          ctx.board.removeHighlight(highlight.square);
        });
      };
      const clearInitialDrawings = (ctx) => {
        clearInitialHighlights(ctx);
        clearInitialArrows(ctx);
      };
      const applyInitialDrawings = (ctx) => {
        applyInitialArrows(ctx);
        applyInitialHighlights(ctx);
      };
      const clearCurrentLastMove = (ctx, resetState = true) => {
        if (!lastMove) return;
        ctx.board.removeArrow(lastMove.from, lastMove.to);
        if (replacedInitialArrow) {
          ctx.board.addArrow(replacedInitialArrow);
        }
        if (resetState) {
          lastMove = null;
          replacedInitialArrow = null;
        }
      };
      const drawLastMove = (ctx) => {
        if (!lastMove) return;
        ctx.board.addArrow({
          from: lastMove.from,
          to: lastMove.to,
          color: lastMoveColor
        });
      };
      const setLastMove = (ctx, from, to) => {
        if (!highlightLastMove) return;
        clearCurrentLastMove(ctx);
        lastMove = { from, to };
        replacedInitialArrow = initialArrows.get(arrowKey(from, to)) ?? null;
        drawLastMove(ctx);
      };
      return {
        onInit(ctx) {
          applyInitialDrawings(ctx);
          if (persistOnUpdate) {
            ctx.registerExtensionPoint("update", () => {
              if (highlightLastMove && lastMove) {
                clearCurrentLastMove(ctx, false);
              }
              clearInitialDrawings(ctx);
              applyInitialDrawings(ctx);
              if (highlightLastMove && lastMove) {
                replacedInitialArrow = initialArrows.get(arrowKey(lastMove.from, lastMove.to)) ?? null;
                drawLastMove(ctx);
              }
            });
          }
        },
        onMove(ctx, payload) {
          setLastMove(ctx, payload.from, payload.to);
        },
        onDestroy(ctx) {
          if (highlightLastMove) {
            clearCurrentLastMove(ctx);
          }
          clearInitialDrawings(ctx);
        }
      };
    }
  };
}
const DEFAULT_LABELS = {
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight"
};
const DEFAULT_PIECES = ["q", "r", "b", "n"];
function createPromotionDialogExtension(config = {}) {
  const { id, ...options } = config;
  return {
    id: id ?? "promotion-dialog",
    options,
    create(context) {
      const pieces = options.pieces && options.pieces.length > 0 ? options.pieces : DEFAULT_PIECES;
      const root = context.board.getRootElement();
      const doc = root.ownerDocument ?? document;
      let overlay = null;
      let dialog = null;
      let buttons = [];
      let activeRequest = null;
      let detachBus = null;
      let keydownHandler = null;
      const labels = {
        ...DEFAULT_LABELS,
        ...options.labels ?? {}
      };
      const ensureOverlay = () => {
        if (overlay) {
          return;
        }
        overlay = doc.createElement("div");
        overlay.className = options.className ? options.className : "ncb-promotion-overlay";
        Object.assign(overlay.style, {
          position: "absolute",
          inset: "0",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(15, 23, 42, 0.55)",
          zIndex: "30"
        });
        overlay.setAttribute("role", "presentation");
        dialog = doc.createElement("div");
        dialog.className = "ncb-promotion-dialog";
        Object.assign(dialog.style, {
          minWidth: "220px",
          padding: "16px",
          borderRadius: "12px",
          background: "rgba(15, 23, 42, 0.92)",
          color: "#f9fafb",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.45)",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        });
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        const titleText = options.title ?? "Choose a promotion piece";
        const heading = doc.createElement("h2");
        heading.textContent = titleText;
        heading.style.margin = "0";
        heading.style.fontSize = "1.1rem";
        heading.style.fontWeight = "600";
        dialog.appendChild(heading);
        const descriptionText = options.description ?? "Select the piece to complete your pawn promotion.";
        const description = doc.createElement("p");
        description.textContent = descriptionText;
        description.style.margin = "0";
        description.style.fontSize = "0.9rem";
        description.style.opacity = "0.85";
        dialog.appendChild(description);
        const buttonsRow = doc.createElement("div");
        Object.assign(buttonsRow.style, {
          display: "grid",
          gridTemplateColumns: `repeat(${pieces.length}, minmax(0, 1fr))`,
          gap: "8px"
        });
        buttons = pieces.map((piece) => {
          const button = doc.createElement("button");
          button.type = "button";
          button.className = options.buttonClassName ?? "ncb-promotion-button";
          button.textContent = labels[piece];
          Object.assign(button.style, {
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(148, 163, 184, 0.4)",
            background: "rgba(30, 41, 59, 0.8)",
            color: "#f8fafc",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "600",
            transition: "transform 0.12s ease, background 0.12s ease"
          });
          button.addEventListener("mouseenter", () => {
            context.board.previewPromotionPiece(piece);
          });
          button.addEventListener("mouseleave", () => {
            context.board.previewPromotionPiece(null);
          });
          button.addEventListener("focus", () => {
            context.board.previewPromotionPiece(piece);
          });
          button.addEventListener("blur", () => {
            context.board.previewPromotionPiece(null);
          });
          button.addEventListener("click", () => {
            const request = activeRequest;
            if (!request) {
              return;
            }
            request.resolve(piece);
          });
          button.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              const request = activeRequest;
              if (!request) {
                return;
              }
              request.resolve(piece);
            }
          });
          button.addEventListener("pointerdown", () => {
            button.style.transform = "scale(0.97)";
          });
          button.addEventListener("pointerup", () => {
            button.style.transform = "scale(1)";
          });
          button.addEventListener("pointerleave", () => {
            button.style.transform = "scale(1)";
          });
          buttonsRow.appendChild(button);
          return button;
        });
        overlay.addEventListener("click", (event) => {
          if (event.target === overlay && activeRequest) {
            activeRequest.cancel();
          }
        });
        dialog.appendChild(buttonsRow);
        overlay.appendChild(dialog);
        root.appendChild(overlay);
      };
      const detachKeyListener = () => {
        if (!keydownHandler) {
          return;
        }
        const documentRef = (dialog == null ? void 0 : dialog.ownerDocument) ?? doc;
        documentRef.removeEventListener("keydown", keydownHandler);
        keydownHandler = null;
      };
      const closeOverlay = () => {
        if (!overlay) {
          return;
        }
        overlay.style.display = "none";
        overlay.setAttribute("aria-hidden", "true");
        detachKeyListener();
        activeRequest = null;
        context.board.previewPromotionPiece(null);
      };
      const attachKeyListener = () => {
        const documentRef = (dialog == null ? void 0 : dialog.ownerDocument) ?? doc;
        detachKeyListener();
        keydownHandler = (event) => {
          if (event.key === "Escape" && activeRequest) {
            event.stopPropagation();
            activeRequest.cancel();
          }
        };
        documentRef.addEventListener("keydown", keydownHandler);
      };
      const handlePromotionRequest = (request) => {
        ensureOverlay();
        if (!overlay || !dialog) {
          return;
        }
        const originalResolve = request.resolve.bind(request);
        const originalCancel = request.cancel.bind(request);
        request.resolve = ((choice) => {
          request.resolve = originalResolve;
          request.cancel = originalCancel;
          closeOverlay();
          originalResolve(choice);
        });
        request.cancel = (() => {
          request.resolve = originalResolve;
          request.cancel = originalCancel;
          closeOverlay();
          originalCancel();
        });
        activeRequest = request;
        overlay.style.display = "flex";
        overlay.setAttribute("aria-hidden", "false");
        attachKeyListener();
        if (buttons[0]) {
          buttons[0].focus();
        }
      };
      return {
        onInit(ctx) {
          ensureOverlay();
          detachBus = ctx.registerExtensionPoint("promotion", handlePromotionRequest);
        },
        onDestroy() {
          detachKeyListener();
          if (detachBus) {
            detachBus();
            detachBus = null;
          }
          if (overlay && overlay.parentElement) {
            overlay.parentElement.removeChild(overlay);
          }
          overlay = null;
          dialog = null;
          buttons = [];
          activeRequest = null;
        }
      };
    }
  };
}
const PIECE_SYMBOLS = {
  p: "♟",
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  P: "♙",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔"
};
const PIECE_NAMES = {
  p: "pawn",
  r: "rook",
  n: "knight",
  b: "bishop",
  q: "queen",
  k: "king"
};
const BRAILLE_BASE = {
  p: "⠏",
  r: "⠗",
  n: "⠝",
  b: "⠃",
  q: "⠟",
  k: "⠅"
};
const BRAILLE_EMPTY = "⠄";
const DEFAULT_OPTIONS = {
  enableKeyboard: true,
  regionLabel: "Accessible chess controls",
  boardLabel: "Accessible chessboard",
  moveInputLabel: "Enter a move in coordinate notation",
  livePoliteness: "polite"
};
function describeSquare(square, piece) {
  if (!piece) {
    return `Square ${square} is empty.`;
  }
  const color = isWhitePiece(piece) ? "white" : "black";
  const name = PIECE_NAMES[piece.toLowerCase()] ?? "piece";
  return `${color} ${name} on ${square}.`;
}
function brailleForPiece(piece) {
  if (!piece) {
    return BRAILLE_EMPTY;
  }
  const base = BRAILLE_BASE[piece.toLowerCase()];
  if (!base) {
    return BRAILLE_EMPTY;
  }
  return isWhitePiece(piece) ? `⠠${base}` : base;
}
function clampIndex(value) {
  return Math.max(0, Math.min(7, value));
}
function createAccessibilityExtension(config = {}) {
  const { id = "accessibility", ...configOptions } = config;
  return {
    id,
    options: configOptions,
    create(context) {
      const board = context.board;
      const root = board.getRootElement();
      const doc = (root == null ? void 0 : root.ownerDocument) ?? (typeof document !== "undefined" ? document : void 0);
      if (!doc) {
        return {};
      }
      const options = {
        ...DEFAULT_OPTIONS,
        ...context.options
      };
      const cleanup = [];
      const squareCleanup = [];
      const squareButtons = /* @__PURE__ */ new Map();
      const container = options.container ?? doc.createElement("section");
      if (!options.container) {
        cleanup.push(() => {
          container.remove();
        });
      }
      container.classList.add("ncb-accessibility-container");
      container.dataset.accessibilityExtension = "true";
      container.setAttribute("role", "region");
      container.setAttribute("aria-label", options.regionLabel ?? DEFAULT_OPTIONS.regionLabel);
      const statusId = `${id}-status`;
      const statusEl = doc.createElement("div");
      statusEl.classList.add("ncb-a11y-status");
      statusEl.dataset.status = "true";
      statusEl.id = statusId;
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", options.livePoliteness ?? DEFAULT_OPTIONS.livePoliteness);
      statusEl.textContent = "Accessibility controls ready.";
      const grid = doc.createElement("table");
      grid.classList.add("ncb-a11y-grid");
      grid.setAttribute("role", "grid");
      grid.setAttribute("aria-label", options.boardLabel ?? DEFAULT_OPTIONS.boardLabel);
      grid.dataset.boardGrid = "true";
      const gridBody = doc.createElement("tbody");
      grid.appendChild(gridBody);
      const outputsWrapper = doc.createElement("div");
      outputsWrapper.classList.add("ncb-a11y-outputs");
      const fenLabel = doc.createElement("h3");
      fenLabel.textContent = "FEN";
      const fenOutput = doc.createElement("pre");
      fenOutput.dataset.fenOutput = "true";
      fenOutput.setAttribute("aria-live", options.livePoliteness ?? DEFAULT_OPTIONS.livePoliteness);
      fenOutput.classList.add("ncb-a11y-fen");
      const brailleLabel = doc.createElement("h3");
      brailleLabel.textContent = "Braille";
      const brailleOutput = doc.createElement("pre");
      brailleOutput.dataset.brailleOutput = "true";
      brailleOutput.setAttribute(
        "aria-live",
        options.livePoliteness ?? DEFAULT_OPTIONS.livePoliteness
      );
      brailleOutput.classList.add("ncb-a11y-braille");
      const moveListLabel = doc.createElement("h3");
      moveListLabel.textContent = "Moves";
      const moveList = doc.createElement("ol");
      moveList.dataset.moveList = "true";
      moveList.classList.add("ncb-a11y-moves");
      outputsWrapper.append(
        fenLabel,
        fenOutput,
        brailleLabel,
        brailleOutput,
        moveListLabel,
        moveList
      );
      const moveForm = doc.createElement("form");
      moveForm.dataset.moveForm = "true";
      moveForm.classList.add("ncb-a11y-move-form");
      const moveLabel = doc.createElement("label");
      moveLabel.textContent = options.moveInputLabel ?? DEFAULT_OPTIONS.moveInputLabel;
      moveLabel.setAttribute("for", `${id}-move-input`);
      const moveInput = doc.createElement("input");
      moveInput.type = "text";
      moveInput.id = `${id}-move-input`;
      moveInput.name = "move";
      moveInput.autocomplete = "off";
      moveInput.setAttribute("aria-describedby", statusId);
      moveInput.placeholder = "e2e4";
      const moveButton = doc.createElement("button");
      moveButton.type = "submit";
      moveButton.textContent = "Play move";
      moveForm.append(moveLabel, moveInput, moveButton);
      const enableKeyboard = options.enableKeyboard ?? DEFAULT_OPTIONS.enableKeyboard;
      let keyboardEnabled = enableKeyboard;
      let orientation = board.getOrientation();
      let selectedSquare = null;
      let focusedSquare = null;
      const setStatus = (message) => {
        statusEl.textContent = message;
      };
      const clearSquareHandlers = () => {
        while (squareCleanup.length) {
          const disposer = squareCleanup.pop();
          if (disposer) disposer();
        }
        squareButtons.clear();
      };
      const setActiveSquare = (square, focusDom) => {
        if (!keyboardEnabled) {
          return;
        }
        const btn = squareButtons.get(square);
        if (!btn) {
          return;
        }
        for (const [sq, button] of squareButtons.entries()) {
          button.tabIndex = sq === square ? 0 : -1;
        }
        focusedSquare = square;
        if (focusDom) {
          btn.focus();
        }
      };
      const updateSelectionState = () => {
        for (const [sq, button] of squareButtons.entries()) {
          const isSelected = selectedSquare === sq;
          button.setAttribute("aria-pressed", isSelected ? "true" : "false");
          if (isSelected) {
            button.dataset.selected = "true";
          } else {
            delete button.dataset.selected;
          }
        }
      };
      const rebuildGrid = () => {
        clearSquareHandlers();
        gridBody.innerHTML = "";
        let firstSquare = null;
        for (let row = 0; row < 8; row++) {
          const tr = doc.createElement("tr");
          tr.setAttribute("role", "row");
          for (let col = 0; col < 8; col++) {
            const td = doc.createElement("td");
            td.setAttribute("role", "gridcell");
            const fileIndex = orientation === "white" ? col : 7 - col;
            const rankIndex = orientation === "white" ? 7 - row : row;
            const square = `${FILES[fileIndex]}${RANKS[rankIndex]}`;
            const button = doc.createElement("button");
            button.type = "button";
            button.classList.add("ncb-a11y-square");
            button.dataset.square = square;
            button.setAttribute("aria-pressed", "false");
            if (keyboardEnabled) {
              button.tabIndex = -1;
            } else {
              button.tabIndex = -1;
              button.setAttribute("aria-disabled", "true");
            }
            const clickHandler = () => {
              if (!keyboardEnabled) {
                return;
              }
              if (!focusedSquare) {
                setActiveSquare(square, false);
              }
              handleSquareActivation(square);
            };
            button.addEventListener("click", clickHandler);
            squareCleanup.push(() => button.removeEventListener("click", clickHandler));
            if (keyboardEnabled) {
              const keyHandler = (event) => handleKeydown(event, square);
              const focusHandler = () => setActiveSquare(square, false);
              button.addEventListener("keydown", keyHandler);
              button.addEventListener("focus", focusHandler);
              squareCleanup.push(() => button.removeEventListener("keydown", keyHandler));
              squareCleanup.push(() => button.removeEventListener("focus", focusHandler));
            }
            td.appendChild(button);
            tr.appendChild(td);
            squareButtons.set(square, button);
            if (!firstSquare) {
              firstSquare = square;
            }
          }
          gridBody.appendChild(tr);
        }
        if (keyboardEnabled && (focusedSquare || selectedSquare || firstSquare)) {
          setActiveSquare(focusedSquare ?? selectedSquare ?? firstSquare, false);
        }
        updateSelectionState();
      };
      const updateMovesList = (history) => {
        moveList.innerHTML = "";
        for (let i = 0; i < history.length; i += 2) {
          const item = doc.createElement("li");
          const moveNumber = i / 2 + 1;
          const whiteMove = history[i] ?? "";
          const blackMove = history[i + 1];
          item.textContent = blackMove ? `${moveNumber}. ${whiteMove} ${blackMove}` : `${moveNumber}. ${whiteMove}`;
          moveList.appendChild(item);
        }
      };
      const updateBrailleOutput = (boardMatrix) => {
        var _a;
        const lines = [];
        for (let row = 0; row < 8; row++) {
          const rankIndex = orientation === "white" ? 7 - row : row;
          let line = "";
          for (let col = 0; col < 8; col++) {
            const fileIndex = orientation === "white" ? col : 7 - col;
            const piece = ((_a = boardMatrix[rankIndex]) == null ? void 0 : _a[fileIndex]) ?? null;
            line += brailleForPiece(piece);
          }
          lines.push(line);
        }
        brailleOutput.textContent = lines.join("\n");
      };
      const refreshOutputs = () => {
        var _a;
        const nextOrientation = board.getOrientation();
        if (nextOrientation !== orientation) {
          orientation = nextOrientation;
          rebuildGrid();
        }
        const fen = board.getCurrentFEN();
        const parsed = parseFEN(fen);
        fenOutput.textContent = fen;
        fenOutput.setAttribute("aria-label", `FEN ${fen}`);
        fenOutput.dataset.turn = parsed.turn;
        for (const [square, button] of squareButtons.entries()) {
          const { f: f2, r: r2 } = sqToFR(square);
          const piece = ((_a = parsed.board[r2]) == null ? void 0 : _a[f2]) ?? null;
          const symbol = piece ? PIECE_SYMBOLS[piece] ?? PIECE_SYMBOLS[piece.toUpperCase()] : "";
          button.textContent = symbol ?? "";
          if (piece) {
            button.setAttribute("data-piece", piece);
          } else {
            button.removeAttribute("data-piece");
          }
          button.setAttribute("aria-label", describeSquare(square, piece));
        }
        updateSelectionState();
        updateBrailleOutput(parsed.board);
        updateMovesList(board.getMoveHistory());
      };
      const moveFocusBy = (deltaFile, deltaRank, fallbackSquare) => {
        if (!keyboardEnabled) {
          return;
        }
        const current = focusedSquare ?? fallbackSquare;
        const coords = sqToFR(current);
        const nextFile = clampIndex(coords.f + deltaFile);
        const nextRank = clampIndex(coords.r + deltaRank);
        const nextSquare = `${FILES[nextFile]}${RANKS[nextRank]}`;
        setActiveSquare(nextSquare, true);
      };
      const handleKeydown = (event, square) => {
        if (!keyboardEnabled) {
          return;
        }
        const orientationNow = board.getOrientation();
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            moveFocusBy(0, orientationNow === "white" ? 1 : -1, square);
            break;
          case "ArrowDown":
            event.preventDefault();
            moveFocusBy(0, orientationNow === "white" ? -1 : 1, square);
            break;
          case "ArrowLeft":
            event.preventDefault();
            moveFocusBy(orientationNow === "white" ? -1 : 1, 0, square);
            break;
          case "ArrowRight":
            event.preventDefault();
            moveFocusBy(orientationNow === "white" ? 1 : -1, 0, square);
            break;
          case "Enter":
          case " ":
          // Space key
          case "Spacebar":
            event.preventDefault();
            handleSquareActivation(square);
            break;
        }
      };
      const handleSquareActivation = (square) => {
        if (!keyboardEnabled) {
          return;
        }
        if (!selectedSquare) {
          const piece = board.getPieceAt(square);
          if (!piece) {
            setStatus(`Square ${square} is empty.`);
            selectedSquare = null;
            updateSelectionState();
            return;
          }
          selectedSquare = square;
          updateSelectionState();
          setStatus(`Selected ${describeSquare(square, piece)}`);
          return;
        }
        if (selectedSquare === square) {
          selectedSquare = null;
          updateSelectionState();
          setStatus("Selection cleared.");
          return;
        }
        const attemptResult = board.attemptMove(selectedSquare, square);
        if (!attemptResult) {
          setStatus(`Illegal move from ${selectedSquare} to ${square}.`);
        }
        selectedSquare = null;
        updateSelectionState();
        setActiveSquare(square, true);
      };
      const submitHandler = (event) => {
        event.preventDefault();
        const value = moveInput.value;
        if (!value.trim()) {
          return;
        }
        const ok = board.submitMove(value);
        if (ok) {
          moveInput.value = "";
          moveInput.removeAttribute("aria-invalid");
        } else {
          moveInput.setAttribute("aria-invalid", "true");
          setStatus(`Unable to play move "${value.trim()}".`);
        }
      };
      moveForm.addEventListener("submit", submitHandler);
      cleanup.push(() => moveForm.removeEventListener("submit", submitHandler));
      const mount = () => {
        if (!container.contains(statusEl)) {
          container.append(statusEl, grid, outputsWrapper, moveForm);
        }
        if (!options.container) {
          root.appendChild(container);
        }
      };
      const resetSelection = () => {
        selectedSquare = null;
        updateSelectionState();
      };
      return {
        onInit() {
          mount();
          rebuildGrid();
          refreshOutputs();
        },
        onMove(_, payload) {
          resetSelection();
          refreshOutputs();
          const piece = board.getPieceAt(payload.to);
          const description = describeSquare(payload.to, piece);
          setStatus(`Move played: ${payload.from} to ${payload.to}. ${description}`);
          if (keyboardEnabled) {
            setActiveSquare(payload.to, true);
          }
        },
        onUpdate() {
          refreshOutputs();
        },
        onIllegalMove(_, payload) {
          setStatus(`Illegal move from ${payload.from} to ${payload.to}: ${payload.reason}`);
        },
        onDestroy() {
          clearSquareHandlers();
          while (cleanup.length) {
            const disposer = cleanup.pop();
            if (disposer) disposer();
          }
        }
      };
    }
  };
}
export {
  C as ChessJsRules,
  E as EventBus,
  FILES,
  b as FlatSprites,
  LightRules,
  N as NeoChessBoard,
  PGNRecorder,
  P as PgnNotation,
  RANKS,
  START_FEN,
  T as THEMES,
  m as chessColumnToColumnIndex,
  n as chessRowToRowIndex,
  q as clamp,
  l as columnIndexToChessColumn,
  createAccessibilityExtension,
  createArrowHighlightExtension,
  createPromotionDialogExtension,
  u as easeOutCubic,
  h as fenStringToPositionObject,
  o as generateBoard,
  g as generateFileLabels,
  c as generateRankLabels,
  j as getPositionUpdates,
  f as getRelativeCoords,
  isWhitePiece,
  t as lerp,
  parseFEN,
  r as registerTheme,
  d as resolveBoardGeometry,
  a as resolveTheme,
  k as rowIndexToChessRow,
  e as sq,
  sqToFR
};
//# sourceMappingURL=index.js.map
