// src/components/GameCanvas.js
import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import {initializeSocket} from "../socket";
import { useDispatch } from "react-redux";

const GameCanvas = () => {
  const gameRef = useRef(null);
  const dispatch = useDispatch();

 

  useEffect(() => {
    const socket = initializeSocket(dispatch);
    const tileSize = 16;
    let player;
    let clientId = null;
    const otherPlayers = {};

    class GameScene extends Phaser.Scene {
      constructor() {
        super({ key: "GameScene" });
        this.player = null;
        this.cursors = null;
        this.moveCooldown = 0;
        this.moveDelay = 150;
      }

      preload() {
        this.load.image(
          "tiles",
          process.env.PUBLIC_URL + "/assets/dungeon1.png"
        );
        // this.load.tilemapTiledJSON(
        //   "map",
        //   process.env.PUBLIC_URL + "/assets/map.json"
        // );
        this.load.spritesheet(
          "player",
          "https://labs.phaser.io/assets/sprites/phaser-dude.png",
          {
            frameWidth: 32,
            frameHeight: 48,
          }
        );
      }

      create() {
        const bg = this.add.image(0, 0, "tiles").setOrigin(0, 0);
        bg.setDisplaySize(
          this.sys.game.config.width,
          this.sys.game.config.height
        ); // Stretch to fit

        player = this.physics.add.sprite(tileSize * 5, tileSize * 5, "player");
        
      
        this.player = player;
        this.cameras.main.startFollow(this.player);
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();

        

        socket.onmessage = (msg) => {
          const data = JSON.parse(msg.data);
          console.log("THE DATA IS: ", data);
          if (data.type === "id"){
            clientId = data.id;
            console.log("CLIENT ID IS : ",clientId);
            socket.send(
              JSON.stringify({
                type: "join",
                id: clientId,
                x: player.x,
                y: player.y,
              })
            );
            return
          }
          if (data.type === "move" && data.id !== socket.id) {
            console.log("the other player moved")
            if (!otherPlayers[data.id]) {
              otherPlayers[data.id] = this.add.sprite(data.x, data.y, "player");
            } else {
              otherPlayers[data.id].x = data.x;
              otherPlayers[data.id].y = data.y;
            }
          }

          if (data.type === "leave") {
            if (otherPlayers[data.id]) {
              otherPlayers[data.id].destroy();
              delete otherPlayers[data.id];
            }
          }
        };

        this.cameras.main.setBounds(0, 0, tileSize * 20, tileSize * 20);
      }

      update(time, delta) {
        let moved = false;
        this.moveCooldown -= delta;

        if (this.moveCooldown <= 0) {
          if (this.cursors.left.isDown) {
            this.player.x -= tileSize;
            this.moveCooldown = this.moveDelay;
            moved = true;
          } else if (this.cursors.right.isDown) {
            this.player.x += tileSize;
            this.moveCooldown = this.moveDelay;
            moved = true;
          } else if (this.cursors.up.isDown) {
            this.player.y -= tileSize;
            this.moveCooldown = this.moveDelay;
            moved = true;
          } else if (this.cursors.down.isDown) {
            this.player.y += tileSize;
            this.moveCooldown = this.moveDelay;
            moved = true;
          }

          this.player.x = Phaser.Math.Clamp(
            this.player.x,
            this.player.width,
            tileSize * 20 - this.player.width
          );
          this.player.y = Phaser.Math.Clamp(
            this.player.y,
            this.player.height,
            tileSize * 20 - this.player.height
          );
        }
        if (moved) {
          console.log("player has moved")
          socket.send(
            JSON.stringify({
              type: "move",
              x: player.x,
              y: player.y,
              id: socket.id
            })
          );
        }
      }
    }

    if (!gameRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: 320,
        height: 320,
        parent: "game-container",
        backgroundColor: "#e0e0e0",
        pixelArt: true,
        physics: {
          default: "arcade",
          arcade: { debug: false },
        },
        scene: GameScene,
      };

      gameRef.current = new Phaser.Game(config);
    }
    return () => {
      if (gameRef.current) {
     
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [dispatch]);

  return <div id="game-container" />;
};

export default GameCanvas;
