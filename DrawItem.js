import { Point } from './Point.js';

export class DrawItem {

    /**
     * Создаёт экземпляр DrawItem.
     * @class
     * @param {number} id - Уникальный идентификатор элемента.
     * @param {string} content - Содержимое элемента, может быть другим DrawItem.
     * @param {DrawItem[]} [children=[]] - Массив дочерних элементов.
     * @param {Point[]} [coordinates=[]] - Массив координат точек элемента.
     * @param {number} width - Ширина элемента.
     * @param {number} height - Высота элемента.
     */
    constructor( id, content, children, coordinates, width, height, isDebug ) {
        this.id = id; // Уникальный идентификатор элемента
        this.content = content; // Содержимое элемента, может быть другим DrawItem
        this.children = children || []; // Массив дочерних элементов
        this.coordinates = []; // Инициализируем пустым массивом
        this.width = width; // Ширина элемента
        this.height = height; // Высота элемента
        this.isSelected = false;
        // Флаг отладки, true - выводим отладочные сообщения в консоль
        // Установка начальных координат, если они предоставлены
        if ( isDebug )
            this.isDebug = isDebug;
        else
            this.isDebug = false;

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

    /**
    * Сериализует элемент в объект данных.
    * @return {object} Объект, представляющий элемент.
    */
    serialize() {
        return {
            type: this.constructor.name, // Сохраняем тип объекта
            id: this.id,
            content: this.content,
            children: this.children.map( child => child.serialize() ), // Рекурсивная сериализация дочерних элементов
            coordinates: this.coordinates.map( coord => coord.serialize() ), // Требует метод serialize в Point
            width: this.width,
            height: this.height,
            isSelected: this.isSelected,
            isDebug: this.isDebug
        };
    }


    /**
     * Воссоздает элемент из объекта данных.
     * @param {object} data Объект, представляющий элемент.
     * @return {DrawItem} Экземпляр DrawItem или его наследника.
     */
    static deserialize( data ) {
        const item = new DrawItem( data.id, data.content, [], [], data.width, data.height, data.isDebug );
        item.isSelected = data.isSelected;
        item.children = data.children.map( childData => DrawItem.deserialize( childData ) ); // Рекурсивное воссоздание дочерних элементов
        item.coordinates = data.coordinates.map( coordData => Point.deserialize( coordData ) ); // Воссоздаем точки
        return item;
    }
    /**
     * Обновляет позицию элемента на странице, а также позиции всех дочерних элементов.
     */
    updatePosition() {
        const element = document.getElementById( this.id );
        if ( element ) {
            element.style.left = this.coordinates[ 0 ].getX() + 'px';
            element.style.top = this.coordinates[ 0 ].getY() + 'px';
        }

        // Обновляем позиции всех дочерних элементов
        this.children.forEach( child => {
            if ( child instanceof DrawItem ) {
                child.updatePosition();
            }
        } );
    }

    /**
     * Возвращает координату X первой точки фигуры.
     * Если массив координат пуст или не существует, возвращает null.
     * @return {number|null} Координата X или null, если координаты отсутствуют.
     */
    getX() {
        if ( !this.coordinates || this.coordinates.length == 0 )
            return null;
        return this.coordinates[ 0 ].getX();
    }

    /**
     * Возвращает координату Y первой точки фигуры.
     * Если массив координат пуст или не существует, возвращает null.
     * @return {number|null} Координата Y или null, если координаты отсутствуют.
     */
    getY() {
        if ( !this.coordinates || this.coordinates.length == 0 )
            return null;
        return this.coordinates[ 0 ].getY();
    }

    /**
        * Устанавливает координату X элемента и обновляет его позицию.
        * @param {number} x - Новое значение координаты X.
        */
    setX( x ) {
        if ( this.coordinates && this.coordinates.length > 0 ) {
            this.coordinates[ 0 ].setX( x );
            this.updatePosition(); // Обновляем позицию элемента
        }
    }

    /**
     * Устанавливает координату Y элемента и обновляет его позицию.
     * @param {number} y - Новое значение координаты Y.
     */
    setY( y ) {
        if ( this.coordinates && this.coordinates.length > 0 ) {
            this.coordinates[ 0 ].setY( y );
            this.updatePosition(); // Обновляем позицию элемента
        }
    }


    /**
     * Добавляет дочерний элемент к текущему элементу.
     * @param {DrawItem} child Экземпляр элемента, который будет добавлен в качестве потомка.
     */
    addChild( child ) {
        this.children.push( child );
    }

    /**
     * Добавляет координату к элементу.
     * Если переданный объект не является экземпляром Point, выводит ошибку в консоль.
     * @param {Point} point Объект точки, который необходимо добавить к координатам элемента.
     */
    addCoordinate( point ) {
        if ( point instanceof Point ) {
            this.coordinates.push( point );
        } else {
            console.error( 'Invalid coordinate, must be an instance of Point' );
        }
    }

    /**
     * Обновляет содержимое элемента новым контентом.
     * @param {string} newContent Новый контент, который будет установлен элементу.
     */
    updateContent( newContent ) {
        this.content = newContent;
    }

    /**
     * Отрисовывает элемент. Должен быть переопределен в подклассах для конкретной отрисовки.
     */
    draw() {
        this.printToLog( 'Drawing an item with id: ' + this.id );
        this.coordinates.forEach( ( coord, index ) => {
            this.printToLog( `Coordinate ${index}: x=${coord.getX()}, y=${coord.getY()}` );
        } );
    }

    /**
     * Проверяет, содержит ли элемент точку с заданными координатами.
     * @param {number} x Координата X точки для проверки.
     * @param {number} y Координата Y точки для проверки.
     * @return {boolean} Возвращает true, если элемент содержит точку, иначе false.
     */
    containsPoint( x, y ) {
        return (
            x >= this.coordinates[ 0 ].getX() &&
            x <= this.coordinates[ 0 ].getX() + this.width &&
            y >= this.coordinates[ 0 ].getY() &&
            y <= this.coordinates[ 0 ].getY() + this.height
        );
    }

    /**
     * Устанавливает новые координаты элемента и обновляет их у всех связанных точек.
     * @param {number} newX Новая координата X элемента.
     * @param {number} newY Новая координата Y элемента.
     */
    setCoordinates( newX, newY ) {
        const deltaX = newX - this.coordinates[ 0 ].getX();
        const deltaY = newY - this.coordinates[ 0 ].getY();
        this.coordinates.forEach( coord => {
            coord.setX( coord.getX() + deltaX );
            coord.setY( coord.getY() + deltaY );
        } );
    }

    /**
    * Удаляет элемент и все его дочерние элементы из DOM.
    */
    removeFromDom() {
        // Удаляем сам элемент из DOM
        const element = document.getElementById( this.id );
        if ( element ) {
            element.parentNode.removeChild( element );
        }

        // Рекурсивно удаляем все дочерние элементы из DOM
        this.children.forEach( child => {
            if ( child instanceof DrawItem ) {
                child.removeFromDom();
            }
        } );
    }

}
