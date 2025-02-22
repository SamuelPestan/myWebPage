const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const size = 20;
canvas.width = 400;
canvas.height = 400;

let snake = [{ x: 200, y: 200 }];
let direction = null; // No hay movimiento al inicio
let foodImage = new Image();
foodImage.src = "assets/apple.png"; // Asegúrate de que la ruta sea correcta

let food;
let gameRunning = true;
let gameStarted = false; // Para esperar a que el usuario presione una tecla

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("higthScore");

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

let lastTime = 0; // Tiempo del último ciclo
const speed = 100; // Velocidad del juego

foodImage.onload = function() {
    food = generateFood(); // Crear la comida después de que la imagen esté cargada
    gameStarted = true; // Permitir que el juego comience después de cargar la imagen
};

function generateFood() {
    let newFoodPosition;
    let validPosition = false;

    // Continuar generando posiciones hasta que la comida no esté en la serpiente
    while (!validPosition) {
        newFoodPosition = {
            x: Math.floor(Math.random() * (canvas.width / size)) * size,
            y: Math.floor(Math.random() * (canvas.height / size)) * size
        };

        // Verificar si la comida colisiona con la serpiente
        validPosition = !snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y);
    }

    return newFoodPosition;
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (foodImage.complete) {
        // Dibujar la imagen de la comida solo si ha terminado de cargar
        ctx.drawImage(foodImage, food.x, food.y, size, size);
    }

    // Dibujar la serpiente
    snake.forEach((segment, index) => {
        // Cambiar el color de la cabeza de la serpiente (primer segmento)
        if (index === 0) {
            ctx.fillStyle = "#3d00cc";  // Cabeza más oscura
        } else {
            ctx.fillStyle = "#5100ff";  // Cuerpo de la serpiente
        }

        ctx.fillRect(segment.x, segment.y, size, size);
        ctx.strokeStyle = "black";
        ctx.strokeRect(segment.x, segment.y, size, size);
    });
}

function update() {
    if (!gameStarted || !direction) return; // No mover si el juego no ha empezado

    let head = { ...snake[0] };

    if (direction === "RIGHT") head.x += size;
    if (direction === "LEFT") head.x -= size;
    if (direction === "UP") head.y -= size;
    if (direction === "DOWN") head.y += size;
    
    // Colisión con los bordes
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }

    // Colisión con sí misma
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Colisión con la comida
    if (head.x === food.x && head.y === food.y) {
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }

        // Actualizar el texto de los puntajes en el DOM
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;

        food = generateFood();
    } else {
        snake.pop();
    }
}

function gameOver() {
    alert("¡Game Over! Pulsa OK para reiniciar.");
    snake = [{ x: 200, y: 200 }];
    direction = null;
    food = generateFood();
    score = 0;
    scoreElement.textContent = score;
    gameRunning = true;
    gameStarted = false; // Resetear el estado del juego
}

function gameLoop(timestamp) {
    if (gameRunning) {
        const deltaTime = timestamp - lastTime;

        if (deltaTime > speed) { // Solo actualizar si ha pasado suficiente tiempo
            update();
            draw();
            lastTime = timestamp; // Actualizar el tiempo del último ciclo
        }

        requestAnimationFrame(gameLoop); // Solicitar el siguiente ciclo de animación
    }
}

document.addEventListener("keydown", event => {
    if (!gameStarted) gameStarted = true; // Activar el juego en la primera tecla

    if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// Control táctil
let touchStartX = null;
let touchStartY = null;

document.addEventListener("touchstart", event => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

document.addEventListener("touchmove", event => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Usar un umbral para evitar movimientos pequeños
    const threshold = 30; // Puedes ajustar este valor para hacerlo más sensible o menos sensible

    if (Math.abs(diffX) > threshold || Math.abs(diffY) > threshold) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0 && direction !== "LEFT") direction = "RIGHT";  // Deslizar a la derecha
            if (diffX < 0 && direction !== "RIGHT") direction = "LEFT";  // Deslizar a la izquierda
        } else {
            if (diffY > 0 && direction !== "UP") direction = "DOWN";  // Deslizar hacia abajo
            if (diffY < 0 && direction !== "DOWN") direction = "UP";  // Deslizar hacia arriba
        }

        // Evitar que el movimiento táctil continúe si el usuario deja de deslizar
        touchStartX = null;
        touchStartY = null;
    }
});

document.addEventListener("touchend", () => {
    touchStartX = null;
    touchStartY = null;
});

// evitar desplazamiento de la página
document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });

// Prevenir que se reinicie la página
window.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();  // Prevenir el gesto de pinch-to-zoom
    }
}, { passive: false });

window.addEventListener('wheel', function(event) {
    if (event.ctrlKey) {
        event.preventDefault(); // Prevenir zoom con rueda del mouse
    }
}, { passive: false });

// Iniciar el ciclo de animación
requestAnimationFrame(gameLoop);