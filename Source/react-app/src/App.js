import './App.css';

import React from 'react';

class App extends React.Component
{
	render()
	{
		return <GameChessComponent />;
	}
}

class GameChessComponent extends React.Component
{
	constructor()
	{
		super();
		this.gameChessState = new GameChessState();
	}

	clickHandle(event)
	{
		var tdClicked = event.currentTarget;
		var squareClickedXY =
			tdClicked.id.split("_").slice(1).map(x => parseInt(x) );
		var squareClickedX = squareClickedXY[0];
		var squareClickedY = squareClickedXY[1];
		var squareClickedPosInSquares =
			new Coords(squareClickedX, squareClickedY);
		this.gameChessState.clickAtPosInSquaresHandle(squareClickedPosInSquares);

		this.forceUpdate(); // This seems to be considered bad practice?
	}

	render()
	{
		var gameState = this.gameChessState;
		var boardAsStrings = gameState.boardAsStrings;
		var charsPerSquare = gameState.charsPerSquare;

		var trs = [];

		var squarePosInSquares = new Coords();

		for (var y = 0; y < boardAsStrings.length; y++)
		{
			squarePosInSquares.y = y;

			var rowAsString = boardAsStrings[y];

			var tds = [];

			for (var x = 0; x < rowAsString.length / charsPerSquare; x++)
			{
				squarePosInSquares.x = x;

				var td = this.render_SquareAsTdElement
				(
					rowAsString, squarePosInSquares
				);

				tds.push(td);
			}

			var trKey = "tr" + (y);
			var tr = React.createElement("tr", { key: trKey }, tds);
			trs.push(tr);
		}

		var tbody = React.createElement("tbody", null, trs);
		var table = React.createElement("table", null, tbody);

		var returnElement =
		(
			<div className="App">
				<header className="App-header">
					{ table }
				</header>
			</div>
		);

		return returnElement;
	}

	render_SquareAsTdElement(rowAsString, squarePosInSquares)
	{
		var gameState = this.gameChessState;
		var charsPerSquare = gameState.charsPerSquare;
		var x = squarePosInSquares.x;
		var y = squarePosInSquares.y;

		var squareIsSelected =
			gameState.squareAtPosInSquaresIsSelected
			(
				squarePosInSquares
			); 

		var tdClassName =
			squareIsSelected
			? "BoardSquareSelected"
			: ( (y + x) % 2) === 0
			? "BoardSquareWhite"
			: "BoardSquareBlack";

		var squareAsString =
			rowAsString.substr(x * charsPerSquare, charsPerSquare);

		var piecePresentInSquareCode =
			squareAsString.startsWith(".")
			? null
			: squareAsString.substr(0, 2)
			|| "";

		var tdKey = "td_" + x + "_" + y;

		var tdChildren = [];

		if (piecePresentInSquareCode != null)
		{
			var imgSrc = "Images/Pieces/"

			var piecePresentInSquareColorCode =
				piecePresentInSquareCode[0];
			var piecePresentInSquareTypeCode =
				piecePresentInSquareCode[1];

			imgSrc +=
				piecePresentInSquareColorCode === "b"
				? "Black"
				: "White";

			var piecePresentInSquareType =
				GameChessPieceType.byCode(piecePresentInSquareTypeCode);

			imgSrc += "/" + piecePresentInSquareType.name + ".svg";

			var img =
				React.createElement(
					"img",
					{
						key: tdKey,
						src: imgSrc,
						height: "60%",
						width: "60%"
					},
					null
				);

			tdChildren.push(img);
		}

		var td = React.createElement
		(
			"td",
			{
				key: tdKey,
				id: tdKey,
				className: tdClassName,
				onClick: x => this.clickHandle(x)
			},
			tdChildren
		);

		return td;
	}
}

// Classes.

class Coords
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}

	add(other)
	{
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	clone()
	{
		return new Coords(this.x, this.y);
	}

	directions()
	{
		if (this.x !== 0)
		{
			this.x /= Math.abs(this.x);
		}

		if (this.y !== 0)
		{
			this.y /= Math.abs(this.y);
		}

		return this;
	}

	equals(other)
	{
		var areEqual =
			other == null
			? false
			: this.x === other.x && this.y === other.y;

		return areEqual;
	}

	isDiagonal()
	{
		return Math.abs(this.x) === Math.abs(this.y);
	}

	isOrthogonal()
	{
		return (this.x === 0 || this.y === 0);
	}

	isOrthogonalOrDiagonal()
	{
		return (this.isOrthogonal() || this.isDiagonal() );
	}

	subtract(other)
	{
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}
}

