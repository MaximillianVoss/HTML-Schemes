import { DrawItem } from './DrawItem.js'; // Импортируйте DrawItem, если он находится в другом файле
import { Point } from './Point.js';

export class Rectangle extends DrawItem {
    constructor( id, content, children, coordinates, width, height, text ) {
        super( id, content, children, coordinates, width, height );
        this.text = text || ''; // Текст внутри прямоугольника
    }

    // Метод для отрисовки прямоугольника
    draw() {
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

        // Добавляем элемент в DOM
        document.body.appendChild( customTextbox );
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
