class Controls {
    constructor(canvas, ball) {
        this.canvas = canvas;
        this.ball = ball;
        document.addEventListener('keydown', (e) => {
            if (e.key === 'a') {
                this.ball.vx = -this.ball.speed;
            } else if (e.key === 'd') {
                this.ball.vx = this.ball.speed;
            } else if (e.key === 'w' && this.ball.y === this.canvas.height * 0.9 - this.ball.radius) {
                this.ball.vy = this.ball.jumpForce;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.key === 'a' || e.key === 'd') {
                this.ball.vx = 0;
            }
        });

        let firing = false;

        document.addEventListener('mousedown', (e) => {
            firing = true;
            this.ball.attack(e.clientX, e.clientY)
        });
        
        document.addEventListener('mouseup', () => {
            firing = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (firing) {
                this.ball.attack(e.clientX, e.clientY);
                
            }
        });



    }
}

export default Controls;