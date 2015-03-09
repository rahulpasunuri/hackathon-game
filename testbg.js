var game = new Phaser.Game( window.innerWidth*0.7, window.innerHeight, Phaser.CANVAS, 'phaser-demo', {preload: preload, create: create, update: update, render: render});

var player;
var greenEnemies;
var liBonus;
var blueEnemies;
var enemyBullets;
var starfield;
var starfield_copy;
var cursors;
var bank;
var shipTrail;
var explosions;
var playerDeath;
var bullets;
var fireButton;
var bulletTimer = 0;
var shields;
var score = 0;
var scoreText;
var greenEnemyLaunchTimer;
var BonusLaunchTimer;
var greenEnemySpacing = 1000;
var BonusSpacing = 1000;
var blueEnemyLaunchTimer;
var blueEnemyLaunched = false;
var blueEnemySpacing = 2500;
var bossLaunchTimer;
var bossLaunched = false;
var bossSpacing = 20000;
var bossBulletTimer = 0;
var bossYdirection = -1;
var gameOver;
var missed = 0;
var ACCLERATION = 600;
var DRAG = 400;
var MAXSPEED = 400;
var loseLevelScore = 3;
var winLevelScore = 20;
/*
function preload() {

    //  Firefox doesn't support mp3 files, so use ogg
    

}
*/
var s;
var music;
/*
function create() {

    music = game.add.audio('boden');

    music.play();

    s = game.add.sprite(game.world.centerX, game.world.centerY, 'disk');
    s.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(changeVolume, this);

}

*/

function changeVolume(pointer) {

    if (pointer.y < 300)
    {
        music.volume += 0.1;
    }
    else
    {
        music.volume -= 0.1;
    }

}

function update() {
    s.rotation += 0.01;
}

function render() {
    //game.debug.soundInfo(music, 20, 32);
}


function preload() {
    
    //music
    game.load.audio('boden', ['music/rasna.mp3']);
    
    //game.load.image('starfield', 'assets/background-new.png');
    game.load.image('starfield', 'assets/background.png');
    game.load.image('ship', 'assets/player.png');
    game.load.image('bullet', 'assets/heart.png');
    
    game.load.image('bonus-image', 'assets/smileys/bigsmile.svg');
    game.load.image('smile', 'people/smiling_person1.png');
    game.load.image('enemy-green', 'people/sad_person1.png');
    game.load.image('enemy-blue', 'people/crying_person1.png');
    game.load.image('blueEnemyBullet', 'assets/enemy-blue-bullet.png');
    game.load.spritesheet('explosion', 'assets/explode.png', 128, 128);
    game.load.bitmapFont('spacefont', 'assets/spacefont/spacefont.png', 'assets/spacefont/spacefont.xml');  
    game.load.image('boss', 'assets/boss.png');
    game.load.image('deathRay', 'assets/death-ray.png');
}

