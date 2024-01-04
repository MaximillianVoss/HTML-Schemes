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
}
