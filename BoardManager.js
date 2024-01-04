import { DrawItem } from './DrawItem.js';
import { Rectangle } from './Rectangle.js';
import { Circle } from './Circle.js';
import { Arrow } from './Arrow.js';
import { Point } from './Point.js';

export class BoardManager {
    constructor( canvasElement ) {
        this.isDebug = true;
        this.canvas = canvasElement;
        this.items = [];
        // Массив для хранения текущих выбранных элементов
        this.selectedItems = [];
        this.nextId = 1;
    }

    printToLog( ...args ) {
        if ( this.isDebug )
            console.log( ...args );
    }

    //#region Загрузка/Сохранение
    /**
     * Сериализует текущее состояние доски в JSON.
     * @return {string} JSON-строка, представляющая состояние доски.
     */
    serializeToJson() {
        const boardState = {
            isDebug: this.isDebug,
            // Сериализуем canvas элемент как ID или другой идентификатор, так как нельзя сериализовать DOM элемент напрямую
            canvasId: this.canvas ? this.canvas.id : null,
            items: this.items.map( item => item.serialize() ), // Сериализуем каждый элемент
            selectedItems: this.selectedItems.map( item => item.id ), // Сохраняем только ID выбранных элементов
            nextId: this.nextId
        };

        return JSON.stringify( boardState );
    }


    /**
     * Восстанавливает состояние доски из JSON.
     * @param {string} json JSON-строка, представляющая состояние доски.
     */
    deserializeFromJson( json ) {
        const boardState = JSON.parse( json );
        this.isDebug = boardState.isDebug;
        // Находим и устанавливаем canvas элемент по его ID
        this.canvas = document.getElementById( boardState.canvasId );
        this.items = boardState.items.map( itemData => {
            // Определяем тип элемента и вызываем соответствующий метод deserialize
            switch ( itemData.type ) {
                case 'Rectangle':
                    return Rectangle.deserialize( itemData );
                case 'Circle':
                    return Circle.deserialize( itemData );
                case 'Arrow':
                    // var arrow = Arrow.deserialize( itemData, this.canvas );
                    // this.createConnection( arrow.coordinates[ 0 ], arrow.coordinates[ 1 ] );
                    return Arrow.deserialize( itemData, this.canvas );
                default:
                    return DrawItem.deserialize( itemData );
            }
        } );


        for ( var i = 0; i < this.items.length; i++ ) {
            if ( this.items[ i ] instanceof Arrow ) {
                var start = this.findNearestPoint( this.items[ i ].coordinates[ 0 ] );
                var end = this.findNearestPoint( this.items[ i ].coordinates[ 1 ] );
                this.items[ i ].coordinates[ 0 ] = start;
                this.items[ i ].coordinates[ 1 ] = end;
            }
        }


        // Восстанавливаем выбранные элементы по их ID
        this.selectedItems = boardState.selectedItems.map( itemId => this.getItemById( itemId ) );
        // сброс выделенных элементов
        this.selectedItems = [];

        this.nextId = boardState.nextId;

        // Перерисовка всех элементов на доске после загрузки
        this.redrawAll();
    }

    //#endregion

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

    /**
     * Возвращает массив всех объектов Circle на доске, включая дочерние элементы.
     * @return {Circle[]} Массив всех Circle.
     */
    getAllCircles() {
        const circles = [];
        const checkChildren = ( item ) => {
            // Проверяем, является ли элемент Circle и добавляем его в массив, если да.
            if ( item instanceof Circle ) {
                circles.push( item );
            }
            // Если у элемента есть дочерние элементы, рекурсивно их проверяем.
            if ( item.children && item.children.length > 0 ) {
                item.children.forEach( child => checkChildren( child ) );
            }
        };

        // Проходим по всем элементам на доске.
        this.items.forEach( item => checkChildren( item ) );

        return circles;
    }
    //#endregion

    //#region Поддержка перетаскивания

