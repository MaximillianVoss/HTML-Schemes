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
}
