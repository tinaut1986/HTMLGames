document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const gameBoard = document.getElementById('game-board');
    const toggleThemeButton = document.getElementById('toggle-theme');
    const iconSetSelector = document.getElementById('icon-set-selector');
    const resetGameButton = document.getElementById('reset-game');
    const pairsLeftSpan = document.getElementById('pairs-left');
    const scoreSpan = document.getElementById('score');
    const messageDiv = document.getElementById('message');
    const body = document.body; // Referencia al body para tema

    // --- Definición de Sets de Iconos (18 tipos = 36 fichas) ---
    const iconSets = {
        kanji: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '東', '南', '西', '北', '中', '發', '白', '春', '夏'], // 18 tipos
        symbols: ['●', '▲', '■', '♦', '♣', '♥', '♠', '★', '✚', '♫', '☀', '☁', '☂', '❄', '♨', '☯', '⊕', '⊗'],
        emoji: ['🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥥', '🥝', '🍆', '🥑', '🥦', '🌶️', '🍄', '🍕', '🚀']
    };
    let currentIconSet = 'kanji';

    // --- Estado del Juego ---
    let tiles = [];
    let selectedTile = null;
    let pairsLeft = 0;
    let score = 0;
    let tileWidth = 50; // Mantener sincronizado con CSS (valor base)
    let tileHeight = 70; // Mantener sincronizado con CSS (valor base)

    const spreadLayout_v2 = [ // Intento 2 con 36
        // Capa 0 (Base más ancha y con "alas") - 22 fichas
        { x: 10, y: 300, z: 0 }, { x: 370, y: 300, z: 0 },
        { x: 70, y: 300, z: 0 }, { x: 130, y: 300, z: 0 }, { x: 190, y: 300, z: 0 }, { x: 250, y: 300, z: 0 }, { x: 310, y: 300, z: 0 },
        { x: 40, y: 225, z: 0 }, { x: 100, y: 225, z: 0 }, { x: 160, y: 225, z: 0 }, { x: 220, y: 225, z: 0 }, { x: 280, y: 225, z: 0 }, { x: 340, y: 225, z: 0 },
        { x: 70, y: 150, z: 0 }, { x: 130, y: 150, z: 0 }, { x: 190, y: 150, z: 0 }, { x: 250, y: 150, z: 0 }, { x: 310, y: 150, z: 0 },
        { x: 100, y: 75, z: 0 }, { x: 160, y: 75, z: 0 }, { x: 220, y: 75, z: 0 }, { x: 280, y: 75, z: 0 },

        // Capa 1 (Superpuesta) - 9 fichas -> Ahora 12 fichas
        { x: 55, y: 262.5, z: 1 }, { x: 115, y: 262.5, z: 1 }, { x: 175, y: 262.5, z: 1 }, { x: 235, y: 262.5, z: 1 }, { x: 295, y: 262.5, z: 1 }, // Añadida una más aquí para 5
        { x: 85, y: 187.5, z: 1 }, { x: 145, y: 187.5, z: 1 }, { x: 205, y: 187.5, z: 1 }, { x: 265, y: 187.5, z: 1 }, // 4 aquí
        { x: 115, y: 112.5, z: 1 }, { x: 175, y: 112.5, z: 1 }, { x: 235, y: 112.5, z: 1 }, // 3 aquí (Total 5+4+3 = 12)

        // Capa 2 (Centro superior) - 1 ficha
        { x: 175, y: 150, z: 2 },

        // Capa 3 (Pico) - 1 ficha
        { x: 175, y: 75, z: 3 } // El pico sigue ahí

        // Total: 22 + 12 + 1 + 1 = 36 fichas. ¡Correcto!
    ];

    // --- Funciones del Juego ---

    function createDeck() {
        const baseIcons = iconSets[currentIconSet];
        let deck = [...baseIcons, ...baseIcons]; // Duplica los iconos
        shuffleArray(deck);
        return deck;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function updateTileDimensions() {
        // Intentar obtener dimensiones del CSS (puede ser unreliable antes de renderizar)
        // O usar valores fijos y ajustarlos en media queries
        const firstTile = gameBoard.querySelector('.tile');
        if (firstTile) {
            tileWidth = firstTile.offsetWidth;
            tileHeight = firstTile.offsetHeight;
        } else {
            // Fallback a valores base si no hay fichas aún
            // Estos deben coincidir con el CSS base
            if (window.innerWidth <= 480) {
                tileWidth = 38; tileHeight = 53;
            } else if (window.innerWidth <= 768) {
                tileWidth = 45; tileHeight = 63;
            } else {
                tileWidth = 50; tileHeight = 70;
            }
        }
        // console.log(`Tile dimensions updated: ${tileWidth}x${tileHeight}`);
    }

    function initGame() {
        console.log("Iniciando juego...");
        gameBoard.innerHTML = '';
        tiles = [];
        selectedTile = null;
        score = 0;
        messageDiv.classList.add('hidden');

        const deck = createDeck();
        pairsLeft = deck.length / 2;

        // Ajustar coordenadas del layout si es necesario (ej. centrarlo)
        const boardWidth = gameBoard.clientWidth || 600; // Ancho estimado o medido
        const layoutWidth = Math.max(...spreadLayout_v2.map(p => p.x)) + tileWidth; // Ancho del layout
        const xOffset = Math.max(0, (boardWidth - layoutWidth) / 2); // Centrar horizontalmente

        for (let i = 0; i < deck.length; i++) {
            const pos = spreadLayout_v2[i];
            const tileData = {
                id: `tile-${i}`,
                value: deck[i],
                element: document.createElement('div'),
                x: pos.x + xOffset, // Aplicar offset
                y: pos.y,
                z: pos.z,
                isFree: false,
                isMatched: false,
            };

            const tileElement = tileData.element;
            tileElement.id = tileData.id;
            tileElement.classList.add('tile', `icon-${currentIconSet}`);
            tileElement.dataset.value = tileData.value;
            tileElement.style.left = `${tileData.x}px`;
            tileElement.style.top = `${tileData.y}px`;
            tileElement.style.zIndex = tileData.z;
            tileElement.innerHTML = tileData.value;

            tileElement.addEventListener('click', () => handleTileClick(tileData));

            tiles.push(tileData);
            gameBoard.appendChild(tileElement);
        }

        // Es importante llamar a esto DESPUÉS de añadir las fichas al DOM
        // para que las dimensiones puedan ser calculadas si es necesario.
        updateTileDimensions(); // Calcular dimensiones reales
        updateFreeStatus(); // Calcular libertad inicial
        renderBoard();      // Aplicar clases CSS iniciales
        updateGameInfo();
        console.log(`Juego iniciado con ${tiles.length} fichas. ${pairsLeft} pares.`);

        // Comprobación inicial de movimientos
        if (!hasPossibleMoves() && pairsLeft > 0) {
            console.warn("¡Layout inicial sin movimientos! Reiniciando...");
            // Podrías intentar reiniciar automáticamente o mostrar un mensaje
            // initGame(); // Cuidado con bucles infinitos
            showMessage("Distribución sin movimientos iniciales. ¡Reinicia!");
        }
    }

    // --- Lógica de Libertad (REVISADA Y MÁS ESTRICTA) ---
    function isTileFree(tile) {
        if (tile.isMatched) return false;

        // Obtener dimensiones actuales (importante si son dinámicas)
        // Si son fijas en CSS, puedes usar los valores globales tileWidth, tileHeight
        const currentTileWidth = tile.element.offsetWidth || tileWidth;
        const currentTileHeight = tile.element.offsetHeight || tileHeight;


        // 1. Check for tiles directly above (Stricter Overlap Check - Attempt 3)
        const isCovered = tiles.some(other => {
            if (other.isMatched || other.z <= tile.z) return false; // Ignorar emparejadas o misma/inferior capa

            const otherTileWidth = other.element.offsetWidth || tileWidth;
            const otherTileHeight = other.element.offsetHeight || tileHeight;
            const currentTileWidth = tile.element.offsetWidth || tileWidth;
            const currentTileHeight = tile.element.offsetHeight || tileHeight;

            // --- Comprobación de Solapamiento de Cajas Delimitadoras ---
            // ¿Hay solapamiento horizontal?
            const overlapsX = (tile.x < other.x + otherTileWidth) && (tile.x + currentTileWidth > other.x);
            // ¿Hay solapamiento vertical?
            const overlapsY = (tile.y < other.y + otherTileHeight) && (tile.y + currentTileHeight > other.y);

            // --- Comprobación Adicional de Posición Vertical ---
            // ¿Está 'other' realmente posicionada *encima* de 'tile'?
            // (Esto puede ser redundante por other.z > tile.z, pero puede ayudar en casos límite)
            // Por ejemplo, podemos requerir que el centro vertical de 'other' esté por encima del centro de 'tile'.
            const isVerticallyAbove = (other.y + otherTileHeight / 2) < (tile.y + currentTileHeight / 2);
            // O que el borde superior de 'other' esté por encima del borde superior de 'tile'
            // const isTopEdgeAbove = other.y < tile.y;


            // Considerar cubierta SI hay solapamiento en X, en Y, Y 'other' está verticalmente encima (usando centros).
            // return overlapsX && overlapsY && isVerticallyAbove;

            // *** Alternativa más simple: Considerar cubierta si hay CUALQUIER solapamiento (X e Y) ***
            // Esta es la comprobación de intersección de rectángulos estándar.
            // Si esto *aún* no funciona, el problema podría estar en las coordenadas del layout
            // o en cómo se interpretan las dimensiones.
            return overlapsX && overlapsY;

        });

        if (isCovered) {
            // console.log(`Tile ${tile.id} (${tile.value}) está CUBIERTA.`);
            return false; // Bloqueada si está cubierta
        }

        // 2. Check for blocking neighbors on the same layer (left AND right)
        // (Esta lógica se mantiene igual)
        const hasLeftNeighbor = tiles.some(other =>
            !other.isMatched &&
            other.z === tile.z &&
            other.id !== tile.id &&
            Math.abs(other.y - tile.y) < currentTileHeight * 0.75 && // Misma fila aprox
            other.x < tile.x && other.x + (other.element.offsetWidth || tileWidth) > tile.x - 5 // Solapa o toca a la izquierda
        );

        const hasRightNeighbor = tiles.some(other =>
            !other.isMatched &&
            other.z === tile.z &&
            other.id !== tile.id &&
            Math.abs(other.y - tile.y) < currentTileHeight * 0.75 && // Misma fila aprox
            other.x > tile.x && other.x < tile.x + currentTileWidth + 5 // Solapa o toca a la derecha
        );

        // Está libre si NO está cubierta Y (NO tiene vecino izquierdo O NO tiene vecino derecho)
        const isFree = !isCovered && (!hasLeftNeighbor || !hasRightNeighbor);
        // if (!isCovered) console.log(`Tile ${tile.id} (${tile.value}) - Not Covered. LeftN: ${hasLeftNeighbor}, RightN: ${hasRightNeighbor} => Free: ${isFree}`);

        return isFree;
    }

    function updateFreeStatus() {
        let changed = false;
        // console.log("Actualizando estado de libertad...");
        tiles.forEach(tile => {
            if (!tile.isMatched) {
                const currentlyFree = isTileFree(tile);
                if (tile.isFree !== currentlyFree) {
                    tile.isFree = currentlyFree;
                    changed = true;
                    // console.log(`Tile ${tile.id} (${tile.value}) ahora ${currentlyFree ? 'LIBRE' : 'BLOQUEADA'}`);
                }
            } else if (tile.isFree) { // Si estaba libre y ahora está emparejada
                tile.isFree = false;
                changed = true;
            }
        });
        if (changed) {
            // console.log("Hubo cambios en libertad, re-renderizando clases.");
            renderBoard(); // Actualizar clases CSS si hubo cambios
        }
    }

    function renderBoard() {
        // console.log("Renderizando tablero...");
        tiles.forEach(tile => {
            // Actualizar icono y clase de icono (por si cambió el set)
            tile.element.innerHTML = tile.value;
            // Quitar clases antiguas de set de iconos y añadir la actual
            tile.element.classList.remove('icon-kanji', 'icon-symbols', 'icon-emoji');
            tile.element.classList.add(`icon-${currentIconSet}`);


            if (tile.isMatched) {
                tile.element.classList.add('matched');
                tile.element.classList.remove('selected', 'not-free');
            } else {
                tile.element.classList.remove('matched');
                if (tile.isFree) {
                    tile.element.classList.remove('not-free');
                } else {
                    tile.element.classList.add('not-free');
                }
                // Aplicar/Quitar clase 'selected'
                if (selectedTile && tile.id === selectedTile.id) {
                    tile.element.classList.add('selected');
                } else {
                    tile.element.classList.remove('selected');
                }
            }
        });
    }

    function handleTileClick(tileData) {
        // console.log(`Click en: ${tileData.value} (id: ${tileData.id}), Libre: ${tileData.isFree}, Emparejada: ${tileData.isMatched}`);

        if (tileData.isMatched || !tileData.isFree) {
            // console.log("Click ignorado: Ficha no libre o ya emparejada.");
            return;
        }

        if (selectedTile && selectedTile.id === tileData.id) {
            // console.log("Deseleccionando ficha.");
            selectedTile.element.classList.remove('selected');
            selectedTile = null;
            return;
        }

        if (!selectedTile) {
            // console.log(`Seleccionando ficha: ${tileData.value}`);
            selectedTile = tileData;
            selectedTile.element.classList.add('selected');
            return;
        }

        if (selectedTile) {
            // console.log(`Comparando ${selectedTile.value} con ${tileData.value}`);
            if (selectedTile.value === tileData.value && selectedTile.id !== tileData.id) {
                // Pareja encontrada
                // console.log("¡Pareja encontrada!");
                score += 10;
                pairsLeft--;

                selectedTile.isMatched = true;
                tileData.isMatched = true;
                selectedTile.isFree = false;
                tileData.isFree = false;

                selectedTile.element.classList.add('matched');
                tileData.element.classList.add('matched');
                selectedTile.element.classList.remove('selected');

                const tempSelected = selectedTile; // Guardar referencia para logs si es necesario
                selectedTile = null;

                // Retraso para animación antes de recalcular libertad
                setTimeout(() => {
                    updateFreeStatus(); // Recalcular libertad AHORA que están marcadas como matched
                    // renderBoard(); // updateFreeStatus ya llama a renderBoard si hay cambios
                    updateGameInfo();
                    checkWinOrLose();
                }, 400); // Sincronizar con transición CSS 'matched'

            } else {
                // No son pareja
                // console.log("No son pareja. Cambiando selección.");
                selectedTile.element.classList.remove('selected');
                selectedTile = tileData;
                selectedTile.element.classList.add('selected');
            }
        }
    }

    function updateGameInfo() {
        pairsLeftSpan.textContent = pairsLeft;
        scoreSpan.textContent = score;
    }

    function hasPossibleMoves() {
        const freeTiles = tiles.filter(t => t.isFree && !t.isMatched);
        if (freeTiles.length < 2) return false;

        const valueCounts = {};
        for (const tile of freeTiles) {
            valueCounts[tile.value] = (valueCounts[tile.value] || 0) + 1;
        }

        for (const value in valueCounts) {
            if (valueCounts[value] >= 2) {
                // console.log(`Movimiento posible encontrado para valor: ${value} (Count: ${valueCounts[value]})`);
                return true; // Hay al menos un par libre que coincide
            }
        }
        // console.log("No quedan movimientos posibles.");
        return false;
    }

    function checkWinOrLose() {
        if (pairsLeft === 0) {
            showMessage("🎉 ¡Has Ganado! 🎉");
        } else if (!hasPossibleMoves()) {
            showMessage(" G A M E   O V E R \n ¡No quedan movimientos!");
        }
    }

    function showMessage(msg) {
        messageDiv.textContent = msg;
        messageDiv.classList.remove('hidden');
    }

    // --- Control de Tema ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
        localStorage.setItem('mahjongTheme', theme);
    }

    toggleThemeButton.addEventListener('click', () => {
        const currentTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(currentTheme);
    });

    // Aplicar tema guardado al cargar
    const savedTheme = localStorage.getItem('mahjongTheme') || 'light'; // Default to light
    applyTheme(savedTheme);

    // --- Control de Set de Iconos ---
    iconSetSelector.addEventListener('change', (event) => {
        currentIconSet = event.target.value;
        console.log(`Cambiando set de iconos a: ${currentIconSet}`);
        initGame(); // Reinicia el juego con el nuevo set
    });

    // --- Botón de Reinicio ---
    resetGameButton.addEventListener('click', initGame);

    // --- Adaptación al redimensionar (Opcional pero útil) ---
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            console.log("Window resized, re-calculating dimensions/layout...");
            // Podrías recalcular el layout o solo las dimensiones
            updateTileDimensions();
            // Si el layout depende mucho del tamaño, podrías necesitar re-iniciar
            // initGame(); // O una función más ligera que solo reposicione
        }, 250); // Espera un poco después de que termine el redimensionamiento
    });


    // --- Iniciar el juego ---
    initGame();

});