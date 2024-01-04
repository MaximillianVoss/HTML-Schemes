window.onload = function () {
    //console.clear();
    //console.log( "Была произведена очистка консоли при запуске" );
}

import { BoardManager } from './BoardManager.js';
import { Point } from './Point.js';

// Предполагается, что у вас есть элемент canvas с id="arrowCanvas" в вашем HTML.
const canvasElement = document.getElementById( 'arrowCanvas' );
const board = new BoardManager( canvasElement );

function CreatetestItems() {
    // Создаем первый прямоугольник с точками
    board.createRectangle( 50, 50, 150, 100, "First Rectangle" ); // x, y, width, height

    // Создаем второй прямоугольник с точками
    board.createRectangle( 300, 200, 150, 100, "Second Rectangle" ); // x, y, width, height


    // Получаем прямоугольники из менеджера
    var rect1 = board.getRectangleByIndex( 0 ); // Первый прямоугольник
    var rect2 = board.getRectangleByIndex( 1 ); // Второй прямоугольник

    // Создаем связь между выбранными точками
    const point1 = rect1.coordinates[ 4 ]; // Правый верхний угол первого прямоугольника
    const point2 = rect2.coordinates[ 0 ]; // Левый нижний угол второго прямоугольника

    board.createConnection( point1, point2 );
    board.printToLog( board );
    board.printToLog( board.getAllCircles() );
    // Подождите, пока все элементы будут созданы и добавлены
}
//CreatetestItems();

//#region Обработчики нажатий кнопок
function btnCreateNewSticker_Click() {
    board.printToLog( "btnCreateNewSticker_Click" );
    board.createRectangle( 50, 50, 150, 100, "Новый стикер" );
}
function btnAddTask_Click() {
    board.printToLog( "btnAddTask_Click" );
    alert( "Не реализовано" );
}
function btnAddLink_Click() {
    board.createConnectionFromSelectedItems();
}
function btnExpandPage_Click() {
    var currentHeight = document.body.clientHeight;
    var newHeight = currentHeight + window.innerHeight; // Увеличиваем высоту на высоту видимой области
    document.body.style.height = newHeight + 'px';
    canvasElement.style.height = document.body.style.height;
}
function btnLoad_Click() {
    const jsonData = prompt( 'Скопируй сюда json с данными' );
    //console.log( "Board loaded from JSON:", jsonData );
    board.deserializeFromJson( jsonData );
    board.printToLog( board );
    board.redrawAll();
}
function btnSave_Click() {
    const boardJson = board.serializeToJson();
    //console.log( "Board saved to clipboard:", boardJson );
    board.printToLog( board );

    // Создание ссылки для скачивания
    const blob = new Blob( [ boardJson ], { type: 'application/json' } );
    const url = URL.createObjectURL( blob );

    // Создание временной ссылки и ее нажатие
    const a = document.createElement( 'a' );
    a.href = url;
    a.download = 'board.json'; // Имя файла для сохранения
    document.body.appendChild( a ); // Добавляем элемент в документ
    a.click(); // Имитация нажатия на ссылку, чтобы вызвать диалог сохранения файла
    document.body.removeChild( a ); // Удаление элемента после использования
    URL.revokeObjectURL( url ); // Освобождение памяти, выделенной под URL
}


//#endregion

//#region Привиязка обработчиков кнопок на верхней панели
document.addEventListener( 'DOMContentLoaded', () => {
    // Обработчик для "Создать новый стикер"
    document.getElementById( 'btnCreateNewSticker' ).addEventListener( 'click', () => {
        btnCreateNewSticker_Click();
    } );

    // Обработчик для "Добавить условие задачи"
    document.getElementById( 'btnAddTask' ).addEventListener( 'click', () => {
        btnAddTask_Click();
    } );

    // Обработчик для "Добавить связь"
    document.getElementById( 'btnAddLink' ).addEventListener( 'click', () => {
        btnAddLink_Click();
    } );

    // Обработчик для "Расширить"
    document.getElementById( 'btnExpandPage' ).addEventListener( 'click', () => {
        btnExpandPage_Click();
    } );

    // Обработчик для "Сохранить"
    document.getElementById( 'btnSave' ).addEventListener( 'click', () => {
        btnSave_Click();
    } );

    // Обработчик для "Загрузить json данные"
    document.getElementById( 'btnLoad' ).addEventListener( 'click', () => {
        btnLoad_Click();
    } );

    // Скрыть контекстное меню при клике в любом другом месте
    document.addEventListener( 'click', function ( e ) {
        document.getElementById( 'contextMenu' ).style.display = 'none';
    } );

    document.getElementById( 'deleteItem' ).addEventListener( 'click', function () {
        const menu = document.getElementById( 'contextMenu' );
        if ( menu.currentElement ) {
            board.deleteItem( menu.currentElement.id );
            menu.style.display = 'none'; // Скрываем контекстное меню
        }
    } );

    document.getElementById( 'btnDelete' ).addEventListener( 'click', function () {
        if ( board.selectedItems && board.selectedItems.length > 0 ) {
            var lastItem = board.selectedItems[ board.selectedItems.length - 1 ];
            board.printToLog( lastItem )
            board.printToLog( board );
            board.deleteItem( lastItem.id );
            board.printToLog( board );
        }
    } );


    //#region Обработчики нажатий на странице

    document.body.addEventListener( 'mousedown', function ( e ) {
        var currentElement = board.findItemContainingPoint( e.x, e.y );
        board.printToLog( currentElement );

        if ( currentElement ) {
            // Для левой кнопки мыши (e.button === 0)
            if ( e.button === 0 ) {
                board.addSelectedItem( currentElement );
                board.printToLog( board.selectedItems );
                board.redrawAll();
            }

            // Для правой кнопки мыши (e.button === 2)
            if ( e.button === 2 ) {
                // e.preventDefault();  // Предотвращаем появление стандартного контекстного меню
                // const menu = document.getElementById( 'contextMenu' );
                // menu.style.top = `${e.pageY}px`;
                // menu.style.left = `${e.pageX}px`;
                // menu.style.display = 'block';
                // menu.currentElement = currentElement;  // Присваиваем текущий элемент меню для дальнейшего использования
                // return false;  // Для некоторых браузеров требуется явный return false для предотвращения стандартного поведения
            }
        }
    }, false );

    // Скрыть контекстное меню при клике в любом другом месте
    document.addEventListener( 'click', function ( e ) {
        if ( e.button !== 2 ) {  // Если не правая кнопка мыши
            document.getElementById( 'contextMenu' ).style.display = 'none';
        }
    } );


    document.body.onmouseup = function () {
        //board.printToLog( "document.body.onmouseup" );
        board.redrawAll();
    }

    document.body.onmousemove = function () {
        setTimeout( () => {
            //board.printToLog( "document.body.onmousemove" );
            board.redrawAll();
        }, 20 );
    }

    //#endregion
} );



//#endregion
