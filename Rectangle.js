import { DrawItem } from './DrawItem.js'; // Импортируйте DrawItem, если он находится в другом файле
import { Point } from './Point.js';

export class Rectangle extends DrawItem {
    constructor( id, content, children, coordinates, width, height, text ) {
        super( id, content, children, coordinates, width, height );
        this.text = text || ''; // Текст внутри прямоугольника
        this.dragging = false; // Состояние перетаскивания
        this.offsetX = 0; // Смещение X
        this.offsetY = 0; // Смещение Y
    }

    onMouseDown( e ) {
        this.dragging = true;
        const rect = e.target.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
    }

    onMouseMove( e ) {
        if ( this.dragging ) {
            const x = e.clientX - this.offsetX;
            const y = e.clientY - this.offsetY;
            //this.printToLog( e.clientX, e.clientY );
            this.setCoordinates( x, y );

            // Предполагается, что children содержат ровно 8 точек
            if ( this.children.length === 8 ) {
                // Здесь мы должны обновить координаты всех восьми точек
                const points = [
                    new Point( x, y ),
                    new Point( x + this.width / 2, y ),
                    new Point( x + this.width, y ),
                    new Point( x + this.width, y + this.height / 2 ),
                    new Point( x + this.width, y + this.height ),
                    new Point( x + this.width / 2, y + this.height ),
                    new Point( x, y + this.height ),
                    new Point( x, y + this.height / 2 )
                ];

                this.children.forEach( ( child, index ) => {
                    if ( child instanceof DrawItem ) {
                        // Переопределяем координаты каждой точки
                        child.setCoordinates( points[ index ].getX(), points[ index ].getY() );
                        // Обновляем позицию точки
                        child.updatePosition();
                    }
                } );
            }
        }
    }



    onMouseUp( e ) {
        this.dragging = false;
    }

    setCoordinates( x, y ) {
        if ( this.coordinates.length > 0 && this.coordinates[ 0 ] instanceof Point ) {
            this.setX( x );
            this.setY( y );
        }
    }

    // Метод для отрисовки прямоугольника
    draw() {
        if ( document.getElementById( this.id ) )
            return;
        // Создаем элемент div
        const customTextbox = document.createElement( 'div' );
        customTextbox.className = 'customTextbox';
        customTextbox.contentEditable = true;
        customTextbox.textContent = this.text;
        customTextbox.id = this.id.toString();

        // Устанавливаем стили
        if ( this.coordinates.length > 0 && this.coordinates[ 0 ] instanceof Point ) {
            customTextbox.style.left = this.coordinates[ 0 ].getX() + 'px';
            customTextbox.style.top = this.coordinates[ 0 ].getY() + 'px';
        }
        customTextbox.style.width = this.width + 'px';
        customTextbox.style.height = this.height + 'px';

        // Устанавливаем обработчик контекстного меню
        customTextbox.oncontextmenu = () => {
            alert( `(<a onclick="scrollToElement('${this.id}');"><i><b>тык</b></i></a>)` );
            return false; // Предотвращаем открытие стандартного контекстного меню
        };

        // Добавление обработчиков событий для перетаскивания
        customTextbox.addEventListener( 'mousedown', this.onMouseDown.bind( this ) );
        document.addEventListener( 'mousemove', this.onMouseMove.bind( this ) );
        document.addEventListener( 'mouseup', this.onMouseUp.bind( this ) );

        // Добавляем элемент в DOM
        document.body.appendChild( customTextbox );
        this.children.forEach( child => {
            if ( child instanceof DrawItem ) {
                child.draw();
            }
        } );
    }

    // Метод для обновления текста
    updateText( newText ) {
        this.text = newText;
        // Обновляем текст в элементе, если он уже отрисован
        const element = document.getElementById( this.id.toString() );
        if ( element ) {
            element.textContent = newText;
        }
    }


}