function create() {
    
    
    //code for music
    music = game.add.audio('boden');
    music.volume=0.4;
    music.play();

    s = game.add.sprite(game.world.centerX, game.world.centerY, 'disk');
    s.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(changeVolume, this);

    //  The scrolling starfield background
    //starfield = game.add.tileSprite(0, 0, window.innerWidth*0.7, window.innerHeight, 'starfield');
    starfield = game.add.sprite( window.innerWidth*0.7, window.innerHeight, 'starfield');
    starfield.x = 0;
    starfield.y = 0;
    starfield.height = game.height;
    starfield.width = game.width;
    starfield.smoothed = false;
    
    starfield_copy = game.add.sprite( window.innerWidth*0.7, -window.innerHeight, 'starfield');
    starfield_copy.x = 0;
    starfield_copy.y = -innerHeight;
    starfield_copy.height = game.height;
    starfield_copy.width = game.width;
    starfield_copy.smoothed = false;
    
    
    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  The hero!
    player = game.add.sprite(0.4*window.innerWidth, 0.9*window.innerHeight, 'ship');
    player.health = 100;
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
    player.body.drag.setTo(DRAG, DRAG);
    player.weaponLevel = 1
    player.events.onKilled.add(function(){
        shipTrail.kill();
    });
    player.events.onRevived.add(function(){
        shipTrail.start(false, 5000, 10);
    });

    //  The baddies!
    greenEnemies = game.add.group();
    greenEnemies.enableBody = true;
    greenEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    greenEnemies.createMultiple(1, 'enemy-green');
    greenEnemies.setAll('anchor.x', 0.5);
    greenEnemies.setAll('anchor.y', 0.5);
    greenEnemies.setAll('scale.x', 0.5);
    greenEnemies.setAll('scale.y', 0.5);
    greenEnemies.setAll('angle', 360);
    greenEnemies.forEach(function(enemy){
        //addEnemyEmitterTrail(enemy);
        enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4);
        enemy.damageAmount = 20;
        enemy.events.onKilled.add(function(){
            //enemy.trail.kill();
        });
    });
   game.time.events.add(1000, launchGreenEnemy); 
    
    //bonus code:
    liBonus = game.add.group();
    liBonus.enableBody = true;
    liBonus.physicsBodyType = Phaser.Physics.ARCADE;
    liBonus.createMultiple(2, 'bonus-image');
    liBonus.setAll('anchor.x', 0.5);
    liBonus.setAll('anchor.y', 0.5);
    liBonus.setAll('scale.x', 0.5);
    liBonus.setAll('scale.y', 0.5);
    liBonus.setAll('angle', 360);
    liBonus.forEach(function(bonus){
        //addEnemyEmitterTrail(bonus);
        bonus.body.setSize(bonus.width * 3 / 4, bonus.height * 3 / 4);
        bonus.damageAmount = 20;
        bonus.events.onKilled.add(function(){
            //bonus.trail.kill();
        });
    });
    
    game.time.events.add(1000, launchBonus);

    //  Blue enemy's bullets
    blueEnemyBullets = game.add.group();
    blueEnemyBullets.enableBody = true;
    blueEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    blueEnemyBullets.createMultiple(30, 'blueEnemyBullet');
    blueEnemyBullets.callAll('crop', null, {x: 90, y: 0, width: 90, height: 70});
    blueEnemyBullets.setAll('alpha', 0.9);
    blueEnemyBullets.setAll('anchor.x', 0.5);
    blueEnemyBullets.setAll('anchor.y', 0.5);
    blueEnemyBullets.setAll('outOfBoundsKill', true);
    blueEnemyBullets.setAll('checkWorldBounds', true);
    blueEnemyBullets.forEach(function(enemy){
        enemy.body.setSize(20, 20);
    });

    //  More baddies!
    blueEnemies = game.add.group();
    blueEnemies.enableBody = true;
    blueEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    blueEnemies.createMultiple(1, 'enemy-blue');
    blueEnemies.setAll('anchor.x', 0.5);
    blueEnemies.setAll('anchor.y', 0.5);
    blueEnemies.setAll('scale.x', 0.5);
    blueEnemies.setAll('scale.y', 0.5);
    blueEnemies.setAll('angle', 360);
    blueEnemies.forEach(function(enemy){
        enemy.damageAmount = 40;
    });
   game.time.events.add(1000, launchBlueEnemy); 
    //  The boss
    boss = game.add.sprite(0, 0, 'boss');
    boss.exists = false;
    boss.alive = false;
    boss.anchor.setTo(0.5, 0.5);
    boss.damageAmount = 50;
    boss.angle = 180;
    boss.scale.x = 0.6;
    boss.scale.y = 0.6;
    game.physics.enable(boss, Phaser.Physics.ARCADE);
    boss.body.maxVelocity.setTo(100, 80);
    boss.dying = false;
    boss.finishOff = function() {
        if (!boss.dying) {
            boss.dying = true;
            bossDeath.x = boss.x;
            bossDeath.y = boss.y;
            bossDeath.start(false, 1000, 50, 20);
            //  kill boss after explotions
            game.time.events.add(1000, function(){
                var explosion = explosions.getFirstExists(false);
                var beforeScaleX = explosions.scale.x;
                var beforeScaleY = explosions.scale.y;
                var beforeAlpha = explosions.alpha;
                explosion.reset(boss.body.x + boss.body.halfWidth, boss.body.y + boss.body.halfHeight);
                explosion.alpha = 0.4;
                explosion.scale.x = 3;
                explosion.scale.y = 3;
                
                /* killing animation..
                var animation = explosion.play('explosion', 30, false, true);
                animation.onComplete.addOnce(function(){
                    explosion.scale.x = beforeScaleX;
                    explosion.scale.y = beforeScaleY;
                    explosion.alpha = beforeAlpha;
                });
                */
                boss.kill();
                booster.kill();
                boss.dying = false;
                bossDeath.on = false;
                //  queue next boss
                bossLaunchTimer = game.time.events.add(game.rnd.integerInRange(bossSpacing, bossSpacing + 5000), launchBoss);
            });

            //  reset pacing for other enemies
            blueEnemySpacing = 2500;
            greenEnemySpacing = 1000;

            BonusSpacing = 1000;
            //  give some bonus health
            player.health = Math.min(100, player.health + 40);
            shields.render();
        }
    };

    //  Boss death ray
    function addRay(leftRight) {
        var ray = game.add.sprite(leftRight * boss.width * 0.75, 0, 'deathRay');
        ray.alive = false;
        ray.visible = false;
        boss.addChild(ray);
        ray.crop({x: 0, y: 0, width: 40, height: 40});
        ray.anchor.x = 0.5;
        ray.anchor.y = 0.5;
        ray.scale.x = 2.5;
        ray.damageAmount = boss.damageAmount;
        game.physics.enable(ray, Phaser.Physics.ARCADE);
        ray.body.setSize(ray.width / 5, ray.height / 4);
        ray.update = function() {
            this.alpha = game.rnd.realInRange(0.6, 1);
        };
        boss['ray' + (leftRight > 0 ? 'Right' : 'Left')] = ray;
    }
    addRay(1);
    addRay(-1);
    //  need to add the ship texture to the group so it renders over the rays
    var ship = game.add.sprite(0, 0, 'boss');
    ship.anchor = {x: 0.5, y: 0.5};
    boss.addChild(ship);

    boss.fire = function() {
        if (game.time.now > bossBulletTimer) {
            var raySpacing = 3000;
            var chargeTime = 1500;
            var rayTime = 1500;

            function chargeAndShoot(side) {
                ray = boss['ray' + side];
                ray.name = side
                ray.revive();
                ray.y = 80;
                ray.alpha = 0;
                ray.scale.y = 13;
                game.add.tween(ray).to({alpha: 1}, chargeTime, Phaser.Easing.Linear.In, true).onComplete.add(function(ray){
                    ray.scale.y = 150;
                    game.add.tween(ray).to({y: -1500}, rayTime, Phaser.Easing.Linear.In, true).onComplete.add(function(ray){
                        ray.kill();
                    });
                });
            }
            chargeAndShoot('Right');
            chargeAndShoot('Left');

            bossBulletTimer = game.time.now + raySpacing;
        }
    };

    boss.update = function() {
      if (!boss.alive) return;

      boss.rayLeft.update();
      boss.rayRight.update();

      if (boss.y > 140) {
        boss.body.acceleration.y = -50;
      }
      if (boss.y < 140) {
        boss.body.acceleration.y = 50;
      }
      if (boss.x > player.x + 50) {
        boss.body.acceleration.x = -50;
      } else if (boss.x < player.x - 50) {
        boss.body.acceleration.x = 50;
      } else {
        boss.body.acceleration.x = 0;
      }

      //  Squish and rotate boss for illusion of "banking"
      var bank = boss.body.velocity.x / MAXSPEED;
      boss.scale.x = 0.6 - Math.abs(bank) / 3;
      boss.angle = 180 - bank * 20;

      booster.x = boss.x + -5 * bank;
      booster.y = boss.y + 10 * Math.abs(bank) - boss.height / 2;

      //  fire if player is in target
      var angleToPlayer = game.math.radToDeg(game.physics.arcade.angleBetween(boss, player)) - 90;
      var anglePointing = 180 - Math.abs(boss.angle);
      if (anglePointing - angleToPlayer < 18) {
          boss.fire();
      }
    }

    //  boss's boosters
    booster = game.add.emitter(boss.body.x, boss.body.y - boss.height / 2);
    booster.width = 0;
    booster.makeParticles('blueEnemyBullet');
    booster.forEach(function(p){
      p.crop({x: 120, y: 0, width: 45, height: 50});
      //  clever way of making 2 exhaust trails by shifing particles randomly left or right
      p.anchor.x = game.rnd.pick([1,-1]) * 0.95 + 0.5;
      p.anchor.y = 0.75;
    });
    booster.setXSpeed(0, 0);
    booster.setRotation(0,0);
    booster.setYSpeed(-30, -50);
    booster.gravity = 0;
    booster.setAlpha(1, 0.1, 400);
    booster.setScale(0.3, 0, 0.7, 0, 5000, Phaser.Easing.Quadratic.Out);
    boss.bringToTop();

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //  Add an emitter for the ship's trail
    shipTrail = game.add.emitter(player.x, player.y + 10, 400);
    shipTrail.width = 10;
    shipTrail.makeParticles('bullet');
    shipTrail.setXSpeed(30, -30);
    shipTrail.setYSpeed(200, 180);
    shipTrail.setRotation(50,-50);
    shipTrail.setAlpha(1, 0.01, 800);
    shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    //shipTrail.start(false, 5000, 10);

    //  An explosion pool
    explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    explosions.createMultiple(30, 'explosion');
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach( function(explosion) {
        //killing animation..
        //explosion.animations.add('explosion');
    });

    //  Big explosion
    playerDeath = game.add.emitter(player.x, player.y);
    playerDeath.width = 50;
    playerDeath.height = 50;
    playerDeath.makeParticles('explosion', [0,1,2,3,4,5,6,7], 10);
    playerDeath.setAlpha(0.9, 0, 800);
    playerDeath.setScale(0.1, 0.6, 0.1, 0.6, 1000, Phaser.Easing.Quintic.Out);

    //  Big explosion for boss
    bossDeath = game.add.emitter(boss.x, boss.y);
    bossDeath.width = boss.width / 2;
    bossDeath.height = boss.height / 2;
    bossDeath.makeParticles('explosion', [0,1,2,3,4,5,6,7], 20);
    bossDeath.setAlpha(0.9, 0, 900);
    bossDeath.setScale(0.3, 1.0, 0.3, 1.0, 1000, Phaser.Easing.Quintic.Out);

    //  Shields stat
    //shields = game.add.bitmapText(game.world.width - 250, 10, 'spacefont', '' + player.health +'%', 50);
    //RAHUL
    shields = game.add.bitmapText(game.world.width - 250, 10, 'spacefont', '%', 50);
    shields.render = function () {
        //shields.text = 'Shields: ' + Math.max(player.health, 0) +'%';
    };
    shields.render();

    //  Score
    scoreText = game.add.bitmapText(10, 10, 'spacefont', '', 50);
    scoreText.render = function () {
        //scoreText.text = 'Score: ' + score;
        scoreText.text = '';
        var progress = Math.floor( score/10);
        //console.log( progress);
         $("#layerFill" + progress).parent().addClass("ins");
         if( missed >= 10)
         {
             if( progress > 0)
                $(".lost-scored").html( progress);
             else
                $(".lost-scored-msg").html("You can always check out the instructions on the right start over!")
            $(".level-lost-screen").animate({
                left:0 
            });
            $(".game-start").click();
         }
         
        if( progress >= 10)
        {
            $(".game-start").click();
            setCookie("level1", "1", 10);
            var style = { font: "65px Arial", fill: "#ff0044", align: "center" };
            //game.add.text(game.world.centerX-300, game.world.centerY-100, "You have won this Level!!", style);
            $(".level-over-screen").css("display", "block");
            $(".level-over-screen").animate({
                left:0
            })
        }
        
        
    };
    scoreText.render();

    //  Game over text
    gameOver = game.add.bitmapText(game.world.centerX, game.world.centerY, 'spacefont', 'You have won this level!', 110);
    gameOver.x = gameOver.x - gameOver.textWidth / 2;
    gameOver.y = gameOver.y - gameOver.textHeight / 3;
    gameOver.visible = false;
    
    //game.paused = true;

    $(".game-start").click( function(){
        if( game.paused == false )
            game.paused = true;
        else
            game.paused = false;

    });
    
    
     $(".game-start").click();

}

