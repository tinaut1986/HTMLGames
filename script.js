document.addEventListener('DOMContentLoaded', () => {
    const gameList = document.getElementById('gameList');
    const nightModeToggle = document.getElementById('nightModeToggle');

    // Obtener la lista de juegos desde el archivo PHP
    fetch('get_games.php')
        .then(response => response.json())
        .then(games => {
            games.forEach(game => {
                const gameItem = document.createElement('div');
                gameItem.className = 'game-item';
                
                if (game.favicon) {
                    const favicon = document.createElement('img');
                    favicon.src = `data:image/x-icon;base64,${game.favicon}`;
                    favicon.alt = `${game.name} favicon`;
                    gameItem.appendChild(favicon);
                }
                
                const gameName = document.createElement('span');
                gameName.textContent = game.name;
                gameItem.appendChild(gameName);
                
                gameItem.addEventListener('click', () => {
                    window.location.href = `./${game.name}/index.html`;
                });
                gameList.appendChild(gameItem);
            });
        })
        .catch(error => {
            console.error('Error al obtener la lista de juegos:', error);
            gameList.innerHTML = '<p>Error al cargar los juegos. Por favor, intenta más tarde.</p>';
        });

    // Funcionalidad del modo noche
    function toggleNightMode() {
        document.body.classList.toggle('night-mode');
        const isNightMode = document.body.classList.contains('night-mode');
        localStorage.setItem('nightMode', isNightMode);
        nightModeToggle.innerHTML = isNightMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Cargar preferencia de modo noche
    const savedNightMode = localStorage.getItem('nightMode');
    if (savedNightMode === 'true') {
        toggleNightMode();
    }

    nightModeToggle.addEventListener('click', toggleNightMode);

    // Easter egg
    let clickCount = 0;
    const easterEggThreshold = 5;
    let lastClickTime = 0;

    document.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        if (currentTime - lastClickTime < 500) {
            clickCount++;
            if (clickCount === easterEggThreshold) {
                alert('¡Has descubierto el Easter egg! 🎉🥚');
                document.body.style.fontFamily = 'Comic Sans MS, cursive';
                setTimeout(() => {
                    document.body.style.fontFamily = '';
                }, 5000);
                clickCount = 0;
            }
        } else {
            clickCount = 1;
        }
        lastClickTime = currentTime;
    });
});


