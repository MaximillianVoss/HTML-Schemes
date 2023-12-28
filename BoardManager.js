import { DrawItem } from './DrawItem.js';
import { Rectangle } from './Rectangle.js';
import { Circle } from './Circle.js';
import { Arrow } from './Arrow.js';
import { Point } from './Point.js';

export class BoardManager {
    constructor( canvasElement ) {
        this.canvas = canvasElement;
        this.items = [];
        this.nextId = 1;
    }

    //#region Геттеры

    // Метод для получения элемента по ID
    getItemById( id ) {
        return this.items.find( item => item.id === id );
    }

    // Метод для получения элемента по индексу
    getItemByIndex( index ) {
        // Проверяем, что индекс находится в пределах массива
        if ( index >= 0 && index < this.items.length ) {
            return this.items[ index ];
        } else {
            console.error( "Index out of bounds" );
            return null;
        }
    }

    // Метод для получения Rectangle по ID
    getRectangleById( id ) {
        const item = this.getItemById( id );
        if ( item instanceof Rectangle ) {
            return item;
        } else {
            console.error( "No rectangle found with id: " + id );
            return null;
        }
    }

    // Метод для получения Circle по ID
    getCircleById( id ) {
        const item = this.getItemById( id );
        if ( item instanceof Circle ) {
            return item;
        } else {
            console.error( "No circle found with id: " + id );
            return null;
        }
    }

    // Метод для получения Rectangle по индексу среди всех Rectangle
    getRectangleByIndex( index ) {
        const rectangles = this.items.filter( item => item instanceof Rectangle );
        if ( index >= 0 && index < rectangles.length ) {
            return rectangles[ index ];
        } else {
            console.error( "No rectangle found at index: " + index );
            return null;
        }
    }

    // Метод для получения Circle по индексу среди всех Circle
    getCircleByIndex( index ) {
        const circles = this.items.filter( item => item instanceof Circle );
        if ( index >= 0 && index < circles.length ) {
            return circles[ index ];
        } else {
            console.error( "No circle found at index: " + index );
            return null;
        }
    }
    //#endregion

    generateUniqueId() {
        return 'DrawItem_' + this.nextId++;
    }

    addItem( item ) {
        if ( item instanceof DrawItem ) {
            item.id = this.generateUniqueId();
            this.items.push( item );
            item.draw();
        } else {
            console.error( "Item must be an instance of DrawItem" );
        }
    }

    createRectangle( x, y, width, height, text ) {
        const points = [
            new Point( x, y ),
            new Point( x + width / 2, y ),
            new Point( x + width, y ),
            new Point( x + width, y + height / 2 ),
            new Point( x + width, y + height ),
            new Point( x + width / 2, y + height ),
            new Point( x, y + height ),
            new Point( x, y + height / 2 )
        ];

        const rectangle = new Rectangle(
            this.generateUniqueId(),
            text, [], points, width, height
        );


        // Для каждой точки создаем Circle и добавляем как дочерний элемент к прямоугольнику
        points.forEach( point => {
            const circle = new Circle(
                this.generateUniqueId(),
                "", [], [ point ], 10 // Диаметр окружности 10 пикселей
            );
            rectangle.addChild( circle ); // Добавляем Circle как дочерний элемент к Rectangle
            //rectangle.coordinates.push( point );
            this.addItem( circle ); // Также добавляем Circle на доску для управления и отрисовки

        } );
        this.addItem( rectangle );
    }

    createConnection( point1, point2 ) {
        const nearestPoint1 = this.findNearestPoint( point1 );
        const nearestPoint2 = this.findNearestPoint( point2 );

        if ( !nearestPoint1 || !nearestPoint2 ) {
            console.error( "No nearby points found for connection!" );
            return;
        }

        const arrow = new Arrow( this.generateUniqueId(), "", [], [ nearestPoint1, nearestPoint2 ], this.canvas );
        this.addItem( arrow );
    }

    findNearestPoint( targetPoint, radius = 15 ) {
        let nearestPoint = null;
        let minDistance = radius;

        this.items.forEach( item => {
            if ( item instanceof Circle ) {
                item.coordinates.forEach( coord => {
                    const distance = Point.distance( coord, targetPoint );
                    if ( distance < minDistance ) {
                        minDistance = distance;
                        nearestPoint = coord;
                    }
                } );
            }
        } );

        return nearestPoint;
    }

    redrawAll() {
        if ( !this.canvas ) {
            console.error( "Canvas element not found!" );
            return;
        }

        const context = this.canvas.getContext( '2d' );
        context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
        this.items.forEach( item => item.draw() );
    }
}