function update() {
    //  Scroll the background
   // starfield.y += 2;
    if (starfield.y > window.innerHeight) {
        starfield.y = -window.innerHeight;
        starfield.y += 2;
      } else {}
        starfield.y +=2;
        
    if (starfield_copy.y > window.innerHeight) {
        starfield_copy.y = -window.innerHeight;
        starfield_copy.y += 2;
      } else {}
        starfield_copy.y +=2;

    //  Reset the player, then check for movement keys
    player.body.acceleration.x = 0;

    if (cursors.left.isDown)
    {
        player.body.acceleration.x = -ACCLERATION;
    }
    else if (cursors.right.isDown)
    {
        player.body.acceleration.x = ACCLERATION;
    }

    var w =200;
    //  Stop at screen edges
    if (player.x > game.width - w) {
        player.x = game.width - w-10;
        player.body.acceleration.x = 0;
        player.angle=0;
        return;
    }
    else if (player.x < w) {
        player.x = w+10;
        player.angle=0;
        player.body.acceleration.x = 0;
        return;
    }
    else
    {
        //  Squish and rotate ship for illusion of "banking"
        bank = player.body.velocity.x / MAXSPEED;
        player.scale.x = 1 - Math.abs(bank) / 2;
         player.angle = bank * 30;
    }
    /*
    //  Fire bullet
    if (player.alive && (fireButton.isDown || game.input.activePointer.isDown)) {
        fireBullet();
    }
    */
    
    //disable mouse..
    if (player.alive && fireButton.isDown) {
        fireBullet();
    }

    /* disabling mouse // RAHUL
    //  Move ship towards mouse pointer
    if (game.input.x < game.width - 20 &&
        game.input.x > 20 &&
        game.input.y > 20 &&
        game.input.y < game.height - 20) {
        var minDist = 200;
        var dist = game.input.x - player.x;
        player.body.velocity.x = MAXSPEED * game.math.clamp(dist / minDist, -1, 1);
    }
    */
    

   

    //  Keep the shipTrail lined up with the ship
    shipTrail.x = player.x;

    //  Check collisions
    game.physics.arcade.overlap(player, greenEnemies, shipCollide, null, this);
    game.physics.arcade.overlap(greenEnemies, bullets, hitEnemy, null, this);

    //TODO: which of the below must be used.?
    game.physics.arcade.overlap(player, liBonus, receiveBonus, null, this);
    //game.physics.arcade.overlap(greenEnemies, liBonus, hitEnemy, null, this);

    game.physics.arcade.overlap(player, blueEnemies, shipCollide, null, this);
    game.physics.arcade.overlap(blueEnemies, bullets, hitEnemy, null, this);

    game.physics.arcade.overlap(boss, bullets, hitEnemy, bossHitTest, this);
    game.physics.arcade.overlap(player, boss.rayLeft, enemyHitsPlayer, null, this);
    game.physics.arcade.overlap(player, boss.rayRight, enemyHitsPlayer, null, this);

    //game.physics.arcade.overlap(blueEnemyBullets, player, enemyHitsPlayer, null, this);

    //  Game over?
    if (! player.alive && gameOver.visible === false) {
        gameOver.visible = true;
        gameOver.alpha = 0;
        function setResetHandlers() {
            //  The "click to restart" handler
            tapRestart = game.input.onTap.addOnce(_restart,this);
            spaceRestart = fireButton.onDown.addOnce(_restart,this);
            function _restart() {
              tapRestart.detach();
              spaceRestart.detach();
              restart();
            }
        }
        var fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();
    }
}


