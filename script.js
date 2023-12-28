//  #region Глобальные переменные

var canvas = document.getElementById( 'arrowCanvas' );
var context = canvas.getContext( '2d' );
var arrows = [];
var scrollTop = 0;
var scrollLeft = 0;
var boxId = 0;
var clicked = [];
// Вызываем функцию при прокрутке страницы
window.onscroll = getScrollPosition;
let states_types = {
    "draw_arrow": 0,
    "default": 1,
    "add_new_block": 2
};
var state = states_types.default;

// #endregion

//  #region Функции

function expandPage() {
    var currentHeight = document.body.clientHeight;
    var newHeight = currentHeight + window.innerHeight; // Увеличиваем высоту на высоту видимой области
    document.body.style.height = newHeight + 'px';
    canvas.style.height = document.body.style.height;
}

function findBlockById( idBlock ) {
    let blocks = document.getElementsByClassName( 'customTextbox' );
    for ( let i = 0; i < blocks.length; ++i ) {
        let element = blocks[ i ];
        if ( element.id == idBlock )
            return element;
    }
    return undefined;
}

function drawArrow( x1, y1, x2, y2 ) {
    var angle = Math.atan2( y2 - y1, x2 - x1 );
    var arrowLength = 20;
    context.beginPath();
    context.moveTo( x1, y1 );
    context.lineTo( x2, y2 );
    context.stroke();
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

function addLink() {
    state = states_types.draw_arrow;
}

function pixelToCoords( pxData ) {
    return parseFloat( pxData.slice( 0, -2 ) );
}

function dist( v1, v2 ) {
    let x1 = v1[ 0 ], y1 = v1[ 1 ];
    let x2 = v2[ 0 ], y2 = v2[ 1 ];
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.abs( dx ) + Math.abs( dy );
}

function computeCoords( block1, block2 ) {
    if ( !block1 || !block2 ) {
        return [ 0, 0, 0, 0 ];
    }
    let x1 = pixelToCoords( block1.style.left );
    let y1 = pixelToCoords( block1.style.top );
    let w1 = pixelToCoords( block1.style.width );
    let h1 = pixelToCoords( block1.style.height );

    let x2 = pixelToCoords( block2.style.left );
    let y2 = pixelToCoords( block2.style.top );
    let w2 = pixelToCoords( block2.style.width );
    let h2 = pixelToCoords( block2.style.height );

    let vertices1 = [ [ x1 + w1 / 2.0, y1 ], [ x1 + w1 / 2.0, y1 + h1 ],
    [ x1 + w1, y1 + h1 / 2.0 ], [ x1, y1 + h1 / 2.0 ] ];

    let vertices2 = [ [ x2 + w2 / 2.0, y2 ], [ x2 + w2 / 2.0, y2 + h2 ],
    [ x2 + w2, y2 + h2 / 2.0 ], [ x2, y2 + h2 / 2.0 ] ];

    let best = [ 0, 0 ];

    for ( let i1 = 0; i1 < vertices1.length; i1++ ) {
        for ( let i2 = 0; i2 < vertices2.length; i2++ ) {
            let xy1 = vertices1[ i1 ];
            let xy2 = vertices2[ i2 ];
            if ( dist( vertices1[ best[ 0 ] ], vertices2[ best[ 1 ] ] ) > dist( xy1, xy2 ) ) {
                best = [ i1, i2 ];
            }
        }
    }

    return [ vertices1[ best[ 0 ] ][ 0 ], vertices1[ best[ 0 ] ][ 1 ],
    vertices2[ best[ 1 ] ][ 0 ], vertices2[ best[ 1 ] ][ 1 ] ];
}

function createArrowIfNeed() {
    if ( state == states_types.draw_arrow && clicked.length == 2 ) {
        arrows.push( [ clicked[ 0 ], clicked[ 1 ] ] );
        clicked = [];
        state = states_types.default;
    }
}

function drawArrows() {
    context.clearRect( 0, 0, canvas.width, canvas.height );
    for ( let arrow of arrows ) {
        let block1 = findBlockById( arrow[ 0 ] );
        let block2 = findBlockById( arrow[ 1 ] );
        let coords = computeCoords( block1, block2 );
        drawArrow( coords[ 0 ], coords[ 1 ], coords[ 2 ], coords[ 3 ] );
    }
}

function registerClickIfNeed( idBlock ) {
    if ( state != states_types.draw_arrow )
        return;
    if ( clicked.length == 0 || clicked[ clicked.length - 1 ] != idBlock ) {
        clicked.push( idBlock );
    }
}

function getScrollPosition() {
    scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
}

function createCustomTextbox( x, y, width, height, text ) {
    state = states_types.add_new_block;

    const customTextbox = document.createElement( 'div' );
    customTextbox.className = 'customTextbox';
    customTextbox.contentEditable = true;
    customTextbox.textContent = text || '';
    boxId += 1;
    customTextbox.id = boxId.toString();

    customTextbox.style.left = x + 'px';
    customTextbox.style.top = y + 'px';
    customTextbox.style.width = width + 'px';
    customTextbox.style.height = height + 'px';
    customTextbox.oncontextmenu = function () {
        alert( "(<a onclick=\"scrollToElement('" + this.id + "');\"><i><b>тык</b></i></a>)" );
        isDragging = false;
        return false;
    }

    let isDragging = false;
    let isResizing = false;
    let offsetX, offsetY, resizeStartX, resizeStartY, startWidth, startHeight;

    customTextbox.addEventListener( 'mousedown', ( e ) => {
        registerClickIfNeed( customTextbox.id );
        offsetX = -scrollLeft + e.clientX - customTextbox.getBoundingClientRect().left;
        offsetY = -scrollTop + e.clientY - customTextbox.getBoundingClientRect().top;
        startWidth = customTextbox.offsetWidth;
        startHeight = customTextbox.offsetHeight;

        if (
            e.clientX >
            customTextbox.getBoundingClientRect().left + customTextbox.offsetWidth - 10 &&
            e.clientY >
            customTextbox.getBoundingClientRect().top + customTextbox.offsetHeight - 10
        ) {
            isResizing = true;
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
        } else {
            isDragging = true;
        }

        customTextbox.style.cursor = isResizing ? 'nwse-resize' : 'grabbing';

        document.addEventListener( 'mousemove', handleMouseMove );
        document.addEventListener( 'mouseup', () => {
            drawArrows();
            isDragging = false;
            isResizing = false;
            customTextbox.style.cursor = 'grab';
            document.removeEventListener( 'mousemove', handleMouseMove );
            createArrowIfNeed();
        } );
    } );

    function handleMouseMove( e ) {
        console.log( isDragging );
        if ( isDragging ) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            customTextbox.style.left = x + 'px';
            customTextbox.style.top = y + 'px';
            drawArrows();
        } else if ( isResizing ) {
            const newWidth = startWidth + e.clientX - resizeStartX;
            const newHeight = startHeight + e.clientY - resizeStartY;
            customTextbox.style.width = newWidth + 'px';
            customTextbox.style.height = newHeight + 'px';
        }
    }

    return customTextbox;
}

