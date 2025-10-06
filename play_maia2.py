#!/usr/bin/env python3

import argparse
import sys

import chess

from maia2 import inference, model


def load_maia(model_type: str, device: str):
    maia_model = model.from_pretrained(type=model_type, device=device)
    prepared = inference.prepare()
    return maia_model, prepared


def describe_side(board: chess.Board) -> str:
    return "blancs" if board.turn else "noirs"


def print_board(board: chess.Board) -> None:
    print(board)
    print(f"FEN: {board.fen()}")


def print_suggestions(move_probs, win_prob, side_label: str, top_k: int) -> None:
    top_k = max(1, top_k)
    print(f"Probabilite de gain estimee pour les {side_label}: {win_prob:.3f}")
    for idx, (move, prob) in enumerate(list(move_probs.items())[:top_k], start=1):
        print(f"  {idx}. {move} ({prob:.3f})")


def prompt_user(board: chess.Board, move_probs, win_prob, side_label: str, top_k: int):
    while True:
        raw = input("Votre coup (SAN ou UCI, 'suggest', 'undo', 'quit'): ").strip()
        lower = raw.lower()
        if lower in {"quit", "exit"}:
            return None
        if lower == "suggest":
            print_suggestions(move_probs, win_prob, side_label, top_k)
            continue
        if lower == "undo":
            return "undo"
        try:
            move = board.parse_san(raw)
        except ValueError:
            try:
                move = chess.Move.from_uci(lower)
                if move not in board.legal_moves:
                    raise ValueError
            except ValueError:
                print("Coup invalide. Reessayez.")
                continue
        if move not in board.legal_moves:
            print("Coup illegal. Reessayez.")
            continue
        return move


def main():
    parser = argparse.ArgumentParser(description="Console Maia2 simple.")
    parser.add_argument("--mode", choices=["assist", "play"], default="assist", help="assist: suggestions, play: Maia2 joue l'adversaire.")
    parser.add_argument("--ai-color", choices=["white", "black"], default="black", help="Couleur jouee par Maia2 en mode play.")
    parser.add_argument("--white-elo", type=int, default=1500, help="Elo pour les blancs.")
    parser.add_argument("--black-elo", type=int, default=1500, help="Elo pour les noirs.")
    parser.add_argument("--model-type", choices=["rapid", "blitz"], default="rapid")
    parser.add_argument("--device", choices=["cpu", "gpu"], default="cpu")
    parser.add_argument("--top-k", type=int, default=5, help="Nombre de suggestions affichees.")
    args = parser.parse_args()

    try:
        maia_model, prepared = load_maia(args.model_type, args.device)
    except Exception as exc:
        print(f"Impossible de charger Maia2: {exc}", file=sys.stderr)
        sys.exit(1)

    board = chess.Board()
    ai_is_white = args.ai_color == "white"

    print("Session Maia2 lancee. Tapez 'quit' pour sortir.")

    while True:
        print()
        print_board(board)
        if board.is_game_over(claim_draw=True):
            outcome = board.outcome(claim_draw=True)
            if outcome is None:
                print("Partie terminee.")
            else:
                result = outcome.result()
                termination = outcome.termination.name.lower()
                print(f"Partie terminee: {result} ({termination}).")
            break

        side_label = describe_side(board)
        elo_self = args.white_elo if board.turn else args.black_elo
        elo_opponent = args.black_elo if board.turn else args.white_elo

        move_probs, win_prob = inference.inference_each(maia_model, prepared, board.fen(), elo_self, elo_opponent)

        if args.mode == "play":
            ai_turn = (board.turn and ai_is_white) or ((not board.turn) and (not ai_is_white))
        else:
            ai_turn = False

        if ai_turn:
            best_move, best_prob = next(iter(move_probs.items()))
            move = chess.Move.from_uci(best_move)
            board.push(move)
            print_suggestions(move_probs, win_prob, side_label, args.top_k)
            print(f"Maia2 joue {best_move} (proba {best_prob:.3f}).")
            continue

        if args.mode == "assist":
            print_suggestions(move_probs, win_prob, side_label, args.top_k)

        action = prompt_user(board, move_probs, win_prob, side_label, args.top_k)
        if action is None:
            print("Fin de la session.")
            break
        if action == "undo":
            if board.move_stack:
                last_move = board.pop()
                print(f"Dernier coup annule: {board.san(last_move)}")
                if args.mode == "play" and board.move_stack:
                    popped = board.pop()
                    print(f"Coup de Maia2 annule: {board.san(popped)}")
            else:
                print("Aucun coup a annuler.")
            continue

        board.push(action)

    print("Merci d'avoir utilise Maia2.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nSession interrompue.")