function fireBullet() {

    switch (player.weaponLevel) {
        case 1:
        //  To avoid them being allowed to fire too fast we set a time limit
        if (game.time.now > bulletTimer)
        {
            var BULLET_SPEED = 400;
            var BULLET_SPACING = 250;
            //  Grab the first bullet we can from the pool
            var bullet = bullets.getFirstExists(false);

            if (bullet)
            {
                //  And fire it
                //  Make bullet come out of tip of ship with right angle
                var bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
                bullet.reset(player.x + bulletOffset, player.y);
                bullet.angle = player.angle;
                game.physics.arcade.velocityFromAngle(bullet.angle - 90, BULLET_SPEED, bullet.body.velocity);
                bullet.body.velocity.x += player.body.velocity.x;

                bulletTimer = game.time.now + BULLET_SPACING;
            }
        }
        break;

        case 2:
        if (game.time.now > bulletTimer) {
            var BULLET_SPEED = 400;
            var BULLET_SPACING = 550;


            for (var i = 0; i < 3; i++) {
                var bullet = bullets.getFirstExists(false);
                if (bullet) {
                    //  Make bullet come out of tip of ship with right angle
                    var bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
                    bullet.reset(player.x + bulletOffset, player.y);
                    //  "Spread" angle of 1st and 3rd bullets
                    var spreadAngle;
                    if (i === 0) spreadAngle = -20;
                    if (i === 1) spreadAngle = 0;
                    if (i === 2) spreadAngle = 20;
                    bullet.angle = player.angle + spreadAngle;
                    game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, bullet.body.velocity);
                    bullet.body.velocity.x += player.body.velocity.x;
                }
                bulletTimer = game.time.now + BULLET_SPACING;
            }
        }
    }
}