class GameChessState
{
	constructor()
	{
		this.charsPerSquare = 3;

		// It's kind of dumb to represent the board like this,
		// but we'll fix it someday.
		this.boardAsStrings =
		[
			"br.bn.bb.bq.bk.bb.bn.br.",
			"bp.bp.bp.bp.bp.bp.bp.bp.",
			"........................",
			"........................",
			"........................",
			"........................",
			"wp.wp.wp.wp.wp.wp.wp.wp.",
			"wr.wn.wb.wq.wk.wb.wn.wr."
		];

		this.squareSelectedPosInSquares = null;

		this.colorToMoveIndex = 1;
	}

	clickAtPosInSquaresHandle(posInSquaresClicked)
	{
		if (this.squareSelectedPosInSquares == null)
		{
			// No piece has been selected yet.

			var squareClickedContainsPiece =
				this.squareAtPosInSquaresHasPiece(posInSquaresClicked);

			if (squareClickedContainsPiece)
			{
				var pieceToSelect = this.pieceAtPosInSquares(posInSquaresClicked);
				var colorToMove = this.colorToMove();
				var pieceToSelectHasRightColorToMove =
					(pieceToSelect.color === colorToMove);
				if (pieceToSelectHasRightColorToMove)
				{
					this.squareSelectAtPosInSquares(posInSquaresClicked);
				}
			}
		}
		else if (this.squareSelectedPosInSquares.equals(posInSquaresClicked) )
		{
			// The selected piece has been clicked again,
			// and will thus be deselected.

			this.squareSelectedClear();
		}
		else
		{
			// A piece has previously been selected,
			// and then a different square was clicked.

			var pieceSelected = this.pieceSelected();

			var pieceSelectedCanMoveToSquareSelected =
				pieceSelected.moveFromSquareAtPosToOtherIsLegal
				(
					this.squareSelectedPosInSquares,
					posInSquaresClicked,
					this
				);

			if (pieceSelectedCanMoveToSquareSelected)
			{
				this.pieceAtPosInSquaresRemove(this.squareSelectedPosInSquares);
				this.pieceAtPosInSquaresRemove(posInSquaresClicked); // todo - If any.
				this.pieceAddAtPosInSquares
				(
					pieceSelected, posInSquaresClicked
				);

				this.colorToMoveAdvance();
			}

			this.squareSelectedClear();

		}
	}

	colorToMove()
	{
		return GameChessPieceColor.Instances()._All[this.colorToMoveIndex]
	}

	colorToMoveAdvance()
	{
		this.colorToMoveIndex = 1 - this.colorToMoveIndex;
		return this.colorToMove();
	}

	pieceAtPosInSquares(posInSquaresToCheck)
	{
		var rowAsString = this.boardAsStrings[posInSquaresToCheck.y];
		var squareAsString = rowAsString.substr
		(
			posInSquaresToCheck.x * this.charsPerSquare,
			this.charsPerSquare - 1
		);

		var piecePresentInSquare = 
			GameChessPiece.fromCode(squareAsString);

		return piecePresentInSquare;
	}

	pieceAtPosInSquaresRemove(posInSquares)
	{
		var rowAsString = this.boardAsStrings[posInSquares.y];
		var squareOffsetInChars =
			posInSquares.x * this.charsPerSquare;
		var rowAsStringWithPieceRemoved =
			rowAsString.substr
			(
				0, 
				squareOffsetInChars
			)
			+ "..."
			+ rowAsString.substr
			(
				squareOffsetInChars + this.charsPerSquare
			);

		this.boardAsStrings[posInSquares.y] = rowAsStringWithPieceRemoved;
	}

	pieceSelected()
	{
		return this.pieceAtPosInSquares(this.squareSelectedPosInSquares);
	}

	pieceAddAtPosInSquares(pieceToAdd, posInSquares)
	{
		var rowAsString = this.boardAsStrings[posInSquares.y];
		var squareOffsetInChars =
			posInSquares.x * this.charsPerSquare;
		var pieceToAddCode = pieceToAdd.code();
		var rowAsStringWithPieceRemoved =
			rowAsString.substr
			(
				0, 
				squareOffsetInChars
			)
			+ pieceToAddCode + "."
			+ rowAsString.substr
			(
				squareOffsetInChars + this.charsPerSquare
			);

		this.boardAsStrings[posInSquares.y] = rowAsStringWithPieceRemoved;
	}

	squareAtPosInSquaresHasPiece(posInSquaresToCheck)
	{
		return (this.pieceAtPosInSquares(posInSquaresToCheck) !== null);
	}

	squareAtPosInSquaresIsSelected(posInSquaresToCheck)
	{
		return posInSquaresToCheck.equals(this.squareSelectedPosInSquares);
	}

