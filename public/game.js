








class Game {
    constructor(canvas, network, ball) {
        
        this.canvas = canvas;
        this.network = network;
        this.ball = ball;

        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
        


    }


    draw() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height * 0.9);
        ctx.lineTo(this.canvas.width, this.canvas.height * 0.9);
        ctx.stroke();

        // Draw your ball
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();


        

        // Draw other balls
        const otherBalls = this.network.getData('otherBalls');
        for (const userId in otherBalls) {
            const otherBall = otherBalls[userId];
            ctx.beginPath();
            ctx.arc(otherBall.x, otherBall.y, this.ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
        }
    

        for (const projectile of this.ball.projectiles) {
            projectile.draw(this.canvas);
            this.network.sendData('bulletPosition', { x: projectile.x, y: projectile.y, damage: this.ball.damage });
        }
    //////////////////////////////////
    // below is for rendering others bullets above is for rendering bullets locally.
    const otherBullets = this.network.getData('otherBullets');
    for (const otherBullet of otherBullets) {
        console.log(otherBullet.damage)
            ctx.beginPath();
            ctx.arc(otherBullet.x, otherBullet.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        }

    

    // Remove old bullet positions


////////////////////////////////

for (const stick of this.ball.sticks) {
    stick.draw(this.canvas);
    this.network.sendData('stickPosition', { x: stick.x, y: stick.y, angle: stick.currentAngle, damage: this.ball.damage });
}
//

if (this.network.getData('otherSticks')) {
    for (const stick of this.network.getData('otherSticks')) {
        const ctx = this.canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(stick.x, stick.y);
        ctx.lineTo(stick.x + Math.cos(stick.angle) * 50, stick.y + Math.sin(stick.angle) * 50);
        ctx.stroke();
    }
    // Clear the other sticks array to prevent drawing the same stick multiple times
    this.network.otherSticks = [];
}



        requestAnimationFrame(this.draw);
    }




    update() {
        this.ball.vy += this.ball.gravity;
        this.ball.y += this.ball.vy;
        this.ball.x += this.ball.vx;
        if (this.ball.y + this.ball.radius > this.canvas.height * 0.9) {
            this.ball.y = this.canvas.height * 0.9 - this.ball.radius;
            this.ball.vy = 0;
        }
    
        // Collision detection with other balls
        
        const otherBalls = this.network.getData('otherBalls');
        //collision between two balls
        for (const userId in otherBalls) {
            const otherBall = otherBalls[userId];
            const distance = Math.sqrt((this.ball.x - otherBall.x) ** 2 + (this.ball.y - otherBall.y) ** 2);
            if (distance < this.ball.radius * 2) {
                // Collision detected, move the balls apart
                const angle = Math.atan2(this.ball.y - otherBall.y, this.ball.x - otherBall.x);
                this.ball.x = otherBall.x + Math.cos(angle) * this.ball.radius * 2;
                this.ball.y = otherBall.y + Math.sin(angle) * this.ball.radius * 2;
            }
        }
        
        
        //collision between local bullet and other ball
        for (const userId in otherBalls) {
            const otherBall = otherBalls[userId];
        
            // Check for collisions with local bullets
            for (const projectile of this.ball.projectiles) {
                const distance = Math.sqrt((projectile.x - otherBall.x) ** 2 + (projectile.y - otherBall.y) ** 2);
                if (distance < this.ball.radius + 5) { // 5 is the radius of the bullet
                    console.log('Collision detected between local bullet and other player!');
                    otherBall.healthPoints -= this.ball.damage;
                    console.log('Other player healthPoints:', otherBall.healthPoints);
                    // Remove the bullet
                    this.ball.projectiles = this.ball.projectiles.filter(p => p !== projectile);
                }
            }
        }
        
        // Check for collisions with other players' bullets and local ball
        this.network.otherBullets = this.network.otherBullets.filter((bullet) => {
            const distance = Math.sqrt((bullet.x - this.ball.x) ** 2 + (bullet.y - this.ball.y) ** 2);
                if (distance < this.ball.radius + 5) {
                    console.log('Collision detected between other player\'s bullet and local player!');
                    this.ball.healthPoints -= this.ball.damage;
                    console.log('Local player healthPoints:', this.ball.healthPoints);
                }
                return this.ball.projectiles.some((projectile) => {
                    return projectile.x === bullet.x && projectile.y === bullet.y;
                });
            });
            

            for (const userId in otherBalls) {
                const otherBall = otherBalls[userId];
            
                // Check for collisions with local sticks
                for (const stick of this.ball.sticks) {
                    const stickEndX = stick.x + Math.cos(stick.currentAngle) * 50;
                    const stickEndY = stick.y + Math.sin(stick.currentAngle) * 50;
                    const distanceToStart = Math.sqrt((stick.x - otherBall.x) ** 2 + (stick.y - otherBall.y) ** 2);
                    const distanceToEnd = Math.sqrt((stickEndX - otherBall.x) ** 2 + (stickEndY - otherBall.y) ** 2);
                    const distanceToLine = Math.min(distanceToStart, distanceToEnd);
            
                    if (distanceToLine < this.ball.radius) {
                        console.log('Collision detected between local stick and other player!');
                        otherBall.healthPoints -= this.ball.damage;
                        console.log('Other player healthPoints:', otherBall.healthPoints);
                    }
                }
            }
            

            this.network.otherSticks = this.network.otherSticks.filter((stick) => {
                const stickEndX = stick.x + Math.cos(stick.angle) * 50;
                const stickEndY = stick.y + Math.sin(stick.angle) * 50;
                const distanceToStart = Math.sqrt((stick.x - this.ball.x) ** 2 + (stick.y - this.ball.y) ** 2);
                const distanceToEnd = Math.sqrt((stickEndX - this.ball.x) ** 2 + (stickEndY - this.ball.y) ** 2);
                const distanceToLine = Math.min(distanceToStart, distanceToEnd);
            
                if (distanceToLine < this.ball.radius) {
                    console.log('Collision detected between other player\'s stick and local player!');
                    this.ball.healthPoints -= stick.damage;
                    console.log('Local player healthPoints:', this.ball.healthPoints);
                }
            
                // Return true to keep the stick in the array, or false to remove it
                return true; // For now, let's keep the stick in the array
            });

            
            
            
            
            
            
            
    
        this.ball.update();
        
        this.network.sendData('ballPosition', { x: this.ball.x, y: this.ball.y, healthPoints: this.ball.healthPoints });
    
        requestAnimationFrame(this.update);
    }
    
    start() {
        this.draw();
        this.update();
    }
}

export default Game;