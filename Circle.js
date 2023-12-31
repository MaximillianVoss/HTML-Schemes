import { DrawItem } from './DrawItem.js'; // Убедитесь, что DrawItem правильно импортирован
import { Point } from './Point.js';

export class Circle extends DrawItem {
    constructor( id, content, children, coordinates, diameter, text ) {
        super( id, content, children, coordinates, diameter, diameter ); // для окружности ширина и высота равны
        this.text = text || ''; // Текст внутри окружности
        this.radius = diameter / 2; // Радиус окружности
    }

    // Метод для отрисовки окружности
    draw() {
        if ( document.getElementById( this.id ) )
            return;
        // Создаем элемент div
        const customCircle = document.createElement( 'div' );
        customCircle.className = 'customCircle';
        customCircle.textContent = this.text;
        customCircle.id = this.id.toString();

        // Устанавливаем стили
        if ( this.coordinates.length > 0 && this.coordinates[ 0 ] instanceof Point ) {
            customCircle.style.left = ( this.coordinates[ 0 ].getX() - this.radius ) + 'px';
            customCircle.style.top = ( this.coordinates[ 0 ].getY() - this.radius ) + 'px';
        }
        customCircle.style.width = this.width + 'px';
        customCircle.style.height = this.height + 'px';
        customCircle.style.borderRadius = '50%'; // Делаем форму круглой

        // Добавляем элемент в DOM
        document.body.appendChild( customCircle );
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