function launchBonus()
{
    
    var BONUS_SPEED = 300;

    var bonus = liBonus.getFirstExists(false);
    if (bonus) {
        bonus.reset(game.rnd.integerInRange(0, game.width), -20);
        bonus.body.velocity.x = game.rnd.integerInRange(-300, 300);
        bonus.body.velocity.y =  BONUS_SPEED;
        bonus.body.drag.x = 100;

        //bonus.trail.start(false, 800, 1);

        //  Update function for each bonus to update rotation etc
        bonus.update = function(){
          //bonus.angle = 180 - game.math.radToDeg(Math.atan2(bonus.body.velocity.x, bonus.body.velocity.y));
        bonus.angle = game.math.radToDeg(Math.atan2(bonus.body.velocity.x, bonus.body.velocity.y));
          //bonus.trail.x = bonus.x;
          //bonus.trail.y = bonus.y -10;

          //  Kill enemies once they go off screen
          if (this.y > game.height + 200) {
            this.kill();
            this.y = -20;
          }
          
           if(this.x > game.width -200)
         {
             //
             this.x = game.width-200;
             this.body.acceleration.x = -1*this.body.acceleration.x;
             
         }
         else if(this.x<200)
         {
             this.x=200;
             this.body.acceleration.x=-1*this.body.acceleration.x;
         }
          
        }
    }

    //TEST
    //  Send another enemy soon
    BonusLaunchTimer = game.time.events.add(game.rnd.integerInRange(BonusSpacing, BonusSpacing + 1000), launchBonus);   
    
}

