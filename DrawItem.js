import { Point } from './Point.js';

export class DrawItem {
    constructor( id, content, children, coordinates, width, height ) {
        this.id = id; // Уникальный идентификатор элемента
        this.content = content; // Содержимое элемента, может быть другим DrawItem
        this.children = children || []; // Массив дочерних элементов
        this.coordinates = []; // Инициализируем пустым массивом
        this.width = width; // Ширина элемента
        this.height = height; // Высота элемента

        // Установка начальных координат, если они предоставлены
        if ( Array.isArray( coordinates ) ) {
            coordinates.forEach( coord => {
                if ( coord instanceof Point ) {
                    this.coordinates.push( coord );
                } else {
                    console.error( 'Invalid coordinate, must be an instance of Point' );
                }
            } );
        }
    }

    printToLog( ...args ) {
        if ( this.isDebug )
            console.log( ...args );
    }

    getX() {
        if ( !this.coordinates || this.coordinates.length == 0 )
            return null;
        return this.coordinates[ 0 ].getX();
    }
    getY() {
        if ( !this.coordinates || this.coordinates.length == 0 )
            return null;
        return this.coordinates[ 0 ].getY();
    }

    setX( x ) {
        if ( this.coordinates && this.coordinates.length > 0 )
            this.coordinates[ 0 ].setX( x );
    }

    setY( y ) {
        if ( this.coordinates && this.coordinates.length > 0 )
            this.coordinates[ 0 ].setY( y );
    }

    // Метод для добавления дочернего элемента
    addChild( child ) {
        this.children.push( child );
    }

    // Метод для добавления координаты
    addCoordinate( point ) {
        if ( point instanceof Point ) {
            this.coordinates.push( point );
        } else {
            console.error( 'Invalid coordinate, must be an instance of Point' );
        }
    }

    // Метод для обновления контента
    updateContent( newContent ) {
        this.content = newContent;
    }

    // Метод для отрисовки элемента. Предполагается, что он будет переопределен в подклассах.
    draw() {
        console.log( 'Drawing an item with id: ' + this.id );
        this.coordinates.forEach( ( coord, index ) => {
            console.log( `Coordinate ${index}: x=${coord.getX()}, y=${coord.getY()}` );
        } );
    }

    // Метод для проверки, содержит ли элемент точку
    containsPoint( x, y ) {
        return (
            x >= this.coordinates[ 0 ].getX() &&
            x <= this.coordinates[ 0 ].getX() + this.width &&
            y >= this.coordinates[ 0 ].getY() &&
            y <= this.coordinates[ 0 ].getY() + this.height
        );
    }

    // Метод для установки новых координат элемента
    setCoordinates( newX, newY ) {
        const deltaX = newX - this.coordinates[ 0 ].getX();
        const deltaY = newY - this.coordinates[ 0 ].getY();
        this.coordinates.forEach( coord => {
            coord.setX( coord.getX() + deltaX );
            coord.setY( coord.getY() + deltaY );
        } );
    }
}
