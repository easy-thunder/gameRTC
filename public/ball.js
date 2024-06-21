class Projectile {
    constructor(x, y, vx, vy, range) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.range = range;
    }
    //save

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.range -= Math.sqrt(this.vx ** 2 + this.vy ** 2);
    
        const bulletLength = 10; // Assuming the length of the bullet is 10 pixels
        const angle = Math.atan2(this.vy, this.vx);
        const behindX = this.x - Math.cos(angle) * bulletLength;
        const behindY = this.y - Math.sin(angle) * bulletLength;
        const aheadX = this.x + Math.cos(angle) * bulletLength;
        const aheadY = this.y + Math.sin(angle) * bulletLength;
    
        // console.log(`Bullet position: (${this.x}, ${this.y})`);
        // console.log(`Behind bullet position: (${behindX}, ${behindY})`);
        // console.log(`Ahead bullet position: (${aheadX}, ${aheadY})`);
    }

    draw(canvas) {
        // Draw the projectile on the canvas
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
    }
}


class Stick {
    constructor(x, y, angle, distance, fireSpeed, range) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.distance = distance;
        this.fireSpeed = fireSpeed;
        this.range = range;
        this.angleStart = angle - Math.PI / 4; // Adjust the start angle as needed
        this.angleMid = angle; // The middle angle is the same as the initial angle
        this.angleEnd = angle + Math.PI / 4; // Adjust the end angle as needed
        this.currentAngle = this.angleStart; // Initialize the current angle to the start angle
    }

    update(playerX, playerY) {
        // Update the current angle based on the fire speed
        this.currentAngle += this.fireSpeed / 30; // Assuming 60 FPS

        // If the current angle exceeds the end angle, remove the stick
        if (this.currentAngle > this.angleEnd) {
            this.range = 0;
        }

        // Calculate the stick's position based on the player's position and the current angle
        this.x = playerX + Math.cos(this.currentAngle) * this.distance;
        this.y = playerY + Math.sin(this.currentAngle) * this.distance;
    }

    draw(canvas) {
        // Draw the stick on the canvas
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(this.currentAngle) * 50, this.y + Math.sin(this.currentAngle) * 50);
        ctx.stroke();
    }
}
class Ball {



    constructor(character, x, y) {
        this.character = character;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.1;
        this.attackTimer = 0;
        this.attackTimer = 0;
        this.projectiles = [];
        this.sticks = [];
        this.swipeAngle = 0; // Track the current swipe angle
        this.swipeDirection = 1; // Track the swipe direction (1 for clockwise, -1 for counter-clockwise)



        switch (this.character) {
            case 'warrior':
                this.damage = 10;
                this.fireRate = 2;
                this.speed = 5;
                this.color = 'blue';
                this.radius = 20;
                this.attackType = 'melee';
                this.range = 50;
                this.healthPoints = 100;
                this.actionPoints = 100;
                this.healthPointRegen = 1;
                this.actionPointRegen = 1;
                this.jumpForce = -5;
                this.fireSpeed=2;
                break;
            case 'mage':
                this.damage = 20;
                this.fireRate = 2;
                this.speed = 3;
                this.color = 'red';
                this.radius = 16;
                this.attackType = 'ranged';
                this.range = 400;
                this.healthPoints = 80;
                this.actionPoints = 80;
                this.healthPointRegen = 0.5;
                this.actionPointRegen = 0.5;
                this.jumpForce = -4;
                this.fireSpeed=9;
                break;
            default:
                throw new Error(`Invalid character: ${this.character}`);
        }
    }
/////////////////////////////////////////////////////////

slash(x, y) {
    // Calculate the angle of the swipe based on the mouse position
    const angle = Math.atan2(y - this.y, x - this.x);

    // Create a new stick object with the calculated angle, distance, fire speed, and range
    const stick = new Stick(this.x, this.y, angle, this.radius, this.fireSpeed, this.range);

    // Add the stick to the list of sticks
    this.sticks.push(stick);
}




attack(x, y) {
    if (this.attackType === 'ranged' && this.attackTimer <= 0) {
        this.shootProjectile(x, y);
        this.attackTimer = this.fireRate;
    } else if (this.attackType === 'melee' && this.attackTimer <= 0) {
        this.slash(x, y);
        this.attackTimer = this.fireRate; 
    }
}

shootProjectile(x, y) {
    const angle = Math.atan2(y - this.y, x - this.x);
    const vx = Math.cos(angle) * this.fireSpeed;
    const vy = Math.sin(angle) * this.fireSpeed;
    // Create a new projectile with the calculated velocity
    const projectile = new Projectile(this.x, this.y, vx, vy, this.range);
    // Store the projectile in an array to update and draw it later
    this.projectiles.push(projectile);
}

update() {
    // Update the attack timer
    if (this.attackTimer > 0) {
        this.attackTimer -= 1/30; // Assuming 60 FPS
    }
    // Update the projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const projectile = this.projectiles[i];
        projectile.update();
        if (projectile.range <= 0) {
            this.projectiles.splice(i, 1);
        }
    }

    for (let i = this.sticks.length - 1; i >= 0; i--) {
        const stick = this.sticks[i];
        stick.update(this.x, this.y);

        // Remove the stick if its range is 0
        if (stick.range <= 0) {
            this.sticks.splice(i, 1);
        }
    }
}


}


export default Ball;