function launchGreenEnemy() {
    //return;
    console.log("hwewe");
    //return
    var ENEMY_SPEED = 300;

    var enemy = greenEnemies.getFirstExists(false);
    if (enemy) {
        
        enemy.damageAmount=20;
        
        enemy.reset(game.rnd.integerInRange(0, game.width), -20);
        enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
        enemy.body.velocity.y = 180;
        enemy.body.drag.x = 100;

        //enemy.trail.start(false, 800, 1);

        //  Update function for each enemy ship to update rotation etc
        enemy.update = function(){
            
          //enemyAngle
          //enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));
          enemy.angle = game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));
          //enemy.trail.x = enemy.x;
          //enemy.trail.y = enemy.y -10;

          //  Kill enemies once they go off screen
          if (this.y > game.height + 200) {
            this.kill();
            this.y = -20;
            missed+=1;
          }
          
         if(enemy.body.acceleration.x ==0 && enemy.body.x.velocity ==0)
          {
              
              enemy.body.acceleration.x = game.rnd.integerInRange(-300, 300);
          }
          else if(enemy.body.acceleration.x ==0 && enemy.body.x.velocity > 0)
          {
              enemy.body.acceleration.x = game.rnd.integerInRange(0, 300);
          }
         else if(enemy.body.acceleration.x ==0 && enemy.body.x.velocity < 0)
          {
              enemy.body.acceleration.x = game.rnd.integerInRange(-300, 0);
          }
          
          
         if(enemy.x > game.width -200)
         {
             //
             enemy.x = game.width-200;
             
             if(enemy.body.acceleration.x > 0)
             {
                 enemy.body.acceleration.x=-1*enemy.body.acceleration.x;    
             }
             
             enemy.body.velocity.x = -100;
         }
         else if(enemy.x<200)
         {
             enemy.x=200;
             if(enemy.body.acceleration <0)
             {
                enemy.body.acceleration.x=-1*enemy.body.acceleration.x;
             }
             enemy.body.velocity.x = 100;

         }
             enemy.body.acceleration.y=100;
             enemy.body.velocity.y=100;
              //enemy.body.velocity.x=180;
             enemy.body.velocity.y=180;
        }
    }

    //  Send another enemy soon
    greenEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(greenEnemySpacing, greenEnemySpacing + 1000), launchGreenEnemy);

    
}

function launchBlueEnemy() {
    var startingX = game.rnd.integerInRange(100, game.width - 100);
    var verticalSpeed = 180;
    var spread = 60;
    var frequency = 70;
    var verticalSpacing = 70;
    var numEnemiesInWave = 5;

    //  Launch wave
    for (var i =0; i < numEnemiesInWave; i++) {
        var enemy = blueEnemies.getFirstExists(false);
        if (enemy) {
            enemy.startingX = startingX;
            enemy.reset(game.width / 2, -verticalSpacing * i);
            enemy.body.velocity.y = verticalSpeed;

            //  Set up firing
            var bulletSpeed = 400;
            var firingDelay = 2000;
            enemy.bullets = 1;
            enemy.lastShot = 0;

            //  Update function for each enemy
            enemy.update = function(){
              //  Wave movement
              this.body.x = this.startingX + Math.sin((this.y) / frequency) * spread;

              //  Squish and rotate ship for illusion of "banking"
              bank = Math.cos((this.y + 60) / frequency)
              this.scale.x = 0.5 - Math.abs(bank) / 8;
              //this.angle = 180 - bank * 2;
            this.angle = bank * 2; //WORK??
            /* RAHUL
              //  Fire
              enemyBullet = blueEnemyBullets.getFirstExists(false);
              if (enemyBullet &&
                  this.alive &&
                  this.bullets &&
                  this.y > game.width / 8 &&
                  game.time.now > firingDelay + this.lastShot) {
                    this.lastShot = game.time.now;
                    this.bullets--;
                    enemyBullet.reset(this.x, this.y + this.height / 2);
                    enemyBullet.damageAmount = this.damageAmount;
                    var angle = game.physics.arcade.moveToObject(enemyBullet, player, bulletSpeed);
                    enemyBullet.angle = game.math.radToDeg(angle);
                }
            */
              //  Kill enemies once they go off screen
              if (this.y > game.height + 200) {
                this.kill();
                this.y = -20;
                missed+=1;
              }
              
            if(this.x > game.width -200)
             {
                 //
                 this.x = game.width-200;
                 this.body.acceleration.x = -1*this.body.acceleration.x;
                 this.body.velocity.x = -600;
             }
             else if(this.x<200)
             {
                 this.x=200;
                 this.body.acceleration.x=-1*this.body.acceleration.x;
                 this.body.velocity.x = 600;
             }
              
            };
        }
    }

    //  Send another wave soon
    blueEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(blueEnemySpacing, blueEnemySpacing + 4000), launchBlueEnemy);
    //blueEnemyLaunchTimer = game.time.events.add(0, launchBlueEnemy);
}

function launchBoss() {
    return; //TODO: we dont need a bigboss..
    boss.reset(game.width / 2, -boss.height);
    booster.start(false, 1000, 10);
    boss.health = 501;
    bossBulletTimer = game.time.now + 5000;
}

function addEnemyEmitterTrail(enemy) {
    return;
    var enemyTrail = game.add.emitter(enemy.x, player.y - 10, 100);
    enemyTrail.width = 10;
    enemyTrail.makeParticles('explosion', [1,2,3,4,5]);
    enemyTrail.setXSpeed(20, -20);
    enemyTrail.setRotation(50,-50);
    enemyTrail.setAlpha(0.4, 0, 800);
    enemyTrail.setScale(0.01, 0.1, 0.01, 0.1, 1000, Phaser.Easing.Quintic.Out);
    enemy.trail = enemyTrail;
}