	squareSelectAtPosInSquares(posInSquares)
	{
		this.squareSelectedPosInSquares = posInSquares;
	}

	squareSelectedClear()
	{
		this.squareSelectedPosInSquares = null;
	}
}

class GameChessPiece
{
	constructor(color, type)
	{
		this.color = color;
		this.type = type;
	}

	static fromCode(code)
	{
		var colorCode = code[0];
		var typeCode = code[1];

		var color = GameChessPieceColor.byCode(colorCode);
		var type = GameChessPieceType.byCode(typeCode);

		var returnPiece =
			(color == null || type == null)
			? null
			: new GameChessPiece(color, type);

		return returnPiece;
	}

	moveFromSquareAtPosToOtherIsLegal
	(
		posInSquaresFrom, posInSquaresTo, gameState
	)
	{
		var canMove = this.type.moveFromSquarePosToOtherIsLegal
		(
			posInSquaresFrom, posInSquaresTo, gameState
		);

		return canMove;
	}

	code()
	{
		return this.color.code + this.type.code;
	}
}

class GameChessPieceColor
{
	constructor(name, code)
	{
		this.name = name;
		this.code = code;
	}

	static byCode(code)
	{
		return this.Instances().byCode(code);
	}

	static Instances()
	{
		if (this._instances == null)
		{
			this._instances = new GameChessPieceColor_Instances();
		}

		return this._instances;
	}
}

class GameChessPieceColor_Instances
{
	constructor()
	{
		this.Black = new GameChessPieceColor("Black", "b");
		this.White = new GameChessPieceColor("White", "w");

		this._All =
		[
			this.Black,
			this.White
		];
	}

	byCode(code)
	{
		return this._All.find(x => x.code === code);
	}
}

class GameChessPieceType
{
	constructor(name, code, moveFromSquarePosToOtherIsLegal)
	{
		this.name = name;
		this.code = code;
		this._moveFromSquarePosToOtherIsLegal =
			moveFromSquarePosToOtherIsLegal;
	}

	static Instances()
	{
		if (this._instances == null)
		{
			this._instances = new GameChessPieceType_Instances();
		}

		return this._instances;
	}

	static byCode(code)
	{
		return this.Instances().byCode(code);
	}

	static byName(name)
	{
		return this.Instances().byName(name);
	}

	moveFromSquarePosToOtherIsLegal
	(
		posInSquaresFrom, posInSquaresTo, gameState
	)
	{
		return this._moveFromSquarePosToOtherIsLegal
		(
			posInSquaresFrom, posInSquaresTo, gameState
		);
	}

}

class GameChessPieceType_Instances
{
	constructor()
	{
		var gcpt =
			(n, c, imfsptol) =>
				new GameChessPieceType(n, c, imfsptol);

		this.Bishop 	= gcpt("Bishop", 	"b", this.moveFromSquareAtPosToOtherIsLegal_Bishop);
		this.King 		= gcpt("King", 		"k", this.moveFromSquareAtPosToOtherIsLegal_King);
		this.Knight 	= gcpt("Knight", 	"n", this.moveFromSquareAtPosToOtherIsLegal_Knight);
		this.Queen 		= gcpt("Queen", 	"q", this.moveFromSquareAtPosToOtherIsLegal_Queen);
		this.Pawn 		= gcpt("Pawn", 		"p", this.moveFromSquareAtPosToOtherIsLegal_Pawn);
		this.Rook 		= gcpt("Rook", 		"r", this.moveFromSquareAtPosToOtherIsLegal_Rook);

		this._All =
		[
			this.Bishop,
			this.King,
			this.Knight,
			this.Queen,
			this.Pawn,
			this.Rook
		];
	}

	byCode(code)
	{
		return this._All.find(x => x.code === code);
	}

	byName(name)
	{
		return this._All.find(x => x.name === name);
	}

	// Moves.

	static moveDoesNotIntersectOtherPiecesExceptToCapture
	(
		posInSquaresFrom, posInSquaresTo, gameState
	)
	{
		var pieceToMove =
			gameState.pieceAtPosInSquares(posInSquaresFrom);

		var moveIsLegalSoFar = true;

		var displacementToMove =
			posInSquaresTo.clone().subtract(posInSquaresFrom);

		var directionsToMove = displacementToMove.clone().directions();

		var squareToMoveThroughPos = posInSquaresFrom.clone();

		while (squareToMoveThroughPos.equals(posInSquaresTo) === false)
		{
			squareToMoveThroughPos.add(directionsToMove);

			var pieceOnSquareToMoveThrough =
				gameState.pieceAtPosInSquares(squareToMoveThroughPos);

			if (pieceOnSquareToMoveThrough != null)
			{
				var piecesAreSameColor =
					(pieceOnSquareToMoveThrough.color === pieceToMove.color);

				if (piecesAreSameColor)
				{
					moveIsLegalSoFar = false;
				}
				else
				{
					// Only allow move that intersects an opposing piece
					// if the opposing piece is at the very end of the move.
					var squareIsFinalOne =
						squareToMoveThroughPos.equals(posInSquaresTo);

					moveIsLegalSoFar = squareIsFinalOne;
				}
			}
		}

		return moveIsLegalSoFar;
	}