function createNewTextbox( w = 300, h = 300, x = -1, y = -1, text = 'Новое поле' ) {
    let randomX = Math.random() * window.innerWidth / 2.0;
    let randomY = Math.random() * window.innerHeight / 2.0;
    if ( x < 0 ) {
        x = randomX;
    }
    if ( y < 0 ) {
        y = randomY;
    }
    const newTextbox = createCustomTextbox( x, y, w, h, text );
    document.body.appendChild( newTextbox );
}

function copyToClipboard( text ) {
    navigator.clipboard.writeText( text );
    //alert("copied to clipboard!");
}

function createTaskJson() {
    let blocks = [];
    for ( let idBlock = 0; idBlock <= boxId; idBlock++ ) {
        let block = findBlockById( idBlock.toString() );
        if ( block === undefined )
            continue;
        blocks.push( {
            "name": idBlock.toString(),
            "text": block.textContent,
            "geometry": {
                "x": pixelToCoords( block.style.left ),
                "y": pixelToCoords( block.style.top ),
                "w": pixelToCoords( block.style.width ),
                "h": pixelToCoords( block.style.height ),
            }
        } );
    }
    let pipeline = {};
    for ( let arrow of arrows ) {
        if ( !( arrow[ 0 ] in pipeline ) ) {
            pipeline[ arrow[ 0 ] ] = [];
        }
        pipeline[ arrow[ 0 ] ].push( arrow[ 1 ] );
    }
    return {
        "version": "v.0.1",
        "problem": {
            "description": ""
        },
        "structure": {
            "blocks": blocks
        },
        "pipeline": pipeline
    }
}

function loadFromJson( jsonData ) {
    for ( let block of jsonData.structure.blocks ) {
        let divBlock = createCustomTextbox( block.geometry.x, block.geometry.y,
            block.geometry.w, block.geometry.h,
            block.text );
        divBlock.id = block.name;
        document.body.appendChild( divBlock );
    }
    for ( let [ begin, ends ] of Object.entries( jsonData.pipeline ) ) {
        console.log( begin, ends );
        for ( let end of ends ) {
            arrows.push( [ begin, end ] );
        }
    }
    drawArrows();
}

// #endregion