function shipCollide(player, enemy) {
    return;
    enemy.kill();

    player.damage(enemy.damageAmount);
    shields.render();

    if (player.alive) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
    } else {
        playerDeath.x = player.x;
        playerDeath.y = player.y;
        playerDeath.start(false, 1000, 10, 10);
    }
}


function receiveBonus(player, bonus) {

    bonus.kill();
    if(score<100)
    {
        score +=  2.5;
        scoreText.render();
    }
    
    shields.render();
}


function hitEnemy(enemy, bullet) {


    console.log(enemy.health);
    if (enemy.health < 5) {
      console.log(enemy.damageAmount);
      if(enemy.damageAmount==40)
      {
          
        //this is an ultra sad face.. make him better..
        console.log("before");
        greenEnemyLaunchTimer = game.time.events.add(0, launchGreenEnemy);
        console.log("after");
        
        
        //var newEnemy = greenEnemies.getFirstExists(false);
        
        
        //new code..
        var newEnemy = game.add.sprite(0, 0, 'enemy-green');
        
        newEnemy.damageAmount=20;
        
        newEnemy.exists = false;
        newEnemy.alive = false;
        newEnemy.anchor.setTo(0.5, 0.5);
        newEnemy.damageAmount = 50;
        newEnemy.angle = 180;
        newEnemy.scale.x = 0.6;
        newEnemy.scale.y = 0.6;
        game.physics.enable(newEnemy, Phaser.Physics.ARCADE);
        newEnemy.body.maxVelocity.setTo(100, 80);
        newEnemy.body.velocity.x=100;
        newEnemy.body.velocity.y=100;
        newEnemy.dying = false;
        
        newEnemy.reset(game.rnd.integerInRange(0, game.width), -20);
        newEnemy.body.drag.x = 100;
greenEnemies.add(newEnemy);
        //enemy.trail.start(false, 800, 1);

        //  Update function for each enemy ship to update rotation etc
        newEnemy.update = function(){
            
          //enemyAngle
          //enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));
          newEnemy.angle = game.math.radToDeg(Math.atan2(newEnemy.body.velocity.x, newEnemy.body.velocity.y));
          //enemy.trail.x = enemy.x;
          //enemy.trail.y = enemy.y -10;
            
          //  Kill enemies once they go off screen
          if (this.y > game.height + 200) {
            this.kill();
            this.y = -20;
            missed+=1;
          }
          
         if(this.x > game.width -200)
         {
             //
             this.x = game.width-200;
             this.body.acceleration.x = -1*this.body.acceleration.x;
             this.body.velocity.x = -100;
             
         }
         else if(this.x<200)
         {
             this.x=200;
             this.body.acceleration.x=-1*this.body.acceleration.x;
          this.body.velocity.x = 1100;
         }
          
          
        }
        
        game.physics.arcade.overlap(newEnemy, bullets, hitEnemy, null, this);
        //end of new code..
        
        if (newEnemy) 
        {
            //newEnemy.reset(game.rnd.integerInRange(0, game.width), -20);
            newEnemy.body.velocity.x = enemy.body.velocity.x;
            newEnemy.body.velocity.y = enemy.body.velocity.y;
            newEnemy.reset(bullet.body.x + bullet.body.halfWidth, bullet.body.y + bullet.body.halfHeight);
            newEnemy.angle = enemy.angle;
            
            console.log("X acceleration is "+ enemy.body.acceleration.x);
            
            newEnemy.body.acceleration.x = 50;
            newEnemy.body.acceleration.y = 300;
            newEnemy.visible=true;
            newEnemy.body.visible=true;
            
            newEnemy.body.drag.x = 100;
    
            //newEnemy.trail.start(false, 800, 1);
        }
      

      
      }
      else
      {
          //just show a smiley face.. :)
          
                  //new code..
        var sm = game.add.sprite(0, 0, 'smile');
        
        sm.exists = false;
        sm.alive = false;
        sm.anchor.setTo(0.5, 0.5);
        sm.damageAmount = 50;
        sm.angle = 180;
        sm.scale.x = 0.6;
        sm.scale.y = 0.6;
        game.physics.enable(sm, Phaser.Physics.ARCADE);
        sm.body.maxVelocity.setTo(100, 80);
        sm.dying = false;
        
        sm.reset(game.rnd.integerInRange(0, game.width), -20);
        sm.body.drag.x = 100;
        //greenEnemies.add(newEnemy);
        //enemy.trail.start(false, 800, 1);

        //  Update function for each enemy ship to update rotation etc
        sm.update = function(){
            
          //enemyAngle
          //enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));
          sm.angle = game.math.radToDeg(Math.atan2(sm.body.velocity.x, sm.body.velocity.y));
          //enemy.trail.x = enemy.x;
          //enemy.trail.y = enemy.y -10;

         if(this.x > game.width -200)
         {
             //
             this.x = game.width-200;
             this.body.acceleration.x = -1*this.body.acceleration.x;
             this.body.velocity.x=-100;
             
         }
         else if(this.x<200)
         {
             this.x=200;
             this.body.acceleration.x=-1*sm.body.acceleration.x;
         }

          //  Kill enemies once they go off screen
          if (this.y > game.height + 200) {
            this.kill();
            this.y = -20;
          }
        }
        
        //game.physics.arcade.overlap(sm, bullets, hitEnemy, null, this);
        //end of new code..
        
        if (sm) 
        {
            //newEnemy.reset(game.rnd.integerInRange(0, game.width), -20);
            sm.body.velocity.x = enemy.body.velocity.x;
            sm.body.velocity.y = enemy.body.velocity.y;
            sm.reset(bullet.body.x + bullet.body.halfWidth, bullet.body.y + bullet.body.halfHeight);
            sm.angle = enemy.angle;
            
            sm.body.acceleration.x = 0;
            sm.body.acceleration.y = 600;
            sm.body.velocity.y = 800;
            sm.visible=true;
            sm.body.visible=true;
               setTimeout( function(){
                   sm.kill();
               }, 1000);
            
            //sm.body.drag.x = 100;
    
        }
          
      }
      
      //else
      //{
        if(enemy.finishOff)
            enemy.finishOff(); 
            
        if(enemy!=null)
        {
            enemy.kill();
        }
      //}
    } 
      //else
      //{

      //}
      player.health+=10; //TODO: RAHUl
        
    
    //else {
        //enemy.damage(enemy.damageAmount);
    //}
    bullet.kill();

    // Increase score
    //score += enemy.damageAmount * 10;
    score += 5;
    scoreText.render();

    //  Pacing

    //  Enemies come quicker as score increases
    greenEnemySpacing *= 0.9;
    BonusSpacing *= 0.9;
    //  Blue enemies come in after a score of 1000
    //if (!blueEnemyLaunched && score > 1000) {
    //chacginf logic here..RAHUL
    blueEnemyLaunched=true;
    if (!blueEnemyLaunched) {
      blueEnemyLaunched = true;
      launchBlueEnemy();
      //  Slow green enemies down now that there are other enemies
      greenEnemySpacing *= 2;
      BonusSpacing *=2;
    }

    //  Launch boss
    if (!bossLaunched && score > 15000) 
    {
        greenEnemySpacing = 5000;
        BonusSpacing = 5000;
        blueEnemySpacing = 12000;
        //  dramatic pause before boss
        game.time.events.add(2000, function(){
          bossLaunched = true;
          launchBoss();
        });
    }

    //  Weapon upgrade
    if (score > 100 && player.weaponLevel < 2) {
      player.weaponLevel = 2;
    }
    

}