    enableDragging() {
        let selectedElement = null;
        let offsetX = 0;
        let offsetY = 0;

        const onMouseDown = ( e ) => {
            this.printToLog( 'MouseDown on element:', e );
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Находим элемент, который мы хотим перетаскивать
            selectedElement = this.items.find( item => item.containsPoint( x, y ) );
            if ( selectedElement ) {
                this.printToLog( "onMouseDown selected element:" );
                this.printToLog( selectedElement );
                offsetX = x - selectedElement.coordinates[ 0 ].getX();
                offsetY = y - selectedElement.coordinates[ 0 ].getY();
                //this.canvas.addEventListener( 'mousemove', onMouseMove );
            }
        };

        const onMouseMove = ( e ) => {
            this.printToLog( 'MouseMove on element:', e );
            // const x = e.clientX - rect.left;
            // const y = e.clientY - rect.top;
            // var underElement = this.items.find( item => item.containsPoint( x, y ) );
            // this.printToLog( underElement );
            this.printToLog( selectedElement );
            if ( selectedElement ) {
                this.printToLog( "onMouseMove selected element:" );
                this.printToLog( selectedElement );
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Обновляем координаты элемента и всех его дочерних элементов
                selectedElement.setCoordinates( x - offsetX, y - offsetY );
                selectedElement.children.forEach( child => {
                    child.setCoordinates( x - offsetX, y - offsetY );
                } );
                //this.enableDragging();
                this.redrawAll();
            }
        };

        const onMouseLeave = ( e ) => {
            this.printToLog( 'MouseLeave on element:', e );
        };

        const onMouseUp = ( e ) => {
            this.printToLog( 'MouseUp on element:', e );
            //selectedElement = null;
            this.canvas.removeEventListener( 'mousemove', onMouseMove );
            // Также нужно удалить с каждого элемента, если они имеют свои обработчики
            this.items.forEach( item => {
                const element = document.getElementById( item.id );
                if ( element ) {
                    element.removeEventListener( 'mousemove', onMouseMove );
                }
            } );
        };


        //this.canvas.addEventListener( 'mousedown', onMouseDown );
        //this.canvas.addEventListener( 'mouseup', onMouseUp );
        //this.canvas.addEventListener( 'mouseleave', onMouseUp );
        //document.body.addEventListener( 'mousemove', onMouseMove );
        // this.items.forEach( item => {
        //     var element = document.getElementById( item.id ); // предполагаем, что у каждого элемента есть уникальный id
        //     if ( element && item instanceof Rectangle ) {
        //         this.printToLog( 'Add listener on element:', item.id );
        //         element.addEventListener( 'mouseup', onMouseUp );
        //         element.addEventListener( 'mousedown', onMouseDown );
        //         element.addEventListener( 'mouseleave', onMouseLeave );
        //         //element.addEventListener( 'mousemove', onMouseMove );
        //     }
        // } );
    }
    //#endregion

    //#region Остальные методы
    /**
    * Возвращает первый объект (или его дочерний элемент), содержащий точку с координатами (x, y), или null, если такого объекта нет.
    * @param {number} x Координата X точки для проверки.
    * @param {number} y Координата Y точки для проверки.
    * @return {DrawItem|null} Найденный объект или null, если объект не найден.
    */
    findItemContainingPoint( x, y ) {
        // Проверяем каждый элемент на доске
        for ( let item of this.items ) {
            //this.printToLog( "findItemContainingPoint", item );
            const foundItem = this.checkItemAndChildren( item, x, y );
            if ( foundItem ) {
                return foundItem;
            }
        }
        return null; // Возвращаем null, если объект не найден
    }

    /**
    * Рекурсивно проверяет элемент и его дочерние элементы на содержание точки (x, y).
    * @param {DrawItem} item Элемент для проверки.
    * @param {number} x Координата X точки для проверки.
    * @param {number} y Координата Y точки для проверки.
    * @return {DrawItem|null} Найденный объект или null, если объект не найден.
    */
    checkItemAndChildren( item, x, y ) {

        // Проверяем дочерние элементы
        for ( let child of item.children ) {
            //this.printToLog( "x:", child.getX(), "y:", child.getY() );
            if ( child instanceof DrawItem ) {
                const foundChild = this.checkItemAndChildren( child, x, y );
                if ( foundChild ) {
                    return foundChild;
                }
            }
        }
        // Проверяем сам элемент
        if ( item.containsPoint( x, y ) ) {
            return item;
        }
        return null; // Ничего не найдено
    }


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

