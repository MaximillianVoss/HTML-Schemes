export class Point {
    constructor( x, y ) {
        this.x = x;
        this.y = y;
    }

    // Метод для получения координаты X
    getX() {
        return this.x;
    }

    // Метод для получения координаты Y
    getY() {
        return this.y;
    }

    // Метод для установки новой координаты X
    setX( newX ) {
        this.x = newX;
    }

    // Метод для установки новой координаты Y
    setY( newY ) {
        this.y = newY;
    }

    // Метод для обновления координат
    setCoordinates( newX, newY ) {
        this.x = newX;
        this.y = newY;
    }

    // Статический метод для вычисления расстояния между двумя точками
    static distance( point1, point2 ) {
        return Math.sqrt( Math.pow( point2.x - point1.x, 2 ) + Math.pow( point2.y - point1.y, 2 ) );
    }
}