//  Don't count a hit in the lower right and left quarants to aproximate better collisions
function bossHitTest(boss, bullet) {
    if ((bullet.x > boss.x + boss.width / 5 &&
        bullet.y > boss.y) ||
        (bullet.x < boss.x - boss.width / 5 &&
        bullet.y > boss.y)) {
      return false;
    } else {
      return true;
    }
}

function enemyHitsPlayer (player, bullet) {
    return;
    bullet.kill();

    player.damage(bullet.damageAmount);
    shields.render()

    if (player.alive) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
    } else {
        playerDeath.x = player.x;
        playerDeath.y = player.y;
        playerDeath.start(false, 1000, 10, 10);
    }
}






function restart () {
    //  Reset the enemies
    greenEnemies.callAll('kill');
    liBonus.callAll('kill');
    game.time.events.remove(greenEnemyLaunchTimer);
    
    game.time.events.remove(BonusLaunchTimer);
    
    game.time.events.add(1000, launchGreenEnemy);
    game.time.events.add(2000, launchBlueEnemy);
    
    game.time.events.add(1000, launchBonus);
    
    blueEnemies.callAll('kill');
    //blueEnemyBullets.callAll('kill');
    game.time.events.remove(blueEnemyLaunchTimer);
    //boss.kill();
    //booster.kill();
    game.time.events.remove(bossLaunchTimer);

    blueEnemies.callAll('kill');
    game.time.events.remove(blueEnemyLaunchTimer);
    //  Revive the player
    player.weaponLevel = 1;
    player.revive();
    player.health = 100;
    shields.render();
    score = 0;
    scoreText.render();

    //  Hide the text
    gameOver.visible = false;

    //  Reset pacing
    greenEnemySpacing = 1000;
    BonusSpacing = 1000;
    blueEnemyLaunched = false;
    bossLaunched = false;
}