	// Moves - Pieces.

	moveFromSquareAtPosToOtherIsLegal_Bishop
	(
		posInSquaresFrom, posInSquaresTo, gameState
	)
	{
		var pieceToMove =
			gameState.pieceAtPosInSquares(posInSquaresFrom);

		var colorToMove = gameState.colorToMove();
		var pieceToMoveHasRightColorToMove =
			(pieceToMove.color === colorToMove);

		var moveIsLegalSoFar = pieceToMoveHasRightColorToMove;

		if (moveIsLegalSoFar)
		{
			var displacementToMove =
				posInSquaresTo.clone().subtract(posInSquaresFrom);

			moveIsLegalSoFar = displacementToMove.isDiagonal();

			if (moveIsLegalSoFar)
			{
				moveIsLegalSoFar = GameChessPieceType_Instances.moveDoesNotIntersectOtherPiecesExceptToCapture
				(
					posInSquaresFrom, posInSquaresTo, gameState
				);
			}
		}

		return moveIsLegalSoFar;
	}

	moveFromSquareAtPosToOtherIsLegal_King
	(
		posInSquaresFrom, posInSquaresTo, gameState
	)
	{
		var pieceToMove =
			gameState.pieceAtPosInSquares(posInSquaresFrom);

		var colorToMove = gameState.colorToMove();
		var pieceToMoveHasRightColorToMove =
			(pieceToMove.color === colorToMove);

		var moveIsLegalSoFar = pieceToMoveHasRightColorToMove;

		if (moveIsLegalSoFar)
		{
			var displacementToMove =
				posInSquaresTo.clone().subtract(posInSquaresFrom);

			moveIsLegalSoFar = displacementToMove.isOrthogonalOrDiagonal();

			if (moveIsLegalSoFar)
			{
				moveIsLegalSoFar = GameChessPieceType_Instances.moveDoesNotIntersectOtherPiecesExceptToCapture
				(
					posInSquaresFrom, posInSquaresTo, gameState
				);

				if (moveIsLegalSoFar)
				{

					var distanceToMoveIsASingleSquare =
						(Math.abs(displacementToMove.x) < 2)
						&& (Math.abs(displacementToMove.y) < 2);

					moveIsLegalSoFar =
						distanceToMoveIsASingleSquare;
				}

			}
		}

		return moveIsLegalSoFar;
	}

	moveFromSquareAtPosToOtherIsLegal_Knight
	(
		posInSquaresFrom, posInSquaresTo, gameState
	)
	{
		var pieceToMove =
			gameState.pieceAtPosInSquares(posInSquaresFrom);

		var displacementToMove =
			posInSquaresTo.clone().subtract(posInSquaresFrom);

		var moveIsOrthogonalOrDiagonal =
			displacementToMove.isOrthogonalOrDiagonal();

		var moveIsLegalSoFar =
			(moveIsOrthogonalOrDiagonal === false);

		if (moveIsLegalSoFar)
		{
			var distanceToMoveOrthogonally =
				Math.abs(displacementToMove.x)
				+ Math.abs(displacementToMove.y);

			var moveIsWithinRange =
				(distanceToMoveOrthogonally === 3);

			moveIsLegalSoFar = moveIsWithinRange;

			if (moveIsLegalSoFar)
			{
				var pieceOnSquareToMoveThrough =
					gameState.pieceAtPosInSquares(posInSquaresTo);

				if (pieceOnSquareToMoveThrough != null)
				{
					var piecesAreSameColor =
						(pieceOnSquareToMoveThrough.color === pieceToMove.color);

					if (piecesAreSameColor)
					{
						moveIsLegalSoFar = false;
					}
				}
			}
		}

		return moveIsLegalSoFar;
	}

