import { DrawItem } from './DrawItem.js'; // Убедитесь, что DrawItem правильно импортирован
import { Point } from './Point.js';

export class Circle extends DrawItem {
    constructor( id, content, children, coordinates, diameter, text ) {
        super( id, content, children, coordinates, diameter, diameter ); // для окружности ширина и высота равны
        this.text = text || ''; // Текст внутри окружности
        this.radius = diameter / 2; // Радиус окружности
    }

    /**
     * Обновляет позицию окружности и координаты (если включен режим отладки).
     */
    updatePosition() {
        const circleElement = document.getElementById( this.id );
        if ( circleElement ) {
            circleElement.style.left = ( this.coordinates[ 0 ].getX() - this.radius ) + 'px';
            circleElement.style.top = ( this.coordinates[ 0 ].getY() - this.radius ) + 'px';
        }

        if ( this.isDebug ) {
            const coordsElement = document.getElementById( this.id + '_coords' );
            if ( coordsElement ) {
                coordsElement.textContent = `x: ${this.coordinates[ 0 ].getX()}, y: ${this.coordinates[ 0 ].getY()}`;
                coordsElement.style.left = ( this.coordinates[ 0 ].getX() + this.radius + 5 ) + 'px';
                coordsElement.style.top = ( this.coordinates[ 0 ].getY() - this.radius / 2 ) + 'px';
            }
        }
    }

    // Метод для отрисовки окружности
    draw() {
        let customCircle = document.getElementById( this.id );

        // Если элемент уже существует, обновляем его стили
        if ( customCircle ) {
            // Обновляем класс для отражения текущего состояния выделения
            customCircle.className = this.isSelected ? 'customCircle selected' : 'customCircle';
        } else {
            // Если элемент не существует, создаем новый
            customCircle = document.createElement( 'div' );
            customCircle.id = this.id.toString();
            document.body.appendChild( customCircle );
        }

        // Устанавливаем общие стили для новых и существующих элементов
        customCircle.style.left = this.coordinates.length > 0 ? ( this.coordinates[ 0 ].getX() - this.radius ) + 'px' : '0';
        customCircle.style.top = this.coordinates.length > 0 ? ( this.coordinates[ 0 ].getY() - this.radius ) + 'px' : '0';
        customCircle.style.width = this.radius * 2 + 'px';
        customCircle.style.height = this.radius * 2 + 'px';
        customCircle.style.borderRadius = '50%'; // Делаем форму круглой

        // Если включен режим отладки, добавляем или обновляем координаты рядом с кругом
        if ( this.isDebug ) {
            let coordsText = document.getElementById( this.id + '_coords' );
            if ( !coordsText ) {
                coordsText = document.createElement( 'div' );
                coordsText.id = this.id + '_coords';
                document.body.appendChild( coordsText );
            }
            coordsText.className = 'circleCoords';
            coordsText.textContent = `x: ${this.coordinates[ 0 ].getX()}, y: ${this.coordinates[ 0 ].getY()}`;
            coordsText.style.position = 'absolute';
            coordsText.style.left = ( this.coordinates[ 0 ].getX() + this.radius + 5 ) + 'px';
            coordsText.style.top = ( this.coordinates[ 0 ].getY() - this.radius / 2 ) + 'px';
        }
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
     * Проверяет, содержит ли окружность точку с заданными координатами.
     * @param {number} x Координата X точки для проверки.
     * @param {number} y Координата Y точки для проверки.
     * @return {boolean} Возвращает true, если окружность содержит точку, иначе false.
     */
    containsPoint( x, y ) {
        // Координаты центра окружности
        const centerX = this.coordinates[ 0 ].getX();
        const centerY = this.coordinates[ 0 ].getY();

        // Вычисляем расстояние от центра окружности до точки
        const distance = Math.sqrt( Math.pow( x - centerX, 2 ) + Math.pow( y - centerY, 2 ) );

        // Проверяем, находится ли точка в пределах радиуса
        return distance <= this.radius;
    }
}
