import { DrawItem } from './DrawItem.js'; // Убедитесь, что DrawItem правильно импортирован
import { Point } from './Point.js';

export class Arrow extends DrawItem {
    constructor( id, content, children, coordinates, canvasElement ) {
        super( id, content, children, coordinates );
        this.canvas = canvasElement; // Ссылка на элемент canvas
    }

    draw() {
        // Убедитесь, что есть достаточно координат для отрисовки стрелки
        if ( this.coordinates.length < 2 || !( this.coordinates[ 0 ] instanceof Point ) || !( this.coordinates[ 1 ] instanceof Point ) ) {
            console.error( "Not enough points to draw an arrow or points are not instances of Point!" );
            return;
        }

        // Проверяем, что элемент canvas существует и получаем его контекст
        if ( !this.canvas || !( this.canvas instanceof HTMLCanvasElement ) ) {
            console.error( "Valid canvas element not provided!" );
            return;
        }
        const context = this.canvas.getContext( '2d' );
        // Длина головки стрелки
        const arrowLength = 20;
        // Координаты начала и конца стрелки
        const x1 = this.coordinates[ 0 ].getX();
        const y1 = this.coordinates[ 0 ].getY() - 2 * arrowLength;
        const x2 = this.coordinates[ 1 ].getX();
        const y2 = this.coordinates[ 1 ].getY() - 2 * arrowLength;

        // Параметры стрелки
        const angle = Math.atan2( y2 - y1, x2 - x1 );
        // Рисуем линию стрелки
        context.beginPath();
        context.moveTo( x1, y1 );
        context.lineTo( x2, y2 );
        // Выбор цвета в зависимости от свойства isSelected
        const strokeColor = this.isSelected ? 'green' : 'black'; // Красный для выделенных, черный для остальных
        context.strokeStyle = strokeColor; // Установка цвета линии
        context.stroke();

        // Рисуем головку стрелки
        context.save();
        context.translate( x2, y2 );
        context.rotate( angle );
        context.beginPath();
        context.moveTo( 0, 0 );
        context.lineTo( -arrowLength, arrowLength / 2 );
        context.lineTo( -arrowLength, -arrowLength / 2 );
        context.closePath();
        context.fillStyle = '#000';
        context.fill();
        context.restore();
    }

    /**
    * Проверяет, содержит ли стрелка точку с заданными координатами.
    * @param {number} x Координата X точки для проверки.
    * @param {number} y Координата Y точки для проверки.
    * @return {boolean} Возвращает true, если стрелка содержит точку, иначе false.
    */
    containsPoint( x, y ) {
        this.printToLog( "containsPoint Arrow" );
        const x1 = this.coordinates[ 0 ].getX();
        const y1 = this.coordinates[ 0 ].getY();
        const x2 = this.coordinates[ 1 ].getX();
        const y2 = this.coordinates[ 1 ].getY();

        // Расстояние от точки до линии стрелки
        const distance = this.pointLineDistance( x, y, x1, y1, x2, y2 );

        // Пороговое значение для определения, находится ли точка близко к линии
        const threshold = 20; // Расстояние в пикселях

        return distance < threshold;
    }

    /**
     * Вычисляет расстояние от точки до линии, заданной двумя точками.
     * @param {number} px Координата X точки.
     * @param {number} py Координата Y точки.
     * @param {number} x1 Координата X первой точки линии.
     * @param {number} y1 Координата Y первой точки линии.
     * @param {number} x2 Координата X второй точки линии.
     * @param {number} y2 Координата Y второй точки линии.
     * @return {number} Наименьшее расстояние от точки до линии.
     */
    pointLineDistance( px, py, x1, y1, x2, y2 ) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        const param = lenSq !== 0 ? dot / lenSq : -1;

        let xx, yy;

        if ( param < 0 ) {
            xx = x1;
            yy = y1;
        } else if ( param > 1 ) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;

        return Math.sqrt( dx * dx + dy * dy );
    }

    /**
    * Преобразует экземпляр Arrow в объект для сериализации.
    * @return {object} Объект, представляющий Arrow.
    */
    serialize() {
        return {
            type: 'Arrow', // Добавляем тип для идентификации при десериализации
            id: this.id,
            content: this.content, // Это может быть ID другого DrawItem или просто текст
            children: this.children.map( child => child.serialize() ), // Рекурсивная сериализация дочерних элементов
            coordinates: this.coordinates.map( coord => coord.serialize() ) // Сериализация координат
            // Свойство 'canvas' опущено, так как оно не может быть сериализовано
        };
    }

    /**
     * Создает новый экземпляр Arrow из данных JSON.
     * @param {object} data - Объект с данными для десериализации.
     * @param {HTMLCanvasElement} canvasElement - Элемент canvas, к которому будет привязана стрелка.
     * @return {Arrow} Новый экземпляр Arrow.
     */
    static deserialize( data, canvasElement ) {
        if ( !data || !data.id || !data.coordinates ) {
            throw new Error( "Invalid data for Arrow deserialization" );
        }
        const points = data.coordinates.map( coord => Point.deserialize( coord ) );

        return new Arrow( data.id, data.content, [], points, canvasElement );
    }

}
