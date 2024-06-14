import board from './Images/Chessboard-480x480px.png';
import white_knight from './Images/Pieces/White/Knight.png';
import './App.css';

import React, { Component } from 'react';

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
		var tdClicked = event.target;
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

				var squareIsSelected =
					gameState.squareAtPosInSquaresIsSelected
					(
						squarePosInSquares
					); 

				var tdClassName =
					squareIsSelected
					? "BoardSquareSelected"
					: ( (y + x) % 2) == 0
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
				var td = React.createElement
				(
					"td",
					{
						key: tdKey,
						id: tdKey,
						className: tdClassName,
						onClick: x => this.clickHandle(x)
					},
					piecePresentInSquareCode
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
}

// Classes.

class Coords
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}

	equals(other)
	{
		var areEqual =
			other == null
			? false
			: this.x == other.x && this.y == other.y;

		return areEqual;
	}
}

class GameChessState
{
	constructor()
	{
		this.charsPerSquare = 3;

		// It's kind of dumb to represent the board like this, but oh well.
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
	}

	clickAtPosInSquaresHandle(posInSquaresClicked)
	{
		if (this.squareSelectedPosInSquares == null)
		{
			var squareClickedContainsPiece =
				this.squareAtPosInSquaresHasPiece(posInSquaresClicked);

			if (squareClickedContainsPiece)
			{
				this.squareSelectAtPosInSquares(posInSquaresClicked);
			}
		}
		else if (this.squareSelectedPosInSquares.equals(posInSquaresClicked) )
		{
			this.squareSelectedClear();
		}
		else
		{
			var pieceSelected = this.pieceSelected();

			var canPieceSelectedMoveToSquareSelected = true; // todo
			if (canPieceSelectedMoveToSquareSelected)
			{
				this.pieceAtPosInSquaresRemove(this.squareSelectedPosInSquares);
				this.pieceAtPosInSquaresRemove(posInSquaresClicked); // todo - If any.
				this.pieceWithCodeAddAtPosInSquares(pieceSelected, posInSquaresClicked);
			}
			this.squareSelectedClear();
		}
	}

	pieceAtPosInSquares(posInSquaresToCheck)
	{
		var rowAsString = this.boardAsStrings[posInSquaresToCheck.y];
		var squareAsString = rowAsString.substr
		(
			posInSquaresToCheck.x * this.charsPerSquare,
			this.charsPerSquare - 1
		);
		return squareAsString;
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

	pieceWithCodeAddAtPosInSquares(pieceCode, posInSquares)
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
			+ pieceCode + "."
			+ rowAsString.substr
			(
				squareOffsetInChars + this.charsPerSquare
			);

		this.boardAsStrings[posInSquares.y] = rowAsStringWithPieceRemoved;
	}

	squareAtPosInSquaresHasPiece(posInSquaresToCheck)
	{
		return (this.pieceAtPosInSquares(posInSquaresToCheck) != "..");
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

export default App;
