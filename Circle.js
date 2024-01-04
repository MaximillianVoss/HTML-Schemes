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
        if ( document.getElementById( this.id ) )
            return;
        // Создаем элемент div для круга
        const customCircle = document.createElement( 'div' );
        // Устанавливаем стиль в зависимости от выделения
        customCircle.className = this.isSelected ? 'customCircle selected' : 'customCircle';
        customCircle.id = this.id.toString();

        // Устанавливаем стили для круга
        if ( this.coordinates.length > 0 && this.coordinates[ 0 ] instanceof Point ) {
            customCircle.style.left = ( this.coordinates[ 0 ].getX() - this.radius ) + 'px';
            customCircle.style.top = ( this.coordinates[ 0 ].getY() - this.radius ) + 'px';
        }
        customCircle.style.width = this.radius * 2 + 'px';
        customCircle.style.height = this.radius * 2 + 'px';
        customCircle.style.borderRadius = '50%'; // Делаем форму круглой

        // Добавляем элемент круга в DOM
        document.body.appendChild( customCircle );

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
}