	moveFromSquareAtPosToOtherIsLegal_Queen
	(
		posInSquaresFrom, posInSquaresTo, gameState
	)
	{
		var pieceToMove =
			gameState.pieceAtPosInSquares(posInSquaresFrom);

		var colorToMove = gameState.colorToMove();
		var pieceToMoveHasRightColorToMove =
			(pieceToMove.color === colorToMove);

		var moveIsLegalSoFar = pieceToMoveHasRightColorToMove;

		if (moveIsLegalSoFar)
		{
			var displacementToMove =
				posInSquaresTo.clone().subtract(posInSquaresFrom);

			moveIsLegalSoFar =
				displacementToMove.isOrthogonalOrDiagonal();

			if (moveIsLegalSoFar)
			{
				moveIsLegalSoFar = GameChessPieceType_Instances.moveDoesNotIntersectOtherPiecesExceptToCapture
				(
					posInSquaresFrom, posInSquaresTo, gameState
				);
			}
		}

		return moveIsLegalSoFar;
	}


	moveFromSquareAtPosToOtherIsLegal_Pawn
	(
		posInSquaresFrom, posInSquaresTo, gameState
	)
	{
		// todo - Can't move through pieces, or onto friendly ones.

		// todo - En passant.

		var pieceToMove =
			gameState.pieceAtPosInSquares(posInSquaresFrom);

		var moveIsLegalSoFar =
			pieceToMove !== null
			&& pieceToMove.type === GameChessPieceType.Instances().Pawn;

		if (moveIsLegalSoFar)
		{
			var pieceToMoveColor = pieceToMove.color;
			var pieceToMoveIsBlack =
				(pieceToMoveColor === GameChessPieceColor.Instances().Black);

			var isMovingForward =
				pieceToMoveIsBlack
				? (posInSquaresTo.y > posInSquaresFrom.y)
				: (posInSquaresTo.y < posInSquaresFrom.y);

			if (isMovingForward === false)
			{
				moveIsLegalSoFar = false;
			} 
			else
			{
				var displacementToMove =
					posInSquaresTo.clone().subtract(posInSquaresFrom);

				if (displacementToMove.isOrthogonalOrDiagonal() === false)
				{
					// Pawns may only move orthogonally or diagonally.
					moveIsLegalSoFar = false;
				}
				else if (displacementToMove.isOrthogonal() )
				{
					// Pawns may move directly forward only to empty squares.

					var distanceToMoveForwardInSquares =
						Math.abs(posInSquaresTo.y - posInSquaresFrom.y);

					if (distanceToMoveForwardInSquares > 2)
					{
						// Pawns may never move more than 2 squares forward.
						moveIsLegalSoFar = false;
					}
					else
					{
						if (distanceToMoveForwardInSquares === 2)
						{
							// Pawns may only move as far as two squares forward
							// if still on the starting row.

							var pieceStartingRowIndex =
								pieceToMoveIsBlack
								? 1
								: 6;

							var pieceIsOnStartingRow =
								(posInSquaresFrom.y === pieceStartingRowIndex);

							var canMoveTwoSquares = pieceIsOnStartingRow;

							if (canMoveTwoSquares === false)
							{
								moveIsLegalSoFar = false;
							}
							else
							{
								// todo
							}
						}
						else // if (distanceToMoveForwardInSquares === 1)
						{
							// todo
						}

						if (moveIsLegalSoFar)
						{
							var directionsToMove = displacementToMove.clone().directions();

							var squareToMoveThroughPos = posInSquaresFrom.clone();

							while (squareToMoveThroughPos.equals(posInSquaresTo) === false)
							{
								squareToMoveThroughPos.add(directionsToMove);
							}
						}
					}
				}
				else // if (displacementToMove.isDiagonal() )
				{
					// Pawns move diagonally to capture.

					// todo

				}
			}
		}

		return moveIsLegalSoFar;
	}

	moveFromSquareAtPosToOtherIsLegal_Rook
	(
		posInSquaresFrom, posInSquaresTo, gameState
	)
	{
		var pieceToMove =
			gameState.pieceAtPosInSquares(posInSquaresFrom);

		var colorToMove = gameState.colorToMove();
		var pieceToMoveHasRightColorToMove =
			(pieceToMove.color === colorToMove);

		var moveIsLegalSoFar = pieceToMoveHasRightColorToMove;

		if (moveIsLegalSoFar)
		{
			var displacementToMove =
				posInSquaresTo.clone().subtract(posInSquaresFrom);

			moveIsLegalSoFar = displacementToMove.isOrthogonal();

			if (moveIsLegalSoFar)
			{
				moveIsLegalSoFar = GameChessPieceType_Instances.moveDoesNotIntersectOtherPiecesExceptToCapture
				(
					posInSquaresFrom, posInSquaresTo, gameState
				);
			}
		}

		return moveIsLegalSoFar;
	}
}

export default App;
