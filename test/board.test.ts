import GameBoard from '../src/board/board'

test('GameBoard coordinates', () => {
    let coord;
    
    coord = GameBoard.getCoordForPos(0)
    expect(coord.x).toBe(10)
    expect(coord.y).toBe(10)
    coord = GameBoard.getCoordForPos(1)
    expect(coord.x).toBe(9)
    expect(coord.y).toBe(10)

    coord = GameBoard.getCoordForPos(10)
    expect(coord.x).toBe(0)
    expect(coord.y).toBe(10)
    coord = GameBoard.getCoordForPos(11)
    expect(coord.x).toBe(0)
    expect(coord.y).toBe(9)

    coord = GameBoard.getCoordForPos(20)
    expect(coord.x).toBe(0)
    expect(coord.y).toBe(0)
    coord = GameBoard.getCoordForPos(21)
    expect(coord.x).toBe(1)
    expect(coord.y).toBe(0)

    coord = GameBoard.getCoordForPos(30)
    expect(coord.x).toBe(10)
    expect(coord.y).toBe(0)
    coord = GameBoard.getCoordForPos(31)
    expect(coord.x).toBe(10)
    expect(coord.y).toBe(1)
})