    /**
     * Удаляет элемент по его ID.
     * @param {string} id - Уникальный идентификатор элемента для удаления.
     */
    deleteItem( id ) {
        // Находим элемент по ID
        var itemIndex = this.items.findIndex( item => item.id === id );
        if ( itemIndex === -1 ) {
            console.error( "Элемент для удаления не найден." );
            return;
        }

        const item = this.items[ itemIndex ];

        // Если элемент является Arrow, просто удаляем его
        if ( item instanceof Arrow || item instanceof Circle ) {
            this.items.splice( itemIndex, 1 );
        }
        // Если элемент является Rectangle, удаляем его и все связанные Circle и Arrow
        else if ( item instanceof Rectangle ) {
            // Удаляем сам Rectangle
            this.items.splice( itemIndex, 1 );
            item.removeFromDom();
            // Удаление связанных Circle и Arrow
            // item.children.forEach( child => {
            //     if ( child instanceof Circle )
            //         this.deleteItem( child.id );
            // } );
        }

        // Обновление списка выбранных элементов
        this.selectedItems = this.selectedItems.filter( selected => selected.id !== id );

        // Перерисовка доски
        this.redrawAll();
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
            null, [], points, width, height, text
        );


        // Для каждой точки создаем Circle и добавляем как дочерний элемент к прямоугольнику
        points.forEach( point => {
            const circle = new Circle(
                this.generateUniqueId(),
                "", [], [ point ], 15 // Диаметр окружности 10 пикселей
            );
            rectangle.addChild( circle ); // Добавляем Circle как дочерний элемент к Rectangle
            //rectangle.coordinates.push( point );
            //this.addItem( circle ); // Также добавляем Circle на доску для управления и отрисовки

        } );
        this.addItem( rectangle );
    }

    /**
     * Добавляет элемент в массив выбранных элементов.
     * Если в массиве уже есть два элемента, удаляет первый.
     * Если элемент с таким же ID уже существует, не добавляет его.
     * @param {DrawItem} item - Элемент для добавления.
     */
    addSelectedItem( item ) {
        // Проверяем, существует ли уже элемент с таким же ID в массиве выбранных элементов
        const isAlreadySelected = this.selectedItems.some( selected => selected.id === item.id );

        // Если элемент уже выбран, прекращаем выполнение функции
        if ( isAlreadySelected ) {
            this.printToLog( "Элемент с ID", item.id, "уже выбран." );
            return;
        }

        // Если в массиве уже есть два элемента, удаляем первый и снимаем с него выделение
        if ( this.selectedItems.length >= 2 ) {
            const removedItem = this.selectedItems.shift(); // Удаляем первый элемент
            removedItem.isSelected = false;
            removedItem.draw(); // Перерисовываем элемент без выделения
        }

        // Добавляем новый элемент и устанавливаем выделение
        item.isSelected = true; // Устанавливаем флаг выделения
        this.selectedItems.push( item );
        item.draw(); // Перерисовываем элемент с выделением
    }


    /**
     * Создает соединение между двумя выбранными кругами.
     */
    createConnectionFromSelectedItems() {
        if ( this.selectedItems.length === 2 && this.selectedItems.every( item => item instanceof Circle ) ) {
            const [ circle1, circle2 ] = this.selectedItems;
            const point1 = circle1.coordinates[ 0 ]; // Предполагаем, что у круга есть только одна координата
            const point2 = circle2.coordinates[ 0 ];
            this.createConnection( point1, point2 );
        } else {
            console.error( "Должно быть выбрано ровно два круга для создания соединения" );
        }
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

        this.getAllCircles().forEach( item => {
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

        // Удаление старых DOM-элементов
        this.items.forEach( item => {
            const existingElement = document.getElementById( item.id );
            if ( existingElement ) {
                //this.printToLog( "delete:", existingElement );
                existingElement.parentNode.removeChild( existingElement );
            }
        } );

        const context = this.canvas.getContext( '2d' );
        context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
        this.items.forEach( item => item.draw() );
    }
    //#endregion
}
