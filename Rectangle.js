import { DrawItem } from './DrawItem.js'; // Импортируйте DrawItem, если он находится в другом файле
import { Point } from './Point.js';
import { Circle } from './Circle.js';
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

    selectChild( child ) {
        if ( child instanceof DrawItem ) {
            var itemIndex = this.children.findIndex( item => item.id === child.id );
            if ( itemIndex === -1 ) {
                console.error( "Элемент для выделения не найден." );
                return;
            }
            this.children[ itemIndex ].isSelected = true;
        }
    }

    // Метод для отрисовки прямоугольника
    draw() {
        if ( document.getElementById( this.id ) )
            return;
        // Создаем элемент div
        const customTextbox = document.createElement( 'div' );
        customTextbox.className = 'customTextbox';
        customTextbox.contentEditable = true; // Позволяет редактировать текст напрямую
        customTextbox.textContent = this.text;
        customTextbox.id = this.id.toString();

        // Устанавливаем стили
        if ( this.coordinates.length > 0 && this.coordinates[ 0 ] instanceof Point ) {
            customTextbox.style.left = this.coordinates[ 0 ].getX() + 'px';
            customTextbox.style.top = this.coordinates[ 0 ].getY() + 'px';
        }
        customTextbox.style.width = this.width + 'px';
        customTextbox.style.height = this.height + 'px';

        // Обработчик контекстного меню (правой кнопки мыши)
        customTextbox.oncontextmenu = ( event ) => {
            event.preventDefault(); // Предотвращаем открытие стандартного контекстного меню
            const newText = prompt( "Введите новый текст для прямоугольника:", this.text ); // Запрашиваем новый текст
            if ( newText !== null && newText !== this.text ) { // Проверяем, что текст изменился
                this.text = newText; // Обновляем текст
                customTextbox.textContent = this.text; // Обновляем отображаемый текст
            }
            return false; // Предотвращаем дальнейшее распространение события
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

    /**
     * Проверяет, содержит ли прямоугольник или его дочерние элементы точку с заданными координатами.
     * @param {number} x Координата X точки для проверки.
     * @param {number} y Координата Y точки для проверки.
     * @return {boolean} Возвращает true, если прямоугольник или один из его дочерних элементов содержит точку, иначе false.
     */
    containsPoint( x, y ) {
        // Проверяем, попадает ли точка в границы прямоугольника
        if (
            x >= this.coordinates[ 0 ].getX() &&
            x <= this.coordinates[ 0 ].getX() + this.width &&
            y >= this.coordinates[ 0 ].getY() &&
            y <= this.coordinates[ 0 ].getY() + this.height
        ) {
            return true;
        }

        // Проверяем, содержит ли любой из дочерних элементов точку
        for ( let child of this.children ) {
            if ( child instanceof DrawItem && child.containsPoint( x, y ) ) {
                return true;
            }
        }

        // Точка не содержится ни в прямоугольнике, ни в его дочерних элементах
        return false;
    }

    /**
        * Преобразует экземпляр Rectangle в объект для сериализации.
        * @return {object} Объект, представляющий Rectangle.
        */
    serialize() {
        return {
            type: 'Rectangle', // Добавляем тип, чтобы при десериализации знать, какой класс использовать
            id: this.id,
            content: this.content, // Это может быть ID другого DrawItem или просто текст
            children: this.children.map( child => child.serialize() ), // Рекурсивная сериализация дочерних элементов
            coordinates: this.coordinates.map( coord => coord.serialize() ), // Сериализация координат
            width: this.width,
            height: this.height,
            text: this.text
            // В этом примере dragging, offsetX и offsetY не сериализуются, так как они, скорее всего, временные и не нужны после перезагрузки
        };
    }


    /**
     * Создает новый экземпляр Rectangle из данных JSON.
     * @param {object} data - Объект с данными для десериализации.
     * @return {Rectangle} Новый экземпляр Rectangle.
     */
    static deserialize( data ) {
        // Проверяем, что предоставленные данные содержат все необходимые свойства
        // if ( !data || !data.id || !data.coordinates || !data.width || !data.height || typeof data.text === 'undefined' ) {
        if ( !data || !data.id || !data.coordinates || !data.width || !data.height ) {
            throw new Error( "Invalid data for Rectangle deserialization" );
        }

        // Преобразуем массив координат данных в массив экземпляров Point
        const points = data.coordinates.map( coord => Point.deserialize( coord ) );
        const children = data.children.map( child => Circle.deserialize( child ) );
        // Создаем новый экземпляр Rectangle с данными из объекта
        var rectangle = new Rectangle( data.id, data.content, children, points, data.width, data.height, data.text );
        // Для каждой точки создаем Circle и добавляем как дочерний элемент к прямоугольнику
        // points.forEach( point => {
        //     const circle = new Circle(
        //         this.generateUniqueId(),
        //         "", [], [ point ], 15 // Диаметр окружности 10 пикселей
        //     );
        //     rectangle.addChild( circle ); // Добавляем Circle как дочерний элемент к Rectangle
        //     //rectangle.coordinates.push( point );
        //     //this.addItem( circle ); // Также добавляем Circle на доску для управления и отрисовки

        // } );
        return rectangle;
    }
}
